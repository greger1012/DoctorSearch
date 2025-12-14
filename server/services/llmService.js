// LLM service for generating natural language summaries
// Supports multiple providers: Groq (recommended for public apps), OpenAI, Hugging Face

const axios = require('axios');
const { checkRateLimit } = require('./llmRateLimiter');

// Check which LLM provider is configured
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'groq'; // groq, openai, or huggingface
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Determine if LLM is available
const USE_LLM = 
  (LLM_PROVIDER === 'groq' && GROQ_API_KEY) ||
  (LLM_PROVIDER === 'openai' && OPENAI_API_KEY) ||
  (LLM_PROVIDER === 'huggingface' && HUGGINGFACE_API_KEY);

// Fallback to templates if no API key
if (!USE_LLM) {
  console.log(`Note: No LLM API key configured for provider "${LLM_PROVIDER}". Using template-based summaries.`);
  console.log('To enable LLM: Set GROQ_API_KEY (recommended for public apps) or OPENAI_API_KEY');
}

/**
 * Generate AI summary using LLM
 * @param {Object} context - Context object with query, results, disease info, etc.
 * @returns {Promise<Object>} Summary object with text and highlights
 */
async function generateAISummary(context) {
  // If no API key, return null to use template fallback
  if (!USE_LLM) {
    return null;
  }

  // Check rate limits to protect account
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    console.log(`Rate limit hit: ${rateLimitCheck.reason}. Falling back to templates.`);
    return null; // Fall back to templates when rate limited
  }

  try {
    const {
      query,
      doctorTotal = 0,
      locationTotal = 0,
      contentTotal = 0,
      diseaseInfo = null,
      diseaseName = null,
      recognizedSpecialty = null,
      topSpecialties = [],
      acceptingCount = 0,
      acceptingPercent = 0,
      filters = {},
      timeRange = null,
      recognized = {}
    } = context;

    // Build context for the LLM
    let systemPrompt = `You are a helpful medical search assistant. You provide clear, natural, and informative summaries of search results for finding doctors and medical care. 
    
Your responses should be:
- Conversational and natural, not robotic
- Informative but concise
- Focused on helping users understand their search results
- Professional but approachable

Always explain what conditions or procedures are if the user searched for them.`;

    let userPrompt = `A user searched for: "${query}"\n\n`;

    // Add result counts
    const resultParts = [];
    if (doctorTotal > 0) resultParts.push(`${doctorTotal} doctor${doctorTotal !== 1 ? 's' : ''}`);
    if (locationTotal > 0) resultParts.push(`${locationTotal} location${locationTotal !== 1 ? 's' : ''}`);
    if (contentTotal > 0) resultParts.push(`${contentTotal} resource${contentTotal !== 1 ? 's' : ''}`);

    userPrompt += `Search Results: ${resultParts.join(', ')}\n\n`;

    // Add disease information if available
    // Mark if it's a procedure vs condition to help LLM prioritize
    if (diseaseInfo && diseaseName) {
      const isProcedure = diseaseName.toLowerCase().includes('surgery') || 
                         diseaseName.toLowerCase().includes('procedure') ||
                         diseaseName.toLowerCase().includes('treatment') ||
                         diseaseName.toLowerCase().includes('removal');
      
      if (isProcedure) {
        userPrompt += `NOTE: The user searched for "${query}" which matched a PROCEDURE: ${diseaseInfo.name || diseaseName}\n`;
        userPrompt += `However, they likely meant the underlying CONDITION. Try to explain the condition first, then mention the procedure.\n`;
      } else {
        userPrompt += `The user searched for a medical CONDITION: ${diseaseInfo.name || diseaseName}\n`;
      }
      
      if (diseaseInfo.description) {
        userPrompt += `Description: ${diseaseInfo.description}\n`;
      }
      if (diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0) {
        userPrompt += `Common symptoms: ${diseaseInfo.symptoms.slice(0, 5).join(', ')}\n`;
      }
      if (diseaseInfo.treatments && diseaseInfo.treatments.length > 0) {
        userPrompt += `Treatments: ${diseaseInfo.treatments.slice(0, 3).join(', ')}\n`;
      }
      if (diseaseInfo.specialties && diseaseInfo.specialties.length > 0) {
        userPrompt += `Relevant specialties: ${diseaseInfo.specialties.join(', ')}\n`;
      }
      userPrompt += '\n';
    }

    // Add specialty information
    if (recognizedSpecialty) {
      userPrompt += `The search is focused on: ${recognizedSpecialty}\n`;
    }
    if (topSpecialties.length > 0) {
      userPrompt += `Top specialties in results: ${topSpecialties.map(s => `${s.name} (${s.count} doctors)`).join(', ')}\n`;
    }

    // Add filters
    if (filters.location) {
      userPrompt += `Location filter: ${filters.location}\n`;
    }
    if (filters.acceptingPatients) {
      userPrompt += `Only showing doctors accepting new patients\n`;
    }
    if (timeRange?.label) {
      userPrompt += `Time range: ${timeRange.label}\n`;
    }

    // Add accepting patients info
    if (acceptingCount > 0) {
      userPrompt += `${acceptingCount} (${acceptingPercent}%) of doctors are accepting new patients\n`;
    }

    userPrompt += `\nGenerate a natural, conversational summary (3-5 sentences) following this EXACT order:
1. FIRST and MOST IMPORTANT: If a disease/condition was searched, start by clearly explaining what it is (e.g., "Parkinson's disease is a progressive neurological disorder that affects movement..."). This MUST come first - explain the condition itself, not procedures or treatments.
2. THEN: Mention what was found (result counts like "I found X doctors...")
3. THEN: Explain why certain specialties appear in the results and how they relate to the condition
4. THEN: Mention treatments or procedures if relevant, but only AFTER explaining the condition
5. FINALLY: Mention any relevant filters or constraints

CRITICAL RULE: Always start with explaining what the condition/disease IS. Do NOT start with procedures, treatments, or result counts. The condition explanation comes first, always.`;

    // Call LLM API based on provider
    let response;
    
    if (LLM_PROVIDER === 'groq') {
      // Groq - Fast, free tier, great for public apps
      response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant', // Fast and free
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
    } else if (LLM_PROVIDER === 'openai') {
      // OpenAI
      response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
    } else if (LLM_PROVIDER === 'huggingface') {
      // Hugging Face Inference API
      response = await axios.post(
        `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'}`,
        {
          inputs: `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // Hugging Face can be slower
        }
      );
      
      // Hugging Face returns different format
      const hfText = Array.isArray(response.data) 
        ? response.data[0]?.generated_text 
        : response.data?.generated_text;
      
      if (hfText) {
        return {
          text: hfText.trim(),
          highlights: context.highlights || {}
        };
      }
      return null;
    }

    const summaryText = response.data.choices[0]?.message?.content?.trim();
    
    if (!summaryText) {
      return null; // Fall back to templates
    }

    return {
      text: summaryText,
      highlights: context.highlights || {}
    };

  } catch (error) {
    console.error('LLM API error:', error.response?.data || error.message);
    // Fall back to templates on error
    return null;
  }
}

/**
 * Generate disease explanation using LLM
 * @param {Object} diseaseInfo - Disease information object
 * @param {string} query - Original search query
 * @param {string} diseaseName - Display name of disease
 * @returns {Promise<string|null>} Explanation text or null to use template
 */
async function generateDiseaseExplanation(diseaseInfo, query, diseaseName) {
  if (!USE_LLM || !diseaseInfo) {
    return null;
  }

  // Check rate limits
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    return null; // Fall back to templates when rate limited
  }

  try {
    const systemPrompt = `You are a helpful medical assistant. Explain medical conditions in a clear, natural, and informative way.`;

    const userPrompt = `A user searched for: "${query}"

They're looking for information about: ${diseaseInfo.name || diseaseName}

Available information:
${diseaseInfo.description ? `Description: ${diseaseInfo.description}\n` : ''}
${diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0 ? `Symptoms: ${diseaseInfo.symptoms.slice(0, 5).join(', ')}\n` : ''}
${diseaseInfo.treatments && diseaseInfo.treatments.length > 0 ? `Treatments: ${diseaseInfo.treatments.slice(0, 3).join(', ')}\n` : ''}
${diseaseInfo.specialties && diseaseInfo.specialties.length > 0 ? `Relevant specialties: ${diseaseInfo.specialties.join(', ')}\n` : ''}

Generate a natural, conversational explanation (2-3 sentences) that:
1. Clearly explains what ${diseaseInfo.name || diseaseName} is
2. Mentions key symptoms or characteristics
3. Explains why certain medical specialties treat this condition
4. Sounds natural and helpful, not robotic`;

    // Call LLM API based on provider
    let response;
    
    if (LLM_PROVIDER === 'groq') {
      response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );
    } else if (LLM_PROVIDER === 'openai') {
      response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );
    } else if (LLM_PROVIDER === 'huggingface') {
      response = await axios.post(
        `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'}`,
        {
          inputs: `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      const hfText = Array.isArray(response.data) 
        ? response.data[0]?.generated_text 
        : response.data?.generated_text;
      
      return hfText ? hfText.trim() : null;
    }

    return response.data.choices[0]?.message?.content?.trim() || null;

  } catch (error) {
    console.error('LLM disease explanation error:', error.response?.data || error.message);
    return null; // Fall back to templates
  }
}

module.exports = {
  generateAISummary,
  generateDiseaseExplanation,
  USE_LLM
};


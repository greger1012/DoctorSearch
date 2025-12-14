// String utility functions - used for query parsing and text processing

// Escapes regex special chars so we can safely use user input in regex
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Convert to title case
function toTitleCase(value = '') {
  return value
    .split(' ')
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}

/**
 * Check if any keywords are in the text
 * @param {string} text 
 * @param {string[]} keywords 
 * @returns {boolean}
 */
function containsKeyword(text = '', keywords = []) {
  const lowered = text.toLowerCase();
  return keywords.some(keyword => lowered.includes(keyword));
}

// Clean up query strings - remove extra spaces
function cleanseQueryString(value) {
  return (value || '').trim().replace(/\s+/g, ' ');
}

// Handle boolean values that might come as strings from query params
function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

module.exports = {
  escapeRegExp,
  toTitleCase,
  containsKeyword,
  cleanseQueryString,
  normalizeBoolean
};


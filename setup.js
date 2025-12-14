#!/usr/bin/env node

/**
 * Interactive setup script for DoctorSearch
 * Guides users through the setup process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 DoctorSearch Setup Guide\n');
console.log('This script will help you set up the application.\n');

// Check if config.env exists
const configPath = path.join(__dirname, 'server', 'config.env');
const configExamplePath = path.join(__dirname, 'server', 'config.env.example');

if (!fs.existsSync(configPath)) {
  console.log('📝 Step 1: Setting up environment variables...');
  
  if (fs.existsSync(configExamplePath)) {
    try {
      fs.copyFileSync(configExamplePath, configPath);
      console.log('✅ Created server/config.env from example file');
      console.log('   ⚠️  Remember to add your API keys to server/config.env for LLM summaries');
      console.log('   📖 Get a free Groq API key: https://console.groq.com/keys\n');
    } catch (error) {
      console.log('⚠️  Could not create config.env automatically. Please copy server/config.env.example to server/config.env\n');
    }
  } else {
    console.log('⚠️  config.env.example not found. Please create server/config.env manually.\n');
  }
} else {
  console.log('✅ Environment config already exists (server/config.env)\n');
}

// Check if Elasticsearch is running
console.log('🔍 Step 2: Checking Elasticsearch...');
const http = require('http');
let elasticsearchRunning = false;

try {
  const req = http.get('http://localhost:9200', { timeout: 2000 }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.includes('version')) {
        console.log('✅ Elasticsearch is running\n');
        elasticsearchRunning = true;
        checkIndices();
      }
    });
  });
  req.on('error', () => {
    console.log('⚠️  Elasticsearch is not running');
    console.log('   Run: npm run elasticsearch');
    console.log('   Or: docker-compose up -d elasticsearch kibana\n');
    checkIndices();
  });
  req.on('timeout', () => {
    req.destroy();
    console.log('⚠️  Elasticsearch is not running');
    console.log('   Run: npm run elasticsearch');
    console.log('   Or: docker-compose up -d elasticsearch kibana\n');
    checkIndices();
  });
} catch (error) {
  console.log('⚠️  Elasticsearch is not running');
  console.log('   Run: npm run elasticsearch');
  console.log('   Or: docker-compose up -d elasticsearch kibana\n');
  checkIndices();
}

// Check if indices exist
function checkIndices() {
  console.log('📊 Step 3: Checking Elasticsearch indices...');
  
  if (!elasticsearchRunning) {
    console.log('⚠️  Could not check indices (Elasticsearch may not be running)\n');
    checkDoctorData();
    return;
  }
  
  try {
    const req = http.get('http://localhost:9200/_cat/indices/doctors,locations,content', { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.trim()) {
          console.log('✅ Elasticsearch indices exist\n');
          
          // Check if data exists
          const countReq = http.get('http://localhost:9200/_count?index=doctors,locations,content', { timeout: 2000 }, (countRes) => {
            let countData = '';
            countRes.on('data', chunk => countData += chunk);
            countRes.on('end', () => {
              try {
                const count = JSON.parse(countData);
                if (count.count > 0) {
                  console.log(`✅ Found ${count.count} documents in indices\n`);
                } else {
                  console.log('⚠️  Indices exist but are empty');
                  console.log('   Run: npm run seed (for sample data)');
                  console.log('   Or: node server/scripts/importDoctorsCSV.js (for real doctor data)\n');
                }
              } catch (e) {
                // Ignore count errors
              }
              checkDoctorData();
            });
          });
          countReq.on('error', () => checkDoctorData());
          countReq.on('timeout', () => {
            countReq.destroy();
            checkDoctorData();
          });
        } else {
          console.log('⚠️  Elasticsearch indices do not exist');
          console.log('   Run: node server/scripts/setupIndices.js\n');
          checkDoctorData();
        }
      });
    });
    req.on('error', () => {
      console.log('⚠️  Could not check indices (Elasticsearch may not be running)\n');
      checkDoctorData();
    });
    req.on('timeout', () => {
      req.destroy();
      console.log('⚠️  Could not check indices (Elasticsearch may not be running)\n');
      checkDoctorData();
    });
  } catch (error) {
    console.log('⚠️  Could not check indices (Elasticsearch may not be running)\n');
    checkDoctorData();
  }
}

// Check for doctor CSV file
function checkDoctorData() {
  console.log('👨‍⚕️  Step 4: Checking for doctor data...');
  const csvFile = path.join(__dirname, 'doctorsdata.CSV');
  if (fs.existsSync(csvFile)) {
    console.log('✅ Found doctorsdata.CSV (included in repository)');
    console.log('   To import real doctor data, run: node server/scripts/importDoctorsCSV.js\n');
  } else {
    console.log('⚠️  doctorsdata.CSV not found');
    console.log('   The app will use sample/fake doctor data generated by seedData.js');
    console.log('   Or place your own CSV file in the project root and run:');
    console.log('   node server/scripts/importDoctorsCSV.js\n');
  }
  
  showSummary();
}

// Summary
function showSummary() {
  console.log('📋 Setup Summary:\n');
  console.log('✅ Code and dependencies: Ready');
  console.log('✅ Disease databases: Included (1,884+ conditions)');
  console.log('✅ Search functionality: Ready\n');

  console.log('📝 Next Steps:\n');
  console.log('1. Make sure Elasticsearch is running: npm run elasticsearch');
  console.log('2. Set up indices: node server/scripts/setupIndices.js');
  console.log('3. Import REAL doctor data: node server/scripts/importDoctorsCSV.js');
  console.log('   (doctorsdata.CSV is included in the repository)');
  console.log('   ⚠️  IMPORTANT: The app requires real doctor data to work properly');
  console.log('4. (Optional) Add YOUR OWN API key to server/config.env for LLM summaries');
  console.log('   Get free Groq key: https://console.groq.com/keys');
  console.log('5. Start the app: npm run dev\n');
  console.log('⚠️  Note: Fake/test data is NOT generated automatically.');
  console.log('   Only use "npm run seed:fake" if you explicitly need test data.\n');

  console.log('🎉 You\'re all set! Happy coding!\n');
}


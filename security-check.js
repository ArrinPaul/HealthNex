#!/usr/bin/env node
/**
 * Security Validation Script
 * This script checks that API keys are properly configured and not exposed
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

console.log('🔐 Security Validation for Health Surveillance System\n');

// Check .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env') && gitignoreContent.includes('.env.local')) {
    log('green', '✅ .gitignore properly configured to ignore environment files');
  } else {
    log('red', '❌ .gitignore missing .env entries - API keys could be exposed!');
  }
} else {
  log('red', '❌ .gitignore file not found');
}

// Check for .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  log('green', '✅ .env file found');
  
  // Load and validate environment variables
  require('dotenv').config({ path: envPath });
  
  const requiredVars = [
    'JWT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const optionalVars = [
    'OPENWEATHER_API_KEY'
  ];
  
  console.log('\n📋 Required Environment Variables:');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log('green', `✅ ${varName}: Configured`);
    } else {
      log('red', `❌ ${varName}: Missing`);
    }
  });

  console.log('\n📋 Optional Environment Variables:');
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      log('yellow', `⚠️ ${varName}: Configured`);
    } else {
      log('gray', `ℹ️ ${varName}: Not Configured`);
    }
  });
  
} else {
  log('yellow', '⚠️  .env file not found. Copy .env.example to .env and fill in your keys');
}

// Check .env.example exists
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  log('green', '✅ .env.example template file exists');
} else {
  log('red', '❌ .env.example template file missing');
}

// Check that .env is not committed (if in git repo)
if (fs.existsSync(path.join(__dirname, '.git'))) {
  const { execSync } = require('child_process');
  try {
    const trackedFiles = execSync('git ls-files', { cwd: __dirname, encoding: 'utf8' });
    if (trackedFiles.includes('.env\n') || trackedFiles.includes('.env ')) {
      log('red', '❌ CRITICAL: .env file is tracked by git! Remove it immediately!');
      log('yellow', 'Run: git rm --cached .env');
    } else {
      log('green', '✅ .env file is not tracked by git');
    }
  } catch (error) {
    log('yellow', '⚠️  Could not check git status');
  }
}

console.log('\n🛡️  Security Summary:');
log('blue', 'API keys should only be in your local .env file');
log('blue', 'Never commit .env to version control');
log('blue', 'Use .env.example as a template for others');
log('blue', 'For production deployment, set environment variables in your hosting platform');

console.log('\n✨ Validation complete!\n');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up SkillSwap project...\n');

// Function to run commands
function runCommand(command, cwd) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    return false;
  }
}

// Function to create .env file
function createEnvFile() {
  const envContent = `MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5001`;

  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file in backend directory');
  } else {
    console.log('ℹ️  .env file already exists in backend directory');
  }
}

// Main setup process
async function setup() {
  console.log('📦 Installing backend dependencies...');
  if (!runCommand('npm install', path.join(__dirname, 'backend'))) {
    console.error('❌ Failed to install backend dependencies');
    process.exit(1);
  }

  console.log('\n📦 Installing frontend dependencies...');
  if (!runCommand('npm install', path.join(__dirname, 'frontend'))) {
    console.error('❌ Failed to install frontend dependencies');
    process.exit(1);
  }

  console.log('\n🔧 Creating environment file...');
  createEnvFile();

  console.log('\n✅ Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Make sure MongoDB is running on your system');
  console.log('2. Start the backend: cd backend && npm run server');
  console.log('3. Start the frontend: cd frontend && npm run dev');
  console.log('4. Open http://localhost:5173 in your browser');
  console.log('\n📖 For more information, see README.md');
}

setup().catch(console.error); 
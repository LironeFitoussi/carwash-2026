#!/usr/bin/env node

/**
 * Boot Script
 * 
 * This script:
 * 1. Copies .env.example to .env in both Server and Client directories (if .env doesn't exist)
 * 2. Runs npm install in both Server and Client directories
 */

import { existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const RootEnvExample = join(rootDir, '.env.example');
const RootEnv = join(rootDir, '.env');
const ServerEnvExample = join(rootDir, 'Server', '.env.example');
const ServerEnv = join(rootDir, 'Server', '.env');
const ClientEnvExample = join(rootDir, 'Client', '.env.example');
const ClientEnv = join(rootDir, 'Client', '.env');

console.log('🚀 Starting boot process...\n');

// Step 1: Copy .env.example to .env files
console.log('📋 Setting up environment files...');

// Root .env (for Docker)
if (existsSync(RootEnvExample)) {
  if (existsSync(RootEnv)) {
    console.log('   ⚠️  .env already exists, skipping...');
  } else {
    copyFileSync(RootEnvExample, RootEnv);
    console.log('   ✅ Created .env from .env.example');
  }
} else {
  console.log('   ⚠️  .env.example not found at root, skipping...');
  console.log('   💡 Create .env at root for Docker environment variables');
}

// Server .env
if (existsSync(ServerEnvExample)) {
  if (existsSync(ServerEnv)) {
    console.log('   ⚠️  Server/.env already exists, skipping...');
  } else {
    copyFileSync(ServerEnvExample, ServerEnv);
    console.log('   ✅ Created Server/.env from Server/.env.example');
  }
} else {
  console.log('   ⚠️  Server/.env.example not found, skipping...');
}

// Client .env
if (existsSync(ClientEnvExample)) {
  if (existsSync(ClientEnv)) {
    console.log('   ⚠️  Client/.env already exists, skipping...');
  } else {
    copyFileSync(ClientEnvExample, ClientEnv);
    console.log('   ✅ Created Client/.env from Client/.env.example');
  }
} else {
  console.log('   ⚠️  Client/.env.example not found, skipping...');
}

console.log('\n📦 Installing dependencies for both Server and Client in parallel...\n');

// Step 2: Install dependencies in parallel

const installServer = spawn('npm', ['install'], {
  cwd: join(rootDir, 'Server'),
  stdio: 'pipe',
  shell: true
});

const installClient = spawn('npm', ['install'], {
  cwd: join(rootDir, 'Client'),
  stdio: 'pipe',
  shell: true
});

// Handle Server output
installServer.stdout.on('data', (data) => {
  process.stdout.write(`[Server] ${data}`);
});

installServer.stderr.on('data', (data) => {
  process.stderr.write(`[Server] ${data}`);
});

// Handle Client output
installClient.stdout.on('data', (data) => {
  process.stdout.write(`[Client] ${data}`);
});

installClient.stderr.on('data', (data) => {
  process.stderr.write(`[Client] ${data}`);
});

// Wait for both to complete
try {
  await Promise.all([
    new Promise((resolve, reject) => {
      installServer.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Server npm install failed with code ${code}`));
        } else {
          resolve('Server');
        }
      });
    }),
    new Promise((resolve, reject) => {
      installClient.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Client npm install failed with code ${code}`));
        } else {
          resolve('Client');
        }
      });
    })
  ]);
  console.log('\n   ✅ All dependencies installed successfully!\n');
} catch (error) {
  console.error(`\n   ❌ ${error.message}`);
  process.exit(1);
}

console.log('✨ Boot process completed successfully!');
console.log('\n📝 Next steps:');
console.log('   1. Edit .env at root with your Auth0 credentials (REQUIRED for Docker)');
console.log('   2. Edit Server/.env with your actual values (if running without Docker)');
console.log('   3. Edit Client/.env with your actual values (if running without Docker)');
console.log('   4. Run "npm run dev" to start with Docker (recommended)');
console.log('   OR run "npm run dev" in Server/ and Client/ separately (without Docker)\n');


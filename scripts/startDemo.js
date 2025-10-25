#!/usr/bin/env node

/**
 * Demo startup script for Smart Plant Tracker
 * This script starts all necessary services for the hackathon demo
 */

const { spawn } = require('child_process');
const path = require('path');

const services = [
  {
    name: 'Chroma DB',
    command: 'docker',
    args: ['run', '-p', '8000:8000', 'chromadb/chroma'],
    cwd: process.cwd(),
    ready: false
  },
  {
    name: 'Backend API',
    command: 'npm',
    args: ['start'],
    cwd: path.join(__dirname, '../backend'),
    ready: false,
    dependsOn: ['Chroma DB']
  },
  {
    name: 'Frontend',
    command: 'npm',
    args: ['start'],
    cwd: path.join(__dirname, '../frontend'),
    ready: false,
    dependsOn: ['Backend API']
  }
];

const processes = new Map();

function startService(service) {
  console.log(`🚀 Starting ${service.name}...`);
  
  const process = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: 'pipe',
    shell: true
  });
  
  processes.set(service.name, process);
  
  process.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[${service.name}] ${output.trim()}`);
    
    // Check for ready signals
    if (output.includes('Server running') || output.includes('started')) {
      service.ready = true;
      console.log(`✅ ${service.name} is ready!`);
      startDependentServices(service.name);
    }
  });
  
  process.stderr.on('data', (data) => {
    console.error(`[${service.name}] ${data.toString().trim()}`);
  });
  
  process.on('close', (code) => {
    console.log(`❌ ${service.name} exited with code ${code}`);
  });
  
  process.on('error', (error) => {
    console.error(`❌ Failed to start ${service.name}:`, error.message);
  });
}

function startDependentServices(readyServiceName) {
  services.forEach(service => {
    if (!service.ready && service.dependsOn?.includes(readyServiceName)) {
      // Check if all dependencies are ready
      const allDepsReady = service.dependsOn.every(dep => 
        services.find(s => s.name === dep)?.ready
      );
      
      if (allDepsReady) {
        setTimeout(() => startService(service), 2000); // Small delay
      }
    }
  });
}

function startDemo() {
  console.log('🌱 Starting Smart Plant Tracker Demo...\n');
  
  // Start Chroma DB first
  startService(services[0]);
  
  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    processes.forEach((proc, name) => {
      console.log(`Stopping ${name}...`);
      proc.kill();
    });
    process.exit(0);
  });
  
  // Show demo instructions after a delay
  setTimeout(() => {
    console.log('\n🎉 Demo is starting up!');
    console.log('\n📋 Demo Instructions:');
    console.log('   1. Wait for all services to start (this may take a few minutes)');
    console.log('   2. Open http://localhost:3000 in your browser');
    console.log('   3. Try the following demo flow:');
    console.log('      - View the plant dashboard with live sensor data');
    console.log('      - Ask the AI assistant: "Should I water my Snake Plant today?"');
    console.log('      - Check the health progress bar');
    console.log('      - Add a daily log entry');
    console.log('      - Upload a plant photo (optional)');
    console.log('\n🔧 Troubleshooting:');
    console.log('   - If Chroma DB fails, run: docker run -p 8000:8000 chromadb/chroma');
    console.log('   - If backend fails, check that all dependencies are installed');
    console.log('   - If frontend fails, ensure Node.js and npm are installed');
    console.log('\n💡 Press Ctrl+C to stop all services');
  }, 5000);
}

// Run if called directly
if (require.main === module) {
  startDemo();
}

module.exports = { startDemo };

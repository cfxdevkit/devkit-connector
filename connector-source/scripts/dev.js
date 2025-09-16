#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const chalk = require('chalk').default;
const path = require('path');

class DevEnvironment {
  constructor() {
    this.processes = [];
    this.isRunning = false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow
    };
    console.log(colors[type](`[${timestamp}] ${message}`));
  }

  async runCommand(command, args, cwd, name) {
    return new Promise((resolve, reject) => {
      this.log(`🚀 Starting ${name}...`, 'info');
      
      const process = spawn(command, args, {
        cwd: cwd || process.cwd(),
        stdio: 'inherit',
        shell: true
      });

      this.processes.push({ process, name });

      process.on('close', (code) => {
        this.log(`${name} exited with code ${code}`, code === 0 ? 'success' : 'error');
        this.processes = this.processes.filter(p => p.process !== process);
      });

      process.on('error', (error) => {
        this.log(`Failed to start ${name}: ${error.message}`, 'error');
        reject(error);
      });

      // Give the process a moment to start
      setTimeout(() => {
        this.log(`✅ ${name} started`, 'success');
        resolve(process);
      }, 2000);
    });
  }

  async start() {
    if (this.isRunning) {
      this.log('Development environment is already running', 'warning');
      return;
    }

    try {
      this.log('🎭 Starting Conflux Dual Wallet Development Environment...', 'info');
      
      // Start Conflux node
      await this.runCommand('pnpm', ['run', 'node:start'], path.join(__dirname, '..'), 'Conflux Node');
      
      // Wait a bit for node to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Deploy contracts
      await this.runCommand('pnpm', ['run', 'deploy:orchestrated'], path.join(__dirname, '../contracts/espace'), 'Contract Deployment');
      
      // Start server
      await this.runCommand('pnpm', ['run', 'server:dev'], path.join(__dirname, '..'), 'Server');
      
      // Start web interface
      await this.runCommand('pnpm', ['run', 'web:start'], path.join(__dirname, '..'), 'Web Interface');
      
      this.isRunning = true;
      this.log('🎉 Development environment started!', 'success');
      this.log('📊 Services available:', 'info');
      this.log('  • Conflux Node: http://localhost:8545 (eSpace), http://localhost:12537 (Core)', 'info');
      this.log('  • Server API: http://localhost:3001', 'info');
      this.log('  • Web Interface: http://localhost:3000', 'info');
      this.log('  • Contract Tests: pnpm run server:test', 'info');
      
    } catch (error) {
      this.log(`Failed to start development environment: ${error.message}`, 'error');
      await this.stop();
      throw error;
    }
  }

  async stop() {
    this.log('🛑 Stopping development environment...', 'info');
    
    for (const { process, name } of this.processes) {
      this.log(`Stopping ${name}...`, 'info');
      process.kill('SIGTERM');
    }
    
    this.processes = [];
    this.isRunning = false;
    this.log('✅ Development environment stopped', 'success');
  }

  async test() {
    this.log('🧪 Running tests...', 'info');
    
    try {
      // Test server contracts
      await this.runCommand('pnpm', ['run', 'server:test'], path.join(__dirname, '..'), 'Server Tests');
      
      this.log('✅ All tests completed', 'success');
      
    } catch (error) {
      this.log(`Tests failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const dev = new DevEnvironment();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down development environment...');
    await dev.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down development environment...');
    await dev.stop();
    process.exit(0);
  });
  
  try {
    switch (command) {
      case 'start':
        await dev.start();
        // Keep the process running
        process.stdin.resume();
        break;
        
      case 'test':
        await dev.test();
        break;
        
      case 'stop':
        await dev.stop();
        break;
        
      default:
        console.log(`
🎭 Conflux Dual Wallet Development Environment

Usage: node scripts/dev.js <command>

Commands:
  start    Start development environment (node + contracts + server + web)
  test     Run tests
  stop     Stop all services

Examples:
  node scripts/dev.js start
  node scripts/dev.js test
        `);
        break;
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
    }
}

if (require.main === module) {
  main();
}

module.exports = DevEnvironment;

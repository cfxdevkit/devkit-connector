#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk').default;

class ConfluxOrchestrator {
  constructor() {
    this.nodeProcess = null;
    this.serverProcess = null;
    this.webProcess = null;
    this.isRunning = false;
    this.logFile = path.join(__dirname, '../logs/orchestrator.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    
    // Console output with colors
    switch (type) {
      case 'error':
        console.error(chalk.red(logMessage));
        break;
      case 'success':
        console.log(chalk.green(logMessage));
        break;
      case 'warning':
        console.warn(chalk.yellow(logMessage));
        break;
      case 'info':
      default:
        console.log(chalk.blue(logMessage));
        break;
    }
    
    // File output
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async waitForPort(port, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
          exec(`netstat -tuln | grep :${port}`, (error, stdout) => {
            if (stdout.includes(`:${port}`)) {
              resolve();
            } else {
              reject(new Error(`Port ${port} not ready`));
            }
          });
        });
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`Port ${port} not ready after ${timeout}ms`);
  }

  async startNode() {
    this.log('🚀 Starting Conflux node...', 'info');
    
    return new Promise((resolve, reject) => {
      const nodeManagerPath = path.join(__dirname, '../tools/node-manager');
      
      this.nodeProcess = spawn('pnpm', ['run', 'start'], {
        cwd: nodeManagerPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      let nodeReady = false;
      let serverReady = false;

      this.nodeProcess.stdout.on('data', (data) => {
        const output = data.toString();
        this.log(`[NODE] ${output.trim()}`, 'info');
        
        if (output.includes('Node started successfully!') && !nodeReady) {
          nodeReady = true;
          this.log('✅ Conflux node started successfully', 'success');
          
          if (serverReady) {
            resolve();
          }
        }
      });

      this.nodeProcess.stderr.on('data', (data) => {
        const output = data.toString();
        this.log(`[NODE ERROR] ${output.trim()}`, 'error');
      });

      this.nodeProcess.on('close', (code) => {
        this.log(`Conflux node process exited with code ${code}`, 'warning');
        this.nodeProcess = null;
      });

      this.nodeProcess.on('error', (error) => {
        this.log(`Failed to start Conflux node: ${error.message}`, 'error');
        reject(error);
      });

      // Wait for node to be ready
      setTimeout(async () => {
        try {
          await this.waitForPort(8545, 30000); // eSpace RPC
          await this.waitForPort(12537, 30000); // Core RPC
          serverReady = true;
          
          if (nodeReady) {
            resolve();
          }
        } catch (error) {
          this.log(`Port readiness check failed: ${error.message}`, 'error');
          reject(error);
        }
      }, 5000);
    });
  }

  async deployContracts() {
    this.log('📦 Deploying contracts...', 'info');
    
    return new Promise((resolve, reject) => {
      const contractsPath = path.join(__dirname, '../contracts/espace');
      
      const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/run-orchestrator.ts', '--network', 'localEspace'], {
        cwd: contractsPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      deployProcess.stdout.on('data', (data) => {
        const output = data.toString();
        this.log(`[DEPLOY] ${output.trim()}`, 'info');
      });

      deployProcess.stderr.on('data', (data) => {
        const output = data.toString();
        this.log(`[DEPLOY ERROR] ${output.trim()}`, 'error');
      });

      deployProcess.on('close', (code) => {
        if (code === 0) {
          this.log('✅ Contracts deployed successfully', 'success');
          resolve();
        } else {
          this.log(`Contract deployment failed with code ${code}`, 'error');
          reject(new Error(`Deployment failed with code ${code}`));
        }
      });

      deployProcess.on('error', (error) => {
        this.log(`Failed to deploy contracts: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async startServer() {
    this.log('🖥️  Starting server...', 'info');
    
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, '../packages/server');
      
      // Compile TypeScript first
      exec('npx tsc', { cwd: serverPath }, (error) => {
        if (error) {
          this.log(`TypeScript compilation failed: ${error.message}`, 'error');
          reject(error);
          return;
        }

        this.serverProcess = spawn('node', ['dist/index.js'], {
          cwd: serverPath,
          stdio: ['pipe', 'pipe', 'pipe'],
          detached: false
        });

        this.serverProcess.stdout.on('data', (data) => {
          const output = data.toString();
          this.log(`[SERVER] ${output.trim()}`, 'info');
          
          if (output.includes('Server running on port 3001')) {
            this.log('✅ Server started successfully', 'success');
            resolve();
          }
        });

        this.serverProcess.stderr.on('data', (data) => {
          const output = data.toString();
          this.log(`[SERVER ERROR] ${output.trim()}`, 'error');
        });

        this.serverProcess.on('close', (code) => {
          this.log(`Server process exited with code ${code}`, 'warning');
          this.serverProcess = null;
        });

        this.serverProcess.on('error', (error) => {
          this.log(`Failed to start server: ${error.message}`, 'error');
          reject(error);
        });
      });
    });
  }

  async startWeb() {
    this.log('🌐 Starting web interface...', 'info');
    
    return new Promise((resolve, reject) => {
      const webPath = path.join(__dirname, '../apps/demo-app');
      
      this.webProcess = spawn('npm', ['run', 'dev'], {
        cwd: webPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      this.webProcess.stdout.on('data', (data) => {
        const output = data.toString();
        this.log(`[WEB] ${output.trim()}`, 'info');
        
        if (output.includes('Ready in') && output.includes('http://localhost:3000')) {
          this.log('✅ Web interface started successfully', 'success');
          resolve();
        }
      });

      this.webProcess.stderr.on('data', (data) => {
        const output = data.toString();
        this.log(`[WEB ERROR] ${output.trim()}`, 'error');
      });

      this.webProcess.on('close', (code) => {
        this.log(`Web process exited with code ${code}`, 'warning');
        this.webProcess = null;
      });

      this.webProcess.on('error', (error) => {
        this.log(`Failed to start web interface: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async stop() {
    this.log('🛑 Stopping all services...', 'info');
    
    const promises = [];
    
    if (this.webProcess) {
      this.log('Stopping web interface...', 'info');
      this.webProcess.kill('SIGTERM');
      promises.push(new Promise(resolve => {
        this.webProcess.on('close', () => {
          this.log('✅ Web interface stopped', 'success');
          resolve();
        });
      }));
    }
    
    if (this.serverProcess) {
      this.log('Stopping server...', 'info');
      this.serverProcess.kill('SIGTERM');
      promises.push(new Promise(resolve => {
        this.serverProcess.on('close', () => {
          this.log('✅ Server stopped', 'success');
          resolve();
        });
      }));
    }
    
    if (this.nodeProcess) {
      this.log('Stopping Conflux node...', 'info');
      this.nodeProcess.kill('SIGTERM');
      promises.push(new Promise(resolve => {
        this.nodeProcess.on('close', () => {
          this.log('✅ Conflux node stopped', 'success');
          resolve();
        });
      }));
    }
    
    await Promise.all(promises);
    this.isRunning = false;
    this.log('🎉 All services stopped', 'success');
  }

  async start(options = {}) {
    if (this.isRunning) {
      this.log('Services are already running', 'warning');
      return;
    }

    try {
      this.log('🎭 Starting Conflux Dual Wallet System...', 'info');
      
      // Start Conflux node
      await this.startNode();
      
      // Deploy contracts
      if (options.deploy !== false) {
        await this.deployContracts();
      }
      
      // Start server
      if (options.server !== false) {
        await this.startServer();
      }
      
      // Start web interface
      if (options.web !== false) {
        await this.startWeb();
      }
      
      this.isRunning = true;
      this.log('🎉 All services started successfully!', 'success');
      this.log('📊 Services running:', 'info');
      this.log('  • Conflux Node: http://localhost:8545 (eSpace), http://localhost:12537 (Core)', 'info');
      this.log('  • Server API: http://localhost:3001', 'info');
      this.log('  • Web Interface: http://localhost:3000', 'info');
      
    } catch (error) {
      this.log(`Failed to start services: ${error.message}`, 'error');
      await this.stop();
      throw error;
    }
  }

  async test() {
    this.log('🧪 Running tests...', 'info');
    
    try {
      // Test server health
      const { default: fetch } = await import('node-fetch');
      const response = await fetch('http://localhost:3001/health');
      const health = await response.json();
      
      if (health.status === 'healthy') {
        this.log('✅ Server health check passed', 'success');
      } else {
        throw new Error('Server health check failed');
      }
      
      // Test contract status
      const contractResponse = await fetch('http://localhost:3001/api/contracts/status');
      const contractStatus = await contractResponse.json();
      
      this.log('📊 Contract Status:', 'info');
      this.log(`  • eSpace: ${contractStatus.espace ? 'Deployed' : 'Not deployed'}`, 'info');
      this.log(`  • Core: ${contractStatus.core ? 'Deployed' : 'Not deployed'}`, 'info');
      
      this.log('✅ All tests passed', 'success');
      
    } catch (error) {
      this.log(`Tests failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const orchestrator = new ConfluxOrchestrator();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await orchestrator.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await orchestrator.stop();
    process.exit(0);
  });
  
  try {
    switch (command) {
      case 'start':
        await orchestrator.start();
        // Keep the process running
        process.stdin.resume();
        break;
        
      case 'start:node':
        await orchestrator.start({ server: false, web: false });
        process.stdin.resume();
        break;
        
      case 'start:server':
        await orchestrator.start({ web: false });
        process.stdin.resume();
        break;
        
      case 'deploy':
        await orchestrator.startNode();
        await orchestrator.deployContracts();
        await orchestrator.stop();
        break;
        
      case 'test':
        await orchestrator.test();
        break;
        
      case 'stop':
        await orchestrator.stop();
        break;
        
      case 'restart':
        await orchestrator.stop();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await orchestrator.start();
        process.stdin.resume();
        break;
        
      default:
        console.log(`
🎭 Conflux Dual Wallet Orchestrator

Usage: node scripts/orchestrator.js <command>

Commands:
  start         Start all services (node, server, web)
  start:node    Start only the Conflux node
  start:server  Start node and server (no web)
  deploy        Deploy contracts only
  test          Run health checks and tests
  stop          Stop all services
  restart       Restart all services

Examples:
  node scripts/orchestrator.js start
  node scripts/orchestrator.js deploy
  node scripts/orchestrator.js test
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

module.exports = ConfluxOrchestrator;

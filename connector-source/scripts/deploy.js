#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const chalk = require('chalk').default;
const path = require('path');
const fs = require('fs');

class DeploymentManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.network = process.argv[2] || 'localEspace';
    this.logFile = path.join(__dirname, '../logs/deployment.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow
    };
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(colors[type](logMessage));
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async runCommand(command, args, cwd, name) {
    return new Promise((resolve, reject) => {
      this.log(`🚀 Running ${name}...`, 'info');
      
      const process = spawn(command, args, {
        cwd: cwd || process.cwd(),
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        this.log(`[${name}] ${text.trim()}`, 'info');
      });

      process.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        this.log(`[${name} ERROR] ${text.trim()}`, 'error');
      });

      process.on('close', (code) => {
        if (code === 0) {
          this.log(`✅ ${name} completed successfully`, 'success');
          resolve({ output, errorOutput });
        } else {
          this.log(`❌ ${name} failed with code ${code}`, 'error');
          reject(new Error(`${name} failed with code ${code}: ${errorOutput}`));
        }
      });

      process.on('error', (error) => {
        this.log(`Failed to run ${name}: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'info');
    
    // Check if pnpm is available by trying to run it
    try {
      await this.runCommand('pnpm', ['--version'], null, 'pnpm check');
    } catch (error) {
      this.log('⚠️  pnpm check failed, but continuing...', 'warning');
    }
    
    // Check if node is running (for local deployments)
    if (this.network === 'localEspace') {
      try {
        await this.runCommand('curl', ['-s', 'http://localhost:8545'], null, 'eSpace RPC check');
      } catch (error) {
        this.log('⚠️  eSpace RPC not available. Starting node...', 'warning');
        await this.startNode();
      }
    }
    
    this.log('✅ Prerequisites check passed', 'success');
  }

  async startNode() {
    this.log('🚀 Starting Conflux node...', 'info');
    
    const nodeManagerPath = path.join(__dirname, '../tools/node-manager');
    await this.runCommand('pnpm', ['run', 'start'], nodeManagerPath, 'Conflux Node');
    
    // Wait for node to be ready
    this.log('⏳ Waiting for node to be ready...', 'info');
    await new Promise(resolve => setTimeout(resolve, 15000));
  }

  async compileContracts() {
    this.log('🔨 Compiling contracts...', 'info');
    
    const contractsPath = path.join(__dirname, '../contracts/espace');
    await this.runCommand('pnpm', ['run', 'compile'], contractsPath, 'Contract Compilation');
  }

  async deployContracts() {
    this.log('📦 Deploying contracts...', 'info');
    
    const contractsPath = path.join(__dirname, '../contracts/espace');
    
    if (this.network === 'localEspace') {
      await this.runCommand('pnpm', ['run', 'orchestrate:local'], contractsPath, 'Contract Deployment');
    } else if (this.network === 'confluxEspaceTestnet') {
      await this.runCommand('pnpm', ['run', 'orchestrate:testnet'], contractsPath, 'Contract Deployment');
    } else if (this.network === 'confluxEspace') {
      await this.runCommand('pnpm', ['run', 'orchestrate:mainnet'], contractsPath, 'Contract Deployment');
    } else {
      throw new Error(`Unsupported network: ${this.network}`);
    }
  }

  async verifyDeployment() {
    this.log('🔍 Verifying deployment...', 'info');
    
    // Check if deployment files exist
    const deploymentFile = path.join(__dirname, '../tools/node-manager/deployments/espace.json');
    
    if (fs.existsSync(deploymentFile)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
      this.log(`✅ Contract deployed at: ${deployment.address}`, 'success');
      this.log(`📄 Transaction: ${deployment.txHash}`, 'info');
      this.log(`⛽ Gas used: ${deployment.gasUsed}`, 'info');
    } else {
      throw new Error('Deployment file not found');
    }
  }

  async buildServer() {
    this.log('🏗️  Building server...', 'info');
    
    const serverPath = path.join(__dirname, '../packages/server');
    await this.runCommand('pnpm', ['run', 'build'], serverPath, 'Server Build');
  }

  async buildWeb() {
    this.log('🏗️  Building web interface...', 'info');
    
    const webPath = path.join(__dirname, '../apps/demo-app');
    await this.runCommand('pnpm', ['run', 'build'], webPath, 'Web Build');
  }

  async runTests() {
    this.log('🧪 Running tests...', 'info');
    
    // Test contracts
    const contractsPath = path.join(__dirname, '../contracts/espace');
    await this.runCommand('pnpm', ['run', 'test'], contractsPath, 'Contract Tests');
    
    // Test server
    const serverPath = path.join(__dirname, '../packages/server');
    await this.runCommand('pnpm', ['run', 'test'], serverPath, 'Server Tests');
  }

  async deploy() {
    try {
      this.log(`🎭 Starting deployment to ${this.network}...`, 'info');
      
      // Step 1: Check prerequisites
      await this.checkPrerequisites();
      
      // Step 2: Compile contracts
      await this.compileContracts();
      
      // Step 3: Deploy contracts
      await this.deployContracts();
      
      // Step 4: Verify deployment
      await this.verifyDeployment();
      
      // Step 5: Build applications
      await this.buildServer();
      await this.buildWeb();
      
      // Step 6: Run tests
      if (this.environment !== 'production') {
        await this.runTests();
      }
      
      this.log('🎉 Deployment completed successfully!', 'success');
      this.log('📊 Deployment Summary:', 'info');
      this.log(`  • Network: ${this.network}`, 'info');
      this.log(`  • Environment: ${this.environment}`, 'info');
      this.log(`  • Contracts: Deployed`, 'info');
      this.log(`  • Server: Built`, 'info');
      this.log(`  • Web: Built`, 'info');
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async clean() {
    this.log('🧹 Cleaning build artifacts...', 'info');
    
    const cleanPaths = [
      path.join(__dirname, '../contracts/espace/artifacts'),
      path.join(__dirname, '../contracts/espace/cache'),
      path.join(__dirname, '../contracts/espace/deployments'),
      path.join(__dirname, '../packages/server/dist'),
      path.join(__dirname, '../apps/demo-app/.next'),
      path.join(__dirname, '../apps/demo-app/out')
    ];
    
    for (const cleanPath of cleanPaths) {
      if (fs.existsSync(cleanPath)) {
        await this.runCommand('rm', ['-rf', cleanPath], null, `Cleaning ${path.basename(cleanPath)}`);
      }
    }
    
    this.log('✅ Clean completed', 'success');
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const network = process.argv[3] || 'localEspace';
  const deployment = new DeploymentManager();
  
  try {
    switch (command) {
      case 'deploy':
        deployment.network = network;
        await deployment.deploy();
        break;
        
      case 'clean':
        await deployment.clean();
        break;
        
      case 'test':
        await deployment.runTests();
        break;
        
      case 'compile':
        await deployment.compileContracts();
        break;
        
      case 'build':
        await deployment.buildServer();
        await deployment.buildWeb();
        break;
        
      default:
        console.log(`
🎭 Conflux Dual Wallet Deployment Manager

Usage: node scripts/deploy.js <command> [network]

Commands:
  deploy [network]    Deploy to specified network (default: localEspace)
  clean              Clean build artifacts
  test               Run all tests
  compile            Compile contracts only
  build              Build applications only

Networks:
  localEspace        Local development (requires running node)
  confluxEspaceTestnet  Conflux eSpace testnet
  confluxEspace      Conflux eSpace mainnet

Examples:
  node scripts/deploy.js deploy localEspace
  node scripts/deploy.js deploy confluxEspaceTestnet
  node scripts/deploy.js clean
  node scripts/deploy.js test
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

module.exports = DeploymentManager;

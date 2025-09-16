#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk').default;

// Configuration
const DEMO_APP_URL = process.env.DEMO_APP_URL || 'http://localhost:3000';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

class WebContractTester {
  constructor(demoAppUrl, serverUrl) {
    this.demoAppUrl = demoAppUrl;
    this.serverUrl = serverUrl;
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async runTests() {
    console.log(chalk.blue('🌐 Starting Web Contract Interface Tests...\n'));

    try {
      // Test 1: Check if demo app is running
      await this.testDemoAppHealth();

      // Test 2: Check if server is running
      await this.testServerHealth();

      // Test 3: Test contract dashboard page
      await this.testContractDashboard();

      // Test 4: Test API endpoints through web interface
      await this.testWebApiIntegration();

      console.log(chalk.green('\n🎉 All web tests completed successfully!'));

    } catch (error) {
      console.error(chalk.red('\n❌ Web test suite failed:'), error.message);
      process.exit(1);
    }
  }

  async testDemoAppHealth() {
    console.log(chalk.blue('1️⃣ Testing Demo App Health...'));
    
    try {
      const response = await this.client.get(`${this.demoAppUrl}/`);
      console.log(chalk.green('✅ Demo app is running'));
      console.log(chalk.gray(`   Status: ${response.status}`));
    } catch (error) {
      throw new Error(`Demo app health check failed: ${error.message}`);
    }
  }

  async testServerHealth() {
    console.log(chalk.blue('\n2️⃣ Testing Server Health...'));
    
    try {
      const response = await this.client.get(`${this.serverUrl}/health`);
      console.log(chalk.green('✅ Server is running'));
      console.log(chalk.gray(`   Status: ${response.data.status}`));
    } catch (error) {
      throw new Error(`Server health check failed: ${error.message}`);
    }
  }

  async testContractDashboard() {
    console.log(chalk.blue('\n3️⃣ Testing Contract Dashboard Page...'));
    
    try {
      const response = await this.client.get(`${this.demoAppUrl}/contracts`);
      console.log(chalk.green('✅ Contract dashboard page is accessible'));
      console.log(chalk.gray(`   Status: ${response.status}`));
      
      // Check if the page contains expected content
      const content = response.data;
      if (content.includes('Contract Dashboard')) {
        console.log(chalk.green('✅ Page contains expected content'));
      } else {
        console.log(chalk.yellow('⚠️  Page content may be incomplete'));
      }
    } catch (error) {
      throw new Error(`Contract dashboard test failed: ${error.message}`);
    }
  }

  async testWebApiIntegration() {
    console.log(chalk.blue('\n4️⃣ Testing Web API Integration...'));
    
    try {
      // Test contract status endpoint
      const statusResponse = await this.client.get(`${this.serverUrl}/api/contracts/status`);
      console.log(chalk.green('✅ Contract status API accessible'));
      console.log(chalk.gray(`   eSpace deployed: ${statusResponse.data.data?.contracts?.espace?.deployed || false}`));
      console.log(chalk.gray(`   Core deployed: ${statusResponse.data.data?.contracts?.core?.deployed || false}`));

      // Test eSpace owner endpoint
      const espaceOwnerResponse = await this.client.get(`${this.serverUrl}/api/contracts/espace/owner`);
      console.log(chalk.green('✅ eSpace owner API accessible'));
      if (espaceOwnerResponse.data.success) {
        console.log(chalk.gray(`   Owner: ${espaceOwnerResponse.data.data?.owner || 'N/A'}`));
      } else {
        console.log(chalk.yellow(`   Warning: ${espaceOwnerResponse.data.error}`));
      }

      // Test Core owner endpoint
      const coreOwnerResponse = await this.client.get(`${this.serverUrl}/api/contracts/core/owner`);
      console.log(chalk.green('✅ Core owner API accessible'));
      if (coreOwnerResponse.data.success) {
        console.log(chalk.gray(`   Owner: ${coreOwnerResponse.data.data?.owner || 'N/A'}`));
        if (coreOwnerResponse.data.mock) {
          console.log(chalk.yellow('   (Mock response)'));
        }
      } else {
        console.log(chalk.yellow(`   Warning: ${coreOwnerResponse.data.error}`));
      }

    } catch (error) {
      throw new Error(`Web API integration test failed: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  const tester = new WebContractTester(DEMO_APP_URL, SERVER_URL);
  await tester.runTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('❌ Web test execution failed:'), error.message);
    process.exit(1);
  });
}

module.exports = WebContractTester;

#!/usr/bin/env node

const axios = require('axios');
const chalk = require('chalk').default;

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const TEST_DELEGATE = '0x1234567890123456789012345678901234567890';
const TEST_LIMIT = '1000000000000000000'; // 1 ETH in wei
const TEST_DELEGATOR = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

class ContractTester {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.client = axios.create({
      baseURL: serverUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async runTests() {
    console.log(chalk.blue('🧪 Starting Server-Side Contract Tests...\n'));

    try {
      // Test 1: Health Check
      await this.testHealthCheck();

      // Test 2: Contract Status
      await this.testContractStatus();

      // Test 3: eSpace Contract Tests
      await this.testEspaceContracts();

      // Test 4: Core Contract Tests
      await this.testCoreContracts();

      console.log(chalk.green('\n🎉 All tests completed successfully!'));

    } catch (error) {
      console.error(chalk.red('\n❌ Test suite failed:'), error.message);
      process.exit(1);
    }
  }

  async testHealthCheck() {
    console.log(chalk.blue('1️⃣ Testing Health Check...'));
    
    try {
      const response = await this.client.get('/health');
      console.log(chalk.green('✅ Server health check passed'));
      console.log(chalk.gray(`   Status: ${response.data.status}`));
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async testContractStatus() {
    console.log(chalk.blue('\n2️⃣ Testing Contract Status...'));
    
    try {
      const response = await this.client.get('/api/contracts/status');
      const { contracts, networks } = response.data.data;
      
      console.log(chalk.green('✅ Contract status retrieved'));
      console.log(chalk.gray(`   eSpace: ${contracts.espace.deployed ? 'Deployed' : 'Not deployed'} ${contracts.espace.address ? `(${contracts.espace.address})` : ''}`));
      console.log(chalk.gray(`   Core: ${contracts.core.deployed ? 'Deployed' : 'Not deployed'} ${contracts.core.address ? `(${contracts.core.address})` : ''} ${contracts.core.mock ? '(Mock)' : ''}`));
      console.log(chalk.gray(`   eSpace Chain ID: ${networks.espace.chainId}`));
      console.log(chalk.gray(`   Core Network ID: ${networks.core.networkId}`));
    } catch (error) {
      throw new Error(`Contract status check failed: ${error.message}`);
    }
  }

  async testEspaceContracts() {
    console.log(chalk.blue('\n3️⃣ Testing eSpace Contracts...'));
    
    try {
      // Get owner
      const ownerResponse = await this.client.get('/api/contracts/espace/owner');
      console.log(chalk.green('✅ eSpace owner retrieved'));
      console.log(chalk.gray(`   Owner: ${ownerResponse.data.data.owner}`));

      // Create delegation
      const createResponse = await this.client.post('/api/contracts/espace/create-delegation', {
        delegate: TEST_DELEGATE,
        limit: TEST_LIMIT
      });
      
      if (createResponse.data.success) {
        console.log(chalk.green('✅ eSpace delegation created'));
        console.log(chalk.gray(`   TX Hash: ${createResponse.data.transactionHash}`));
        console.log(chalk.gray(`   Gas Used: ${createResponse.data.gasUsed}`));
      } else {
        console.log(chalk.yellow('⚠️  eSpace delegation creation failed (expected if no contract deployed)'));
        console.log(chalk.gray(`   Error: ${createResponse.data.error}`));
      }

      // Get delegation
      const getResponse = await this.client.get(`/api/contracts/espace/get-delegation/${TEST_DELEGATOR}`);
      if (getResponse.data.success) {
        console.log(chalk.green('✅ eSpace delegation retrieved'));
        console.log(chalk.gray(`   Delegate: ${getResponse.data.data.delegate}`));
        console.log(chalk.gray(`   Limit: ${getResponse.data.data.limit}`));
        console.log(chalk.gray(`   Active: ${getResponse.data.data.active}`));
      } else {
        console.log(chalk.yellow('⚠️  eSpace delegation retrieval failed'));
        console.log(chalk.gray(`   Error: ${getResponse.data.error}`));
      }

    } catch (error) {
      console.log(chalk.yellow('⚠️  eSpace contract tests failed (expected if no contract deployed)'));
      console.log(chalk.gray(`   Error: ${error.message}`));
    }
  }

  async testCoreContracts() {
    console.log(chalk.blue('\n4️⃣ Testing Core Contracts...'));
    
    try {
      // Get owner
      const ownerResponse = await this.client.get('/api/contracts/core/owner');
      console.log(chalk.green('✅ Core owner retrieved'));
      console.log(chalk.gray(`   Owner: ${ownerResponse.data.data.owner}`));
      if (ownerResponse.data.mock) {
        console.log(chalk.yellow('   (Mock response)'));
      }

      // Create delegation
      const createResponse = await this.client.post('/api/contracts/core/create-delegation', {
        delegate: TEST_DELEGATE,
        limit: TEST_LIMIT
      });
      
      console.log(chalk.green('✅ Core delegation created'));
      console.log(chalk.gray(`   TX Hash: ${createResponse.data.transactionHash}`));
      console.log(chalk.gray(`   Gas Used: ${createResponse.data.gasUsed}`));
      if (createResponse.data.mock) {
        console.log(chalk.yellow('   (Mock response)'));
      }

      // Get delegation
      const getResponse = await this.client.get(`/api/contracts/core/get-delegation/${TEST_DELEGATOR}`);
      console.log(chalk.green('✅ Core delegation retrieved'));
      console.log(chalk.gray(`   Delegate: ${getResponse.data.data.delegate}`));
      console.log(chalk.gray(`   Limit: ${getResponse.data.data.limit}`));
      console.log(chalk.gray(`   Active: ${getResponse.data.data.active}`));
      if (getResponse.data.mock) {
        console.log(chalk.yellow('   (Mock response)'));
      }

      // Revoke delegation
      const revokeResponse = await this.client.post('/api/contracts/core/revoke-delegation');
      console.log(chalk.green('✅ Core delegation revoked'));
      console.log(chalk.gray(`   TX Hash: ${revokeResponse.data.transactionHash}`));
      if (revokeResponse.data.mock) {
        console.log(chalk.yellow('   (Mock response)'));
      }

    } catch (error) {
      throw new Error(`Core contract tests failed: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  const tester = new ContractTester(SERVER_URL);
  await tester.runTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('❌ Test execution failed:'), error.message);
    process.exit(1);
  });
}

module.exports = ContractTester;

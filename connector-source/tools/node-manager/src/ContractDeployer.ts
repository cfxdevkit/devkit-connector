import { ethers } from 'ethers';
import { Conflux } from 'js-conflux-sdk';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export interface DeployOptions {
  network?: string;
  port?: string;
  ethPort?: string;
}

export interface DeploymentResult {
  network: string;
  contract: string;
  address: string;
  txHash: string;
  gasUsed: string;
  timestamp: string;
}

export class ContractDeployer {
  private spinner: any = null;

  async deploy(options: DeployOptions = {}): Promise<void> {
    const network = options.network || 'both';
    const corePort = parseInt(options.port || '12537');
    const evmPort = parseInt(options.ethPort || '8545');

    const results: DeploymentResult[] = [];

    if (network === 'both' || network === 'espace') {
      this.spinner = ora('Deploying to Conflux eSpace...').start();
      try {
        const result = await this.deployToEspace(evmPort);
        results.push(result);
        this.spinner.succeed(chalk.green(`eSpace contract deployed: ${result.address}`));
      } catch (error) {
        this.spinner?.fail(chalk.red('eSpace deployment failed'));
        throw error;
      }
    }

    if (network === 'both' || network === 'core') {
      this.spinner = ora('Deploying to Conflux Core...').start();
      try {
        const result = await this.deployToCore(corePort);
        results.push(result);
        this.spinner.succeed(chalk.green(`Core contract deployed: ${result.address}`));
      } catch (error) {
        this.spinner?.fail(chalk.red('Core deployment failed'));
        throw error;
      }
    }

    // Save deployment results
    await this.saveDeploymentResults(results);
    
    console.log(chalk.blue('\n📊 Deployment Summary:'));
    results.forEach(result => {
      console.log(chalk.blue(`  ${result.network}: ${result.address}`));
    });
  }

  async deployToEspace(port: number): Promise<DeploymentResult> {
    // Connect to local EVM node
    const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${port}`);
    const wallet = new ethers.Wallet(
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      provider
    );

    // Simple delegation contract for eSpace
    const contractCode = `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.19;
      
      contract SimpleDelegationEspace {
          struct Delegation {
              address delegate;
              uint256 limit;
              bool active;
              uint256 createdAt;
          }
          
          mapping(address => Delegation) public delegations;
          address public owner;
          
          event DelegationCreated(address indexed delegator, address indexed delegate, uint256 limit);
          event DelegationRevoked(address indexed delegator);
          
          constructor() {
              owner = msg.sender;
          }
          
          function createDelegation(address _delegate, uint256 _limit) external {
              require(_delegate != address(0), "Invalid delegate");
              require(_limit > 0, "Limit must be positive");
              
              delegations[msg.sender] = Delegation({
                  delegate: _delegate,
                  limit: _limit,
                  active: true,
                  createdAt: block.timestamp
              });
              
              emit DelegationCreated(msg.sender, _delegate, _limit);
          }
          
          function revokeDelegation() external {
              require(delegations[msg.sender].active, "No active delegation");
              delegations[msg.sender].active = false;
              emit DelegationRevoked(msg.sender);
          }
          
          function getDelegation(address _delegator) external view returns (Delegation memory) {
              return delegations[_delegator];
          }
      }
    `;

    // Compile and deploy
    const factory = new ethers.ContractFactory(
      this.getContractABI(),
      contractCode,
      wallet
    );

    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const txHash = contract.deploymentTransaction()?.hash || '';

    return {
      network: 'espace',
      contract: 'SimpleDelegationEspace',
      address,
      txHash,
      gasUsed: '0',
      timestamp: new Date().toISOString()
    };
  }

  async deployToCore(port: number): Promise<DeploymentResult> {
    // Connect to local Core node
    const conflux = new Conflux({
      url: `http://127.0.0.1:${port}`,
      networkId: 1111
    });

    const account = conflux.wallet.addPrivateKey(
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );

    // Simple delegation contract for Core
    const contractCode = `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.19;
      
      contract SimpleDelegationCore {
          struct Delegation {
              address delegate;
              uint256 limit;
              bool active;
              uint256 createdAt;
          }
          
          mapping(address => Delegation) public delegations;
          address public owner;
          
          event DelegationCreated(address indexed delegator, address indexed delegate, uint256 limit);
          event DelegationRevoked(address indexed delegator);
          
          constructor() {
              owner = msg.sender;
          }
          
          function createDelegation(address _delegate, uint256 _limit) external {
              require(_delegate != address(0), "Invalid delegate");
              require(_limit > 0, "Limit must be positive");
              
              delegations[msg.sender] = Delegation({
                  delegate: _delegate,
                  limit: _limit,
                  active: true,
                  createdAt: block.timestamp
              });
              
              emit DelegationCreated(msg.sender, _delegate, _limit);
          }
          
          function revokeDelegation() external {
              require(delegations[msg.sender].active, "No active delegation");
              delegations[msg.sender].active = false;
              emit DelegationRevoked(msg.sender);
          }
          
          function getDelegation(address _delegator) external view returns (Delegation memory) {
              return delegations[_delegator];
          }
      }
    `;

    // Deploy contract
    const contract = conflux.Contract({
      abi: this.getContractABI(),
      bytecode: contractCode
    });

    const receipt = await contract.constructor().sendTransaction({
      from: account.address
    }).executed();

    return {
      network: 'core',
      contract: 'SimpleDelegationCore',
      address: receipt.contractCreated,
      txHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
      timestamp: new Date().toISOString()
    };
  }

  private getContractABI() {
    return [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "delegator",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "delegate",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "limit",
            "type": "uint256"
          }
        ],
        "name": "DelegationCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "delegator",
            "type": "address"
          }
        ],
        "name": "DelegationRevoked",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_delegate",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_limit",
            "type": "uint256"
          }
        ],
        "name": "createDelegation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_delegator",
            "type": "address"
          }
        ],
        "name": "getDelegation",
        "outputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "delegate",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "limit",
                "type": "uint256"
              },
              {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "createdAt",
                "type": "uint256"
              }
            ],
            "internalType": "struct SimpleDelegation.Delegation",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "revokeDelegation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
  }

  private async saveDeploymentResults(results: DeploymentResult[]): Promise<void> {
    const deployDir = path.join(process.cwd(), 'deployments');
    await fs.ensureDir(deployDir);

    const deployFile = path.join(deployDir, 'local-deployments.json');
    await fs.writeJson(deployFile, {
      timestamp: new Date().toISOString(),
      deployments: results
    }, { spaces: 2 });

    console.log(chalk.blue(`📄 Deployment info saved to: ${deployFile}`));
  }
}

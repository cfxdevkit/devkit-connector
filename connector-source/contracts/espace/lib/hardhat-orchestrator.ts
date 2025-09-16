import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';
import { DeploymentConfig, ContractInstance, OperationResult, DeploymentResult } from '../types/orchestrator';

export class HardhatOrchestrator {
  private hre: HardhatRuntimeEnvironment;
  private deployedContracts: Map<string, ContractInstance> = new Map();
  private deploymentHistory: any[] = [];

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
  }

  // Initialize the orchestrator with custom network if needed
  async initialize(networkName?: string) {
    if (networkName && networkName !== this.hre.network.name) {
      // Switch network programmatically
      this.hre.changeNetwork(networkName);
    }
    
    console.log(`🚀 Hardhat Orchestrator initialized on ${this.hre.network.name}`);
    
    // Load existing deployments if available
    await this.loadExistingDeployments();
    
    return this;
  }

  // Compile contracts programmatically
  async compileContracts(): Promise<OperationResult> {
    try {
      console.log('🔨 Compiling contracts...');
      await this.hre.run('compile');
      
      return {
        success: true,
        data: 'Contracts compiled successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Deploy a single contract
  async deployContract(config: DeploymentConfig): Promise<ContractInstance | null> {
    try {
      console.log(`📦 Deploying ${config.contractName} on ${this.hre.network.name}...`);

      // Get contract factory
      const ContractFactory = await this.hre.ethers.getContractFactory(
        config.contractName,
        config.libraries ? { libraries: config.libraries } : undefined
      );

      // Deploy with custom gas settings if provided
      const deployOptions: any = {};
      if (config.gasLimit) deployOptions.gasLimit = config.gasLimit;
      if (config.gasPrice) deployOptions.gasPrice = ethers.parseUnits(config.gasPrice, 'gwei');

      const contract = await ContractFactory.deploy(
        ...(config.constructorArgs || []),
        deployOptions
      );

      await contract.waitForDeployment();
      const address = await contract.getAddress();

      const instance: ContractInstance = {
        address: address,
        contract: contract,
        deploymentTx: contract.deploymentTransaction()?.hash || '',
        network: this.hre.network.name,
        contractName: config.contractName
      };

      // Store the deployment
      const key = `${config.contractName}_${this.hre.network.name}`;
      this.deployedContracts.set(key, instance);

      // Add to deployment history
      const deploymentTx = contract.deploymentTransaction();
      const receipt = deploymentTx ? await deploymentTx.wait() : null;
      
      this.deploymentHistory.push({
        ...instance,
        timestamp: new Date().toISOString(),
        constructorArgs: config.constructorArgs,
        gasUsed: receipt?.gasUsed?.toString() || '0'
      });

      console.log(`✅ ${config.contractName} deployed to: ${address}`);
      
      return instance;
    } catch (error: any) {
      console.error(`❌ Failed to deploy ${config.contractName}:`, error.message);
      return null;
    }
  }

  // Deploy multiple contracts in sequence
  async deployMultipleContracts(configs: DeploymentConfig[]): Promise<ContractInstance[]> {
    const deployedContracts: ContractInstance[] = [];
    
    for (const config of configs) {
      const instance = await this.deployContract(config);
      if (instance) {
        deployedContracts.push(instance);
      }
    }
    
    return deployedContracts;
  }

  // Execute contract method
  async executeContractMethod(
    contractKey: string, 
    methodName: string, 
    args: any[] = [],
    options: { gasLimit?: number, value?: string } = {}
  ): Promise<OperationResult> {
    try {
      const instance = this.deployedContracts.get(contractKey);
      if (!instance) {
        return {
          success: false,
          error: `Contract ${contractKey} not found`
        };
      }

      console.log(`🔄 Executing ${methodName} on ${instance.contractName}...`);

      const txOptions: any = {};
      if (options.gasLimit) txOptions.gasLimit = options.gasLimit;
      if (options.value) txOptions.value = ethers.parseEther(options.value);

      const tx = await instance.contract[methodName](...args, txOptions);
      const receipt = await tx.wait();

      console.log(`✅ ${methodName} executed successfully. Tx: ${tx.hash}`);

      return {
        success: true,
        data: receipt,
        txHash: tx.hash,
        gasUsed: Number(receipt?.gasUsed || 0)
      };
    } catch (error: any) {
      console.error(`❌ Failed to execute ${methodName}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Call view/pure contract method
  async callContractMethod(
    contractKey: string,
    methodName: string,
    args: any[] = []
  ): Promise<OperationResult> {
    try {
      const instance = this.deployedContracts.get(contractKey);
      if (!instance) {
        return {
          success: false,
          error: `Contract ${contractKey} not found`
        };
      }

      const result = await instance.contract[methodName](...args);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify contracts on block explorer
  async verifyContract(
    contractKey: string,
    constructorArgs: any[] = []
  ): Promise<OperationResult> {
    try {
      const instance = this.deployedContracts.get(contractKey);
      if (!instance) {
        return {
          success: false,
          error: `Contract ${contractKey} not found`
        };
      }

      console.log(`🔍 Verifying ${instance.contractName} on block explorer...`);

      await this.hre.run('verify:verify', {
        address: instance.address,
        constructorArguments: constructorArgs,
      });

      console.log(`✅ ${instance.contractName} verified successfully`);

      return {
        success: true,
        data: 'Contract verified successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Load existing deployments from file
  private async loadExistingDeployments() {
    const deploymentsPath = path.join(process.cwd(), 'deployments', `${this.hre.network.name}.json`);
    
    if (fs.existsSync(deploymentsPath)) {
      try {
        const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
        
        for (const [key, deployment] of Object.entries(deployments as any)) {
          const contractFactory = await this.hre.ethers.getContractFactory(deployment.contractName);
          const contract = contractFactory.attach(deployment.address);
          
          const instance: ContractInstance = {
            address: deployment.address,
            contract: contract,
            deploymentTx: deployment.deploymentTx,
            network: this.hre.network.name,
            contractName: deployment.contractName
          };
          
          this.deployedContracts.set(key, instance);
        }
        
        console.log(`📂 Loaded ${Object.keys(deployments).length} existing deployments`);
      } catch (error: any) {
        console.warn('⚠️  Failed to load existing deployments:', error.message);
      }
    }
  }

  // Save deployments to file
  async saveDeployments(): Promise<void> {
    const deploymentsDir = path.join(process.cwd(), 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentsPath = path.join(deploymentsDir, `${this.hre.network.name}.json`);
    
    const deployments: any = {};
    for (const [key, instance] of this.deployedContracts.entries()) {
      deployments[key] = {
        address: instance.address,
        deploymentTx: instance.deploymentTx,
        contractName: instance.contractName,
        network: instance.network
      };
    }

    fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
    console.log(`💾 Deployments saved to ${deploymentsPath}`);
  }

  // Save deployment result for server integration
  async saveDeploymentResult(instance: ContractInstance): Promise<DeploymentResult> {
    const deploymentResult: DeploymentResult = {
      network: 'espace',
      contract: instance.contractName,
      address: instance.address,
      txHash: instance.deploymentTx,
      gasUsed: '0', // Will be updated from receipt
      timestamp: new Date().toISOString(),
      mock: false
    };

    // Save to server deployments directory
    const serverDeploymentsDir = path.join(process.cwd(), '../../tools/node-manager/deployments');
    if (!fs.existsSync(serverDeploymentsDir)) {
      fs.mkdirSync(serverDeploymentsDir, { recursive: true });
    }

    const serverDeploymentsPath = path.join(serverDeploymentsDir, 'espace.json');
    fs.writeFileSync(serverDeploymentsPath, JSON.stringify(deploymentResult, null, 2));
    console.log(`💾 Server deployment result saved to ${serverDeploymentsPath}`);

    return deploymentResult;
  }

  // Get deployed contract instance
  getContract(contractKey: string): ContractInstance | undefined {
    return this.deployedContracts.get(contractKey);
  }

  // List all deployed contracts
  listDeployedContracts(): ContractInstance[] {
    return Array.from(this.deployedContracts.values());
  }

  // Get deployment history
  getDeploymentHistory(): any[] {
    return this.deploymentHistory;
  }

  // Run tests programmatically
  async runTests(testFiles?: string[]): Promise<OperationResult> {
    try {
      console.log('🧪 Running tests...');
      
      const testOptions: any = {};
      if (testFiles) {
        testOptions.testFiles = testFiles;
      }

      await this.hre.run('test', testOptions);
      
      return {
        success: true,
        data: 'Tests completed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Execute custom task
  async executeTask(taskName: string, args: any = {}): Promise<OperationResult> {
    try {
      console.log(`⚙️  Executing task: ${taskName}`);
      
      const result = await this.hre.run(taskName, args);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

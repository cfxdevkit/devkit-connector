import { HardhatOrchestrator } from '../lib/hardhat-orchestrator';
import { DeploymentConfig } from '../types/orchestrator';
import hre from 'hardhat';

export class DeploymentOrchestrator {
  private orchestrator: HardhatOrchestrator;

  constructor() {
    this.orchestrator = new HardhatOrchestrator(hre);
  }

  // Complete deployment pipeline
  async deploymentPipeline(network: string = 'localEspace'): Promise<void> {
    try {
      console.log('🎭 Starting Deployment Pipeline...');

      // Initialize orchestrator
      await this.orchestrator.initialize(network);

      // Step 1: Compile contracts
      const compileResult = await this.orchestrator.compileContracts();
      if (!compileResult.success) {
        throw new Error(`Compilation failed: ${compileResult.error}`);
      }

      // Step 2: Deploy contracts
      const deploymentConfigs: DeploymentConfig[] = [
        {
          network,
          contractName: 'DelegationManager',
          constructorArgs: []
        }
      ];

      const deployedContracts = await this.orchestrator.deployMultipleContracts(deploymentConfigs);
      
      if (deployedContracts.length === 0) {
        throw new Error('No contracts were deployed successfully');
      }

      // Step 3: Execute post-deployment operations
      await this.postDeploymentOperations();

      // Step 4: Save deployment state
      await this.orchestrator.saveDeployments();

      // Step 5: Save deployment result for server integration
      for (const contract of deployedContracts) {
        await this.orchestrator.saveDeploymentResult(contract);
      }

      // Step 6: Run verification (for testnets/mainnet)
      if (network !== 'localEspace' && network !== 'hardhat') {
        await this.verifyDeployedContracts();
      }

      console.log('🎉 Deployment Pipeline Completed Successfully!');
      
    } catch (error: any) {
      console.error('💥 Deployment Pipeline Failed:', error.message);
      throw error;
    }
  }

  // Post-deployment operations
  private async postDeploymentOperations(): Promise<void> {
    console.log('🔧 Executing post-deployment operations...');

    // Get the deployed DelegationManager contract
    const delegationManager = this.orchestrator.getContract('DelegationManager_localEspace');
    if (!delegationManager) {
      console.warn('⚠️  DelegationManager not found for post-deployment operations');
      return;
    }

    // Example: Check owner
    const ownerResult = await this.orchestrator.callContractMethod(
      'DelegationManager_localEspace',
      'owner'
    );

    if (ownerResult.success) {
      console.log(`✅ Contract owner: ${ownerResult.data}`);
    }

    // Example: Check if contract is paused
    const pausedResult = await this.orchestrator.callContractMethod(
      'DelegationManager_localEspace',
      'paused'
    );

    if (pausedResult.success) {
      console.log(`✅ Contract paused status: ${pausedResult.data}`);
    }
  }

  // Verify all deployed contracts
  private async verifyDeployedContracts(): Promise<void> {
    console.log('🔍 Verifying deployed contracts...');

    const contracts = this.orchestrator.listDeployedContracts();
    
    for (const contract of contracts) {
      const result = await this.orchestrator.verifyContract(
        `${contract.contractName}_${contract.network}`,
        [] // Add constructor args if needed
      );
      
      if (result.success) {
        console.log(`✅ ${contract.contractName} verified`);
      } else {
        console.warn(`⚠️  ${contract.contractName} verification failed: ${result.error}`);
      }
    }
  }

  // Interactive operations after deployment
  async interactiveOperations(): Promise<void> {
    console.log('🎮 Starting interactive operations...');

    // Get contract owner
    const ownerResult = await this.orchestrator.callContractMethod(
      'DelegationManager_localEspace',
      'owner'
    );

    if (ownerResult.success) {
      console.log(`👤 Contract Owner: ${ownerResult.data}`);
    }

    // Test creating a delegation (this would require proper setup)
    console.log('📝 Contract is ready for delegation operations');
  }

  // Run the orchestrator
  async run(network: string = 'localEspace'): Promise<void> {
    try {
      await this.deploymentPipeline(network);
      await this.interactiveOperations();
    } catch (error) {
      console.error('Orchestration failed:', error);
      process.exit(1);
    }
  }
}

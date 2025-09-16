#!/usr/bin/env ts-node

import { ConfluxNodeWrapper, FlowConfig } from './ConfluxNodeWrapper';
import fs from 'fs-extra';
import path from 'path';

interface MinimalNodeManagerConfig {
  rpcPort: number;
  coreRpcPort: number;
  dataDir: string;
  silent: boolean;
}

class MinimalNodeManager {
  private wrapper: ConfluxNodeWrapper;
  private config: MinimalNodeManagerConfig;

  constructor(config: Partial<MinimalNodeManagerConfig> = {}) {
    this.config = {
      rpcPort: 12537,
      coreRpcPort: 12539,
      dataDir: './node-data',
      silent: true,
      ...config
    };

    this.wrapper = new ConfluxNodeWrapper({
      rpcPort: this.config.rpcPort,
      coreRpcPort: this.config.coreRpcPort,
      dataDir: this.config.dataDir,
      silent: this.config.silent
    });
  }

  /**
   * Start the node
   */
  async start(): Promise<void> {
    console.log('🚀 Minimal Node Manager Starting...');
    console.log('='.repeat(40));
    
    try {
      await this.wrapper.start();
      console.log('✅ Node started successfully');
    } catch (error) {
      console.error('❌ Failed to start node:', error);
      throw error;
    }
  }

  /**
   * Stop the node
   */
  async stop(): Promise<void> {
    console.log('🛑 Minimal Node Manager Stopping...');
    
    try {
      await this.wrapper.stop();
      console.log('✅ Node stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop node:', error);
      throw error;
    }
  }

  /**
   * Execute a script
   */
  async executeScript(scriptPath: string, args: string[] = []): Promise<void> {
    console.log(`📜 Executing script: ${scriptPath}`);
    
    try {
      const result = await this.wrapper.executeScript(scriptPath, args);
      
      if (result.success) {
        console.log('✅ Script executed successfully');
        if (result.output) {
          console.log('📄 Output:', result.output);
        }
      } else {
        console.error('❌ Script execution failed:', result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Script execution error:', error);
      process.exit(1);
    }
  }

  /**
   * Execute a flow
   */
  async executeFlow(flowPath: string): Promise<void> {
    console.log(`🔄 Executing flow: ${flowPath}`);
    
    try {
      const flowConfig = await this.loadFlowConfig(flowPath);
      const results = await this.wrapper.executeFlow(flowConfig);
      
      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Flow completed: ${successCount}/${results.length} steps successful`);
      
      if (successCount < results.length) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Flow execution error:', error);
      process.exit(1);
    }
  }

  /**
   * Load flow configuration from file
   */
  private async loadFlowConfig(flowPath: string): Promise<FlowConfig> {
    const fullPath = path.resolve(flowPath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Flow file not found: ${fullPath}`);
    }

    const flowData = await fs.readJson(fullPath);
    return flowData as FlowConfig;
  }

  /**
   * Get node status
   */
  getStatus(): { running: boolean; ready: boolean; config: MinimalNodeManagerConfig } {
    const status = this.wrapper.getStatus();
    return {
      running: status.running,
      ready: status.ready,
      config: this.config
    };
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new MinimalNodeManager();

  try {
    switch (command) {
      case 'start':
        await manager.start();
        // Keep running until interrupted
        process.on('SIGINT', async () => {
          console.log('\n🛑 Received SIGINT, stopping node...');
          await manager.stop();
          process.exit(0);
        });
        
        // Keep the process alive
        await new Promise(() => {});
        break;

      case 'stop':
        await manager.stop();
        break;

      case 'exec':
        if (args.length < 2) {
          console.error('❌ Usage: exec <script-path> [args...]');
          process.exit(1);
        }
        await manager.start();
        await manager.executeScript(args[1], args.slice(2));
        await manager.stop();
        break;

      case 'flow':
        if (args.length < 2) {
          console.error('❌ Usage: flow <flow-config-path>');
          process.exit(1);
        }
        await manager.start();
        await manager.executeFlow(args[1]);
        await manager.stop();
        break;

      case 'status':
        const status = manager.getStatus();
        console.log('📊 Node Status:');
        console.log(`   Running: ${status.running}`);
        console.log(`   Ready: ${status.ready}`);
        console.log(`   RPC Port: ${status.config.rpcPort}`);
        console.log(`   Core RPC Port: ${status.config.coreRpcPort}`);
        break;

      default:
        console.log('🚀 Minimal Node Manager');
        console.log('='.repeat(30));
        console.log('Commands:');
        console.log('  start                    - Start the node');
        console.log('  stop                     - Stop the node');
        console.log('  exec <script> [args...]  - Execute a script');
        console.log('  flow <config>            - Execute a flow');
        console.log('  status                   - Show node status');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { MinimalNodeManager, ConfluxNodeWrapper };


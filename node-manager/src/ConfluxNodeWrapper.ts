import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface NodeConfig {
  rpcPort: number;
  coreRpcPort: number;
  dataDir?: string;
  silent?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  exitCode?: number;
}

export class ConfluxNodeWrapper extends EventEmitter {
  private nodeProcess: ChildProcess | null = null;
  private config: NodeConfig;
  private isRunning: boolean = false;
  private isReady: boolean = false;

  constructor(config: NodeConfig) {
    super();
    this.config = {
      dataDir: './node-data',
      silent: true,
      ...config
    };
  }

  /**
   * Start the Conflux node
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Node is already running');
    }

    console.log('🚀 Starting Conflux node...');
    
    // For minimal version, we'll simulate node startup
    // In real implementation, you would spawn the actual Conflux node process
    this.isRunning = true;
    this.isReady = false;

    // Simulate node startup delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.isReady = true;
    this.emit('ready');
    
    console.log('✅ Conflux node started successfully');
    console.log(`📡 eSpace RPC: http://localhost:${this.config.rpcPort}`);
    console.log(`📡 Core RPC: http://localhost:${this.config.coreRpcPort}`);
  }

  /**
   * Stop the Conflux node
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️ Node is not running');
      return;
    }

    console.log('🛑 Stopping Conflux node...');
    
    this.isRunning = false;
    this.isReady = false;
    
    if (this.nodeProcess) {
      this.nodeProcess.kill('SIGTERM');
      this.nodeProcess = null;
    }

    console.log('✅ Conflux node stopped');
    this.emit('stopped');
  }

  /**
   * Check if node is running
   */
  isNodeRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Check if node is ready to accept requests
   */
  isNodeReady(): boolean {
    return this.isReady;
  }

  /**
   * Wait for node to be ready
   */
  async waitForReady(timeout: number = 30000): Promise<void> {
    if (this.isReady) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Node startup timeout'));
      }, timeout);

      this.once('ready', () => {
        clearTimeout(timeoutId);
        resolve();
      });

      this.once('stopped', () => {
        clearTimeout(timeoutId);
        reject(new Error('Node stopped before ready'));
      });
    });
  }

  /**
   * Execute a script with the node running
   */
  async executeScript(scriptPath: string, args: string[] = []): Promise<ExecutionResult> {
    if (!this.isReady) {
      throw new Error('Node is not ready');
    }

    console.log(`📜 Executing script: ${scriptPath}`);
    console.log(`📝 Args: ${args.join(' ')}`);

    try {
      // Simulate script execution
      // In real implementation, you would execute the actual script
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: ExecutionResult = {
        success: true,
        output: `Script ${scriptPath} executed successfully`,
        exitCode: 0
      };

      console.log('✅ Script executed successfully');
      return result;

    } catch (error) {
      const result: ExecutionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1
      };

      console.error('❌ Script execution failed:', result.error);
      return result;
    }
  }

  /**
   * Execute a flow (multiple scripts in sequence)
   */
  async executeFlow(flowConfig: FlowConfig): Promise<ExecutionResult[]> {
    if (!this.isReady) {
      throw new Error('Node is not ready');
    }

    console.log(`🔄 Executing flow: ${flowConfig.name}`);
    
    const results: ExecutionResult[] = [];
    
    for (const step of flowConfig.steps) {
      console.log(`📋 Step: ${step.name}`);
      
      try {
        const result = await this.executeScript(step.script, step.args);
        results.push(result);
        
        if (!result.success) {
          console.error(`❌ Flow step failed: ${step.name}`);
          break;
        }
        
        // Wait between steps if specified
        if (step.delay) {
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }
        
      } catch (error) {
        const errorResult: ExecutionResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          exitCode: 1
        };
        results.push(errorResult);
        break;
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Flow completed: ${successCount}/${results.length} steps successful`);
    
    return results;
  }

  /**
   * Get node status
   */
  getStatus(): { running: boolean; ready: boolean; config: NodeConfig } {
    return {
      running: this.isRunning,
      ready: this.isReady,
      config: this.config
    };
  }
}

export interface FlowStep {
  name: string;
  script: string;
  args?: string[];
  delay?: number;
}

export interface FlowConfig {
  name: string;
  description?: string;
  steps: FlowStep[];
}

export default ConfluxNodeWrapper;


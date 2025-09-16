import { ethers } from 'ethers';
import { Conflux } from 'js-conflux-sdk';
import chalk from 'chalk';
import ora from 'ora';

export interface TestOptions {
  network?: string;
  port?: string;
  ethPort?: string;
}

export interface TestResult {
  network: string;
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export class TestRunner {
  private spinner: any = null;

  async runTests(options: TestOptions = {}): Promise<void> {
    const network = options.network || 'both';
    const corePort = parseInt(options.port || '12537');
    const evmPort = parseInt(options.ethPort || '8545');

    const results: TestResult[] = [];

    if (network === 'both' || network === 'espace') {
      this.spinner = ora('Running eSpace tests...').start();
      try {
        const espaceResults = await this.runEspaceTests(evmPort);
        results.push(...espaceResults);
        this.spinner.succeed(chalk.green(`eSpace tests completed: ${espaceResults.filter(r => r.passed).length}/${espaceResults.length} passed`));
      } catch (error) {
        this.spinner?.fail(chalk.red('eSpace tests failed'));
        throw error;
      }
    }

    if (network === 'both' || network === 'core') {
      this.spinner = ora('Running Core tests...').start();
      try {
        const coreResults = await this.runCoreTests(corePort);
        results.push(...coreResults);
        this.spinner.succeed(chalk.green(`Core tests completed: ${coreResults.filter(r => r.passed).length}/${coreResults.length} passed`));
      } catch (error) {
        this.spinner?.fail(chalk.red('Core tests failed'));
        throw error;
      }
    }

    // Display results
    this.displayResults(results);
  }

  private async runEspaceTests(port: number): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // Connect to local EVM node
      const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${port}`);
      const wallet = new ethers.Wallet(
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        provider
      );

      // Test 1: Check connection
      const startTime = Date.now();
      try {
        const blockNumber = await provider.getBlockNumber();
        results.push({
          network: 'espace',
          test: 'Connection Test',
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          network: 'espace',
          test: 'Connection Test',
          passed: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 2: Check account balance
      const balanceStartTime = Date.now();
      try {
        const balance = await provider.getBalance(wallet.address);
        results.push({
          network: 'espace',
          test: 'Balance Check',
          passed: balance > 0n,
          duration: Date.now() - balanceStartTime,
          error: balance === 0n ? 'Account has no balance' : undefined
        });
      } catch (error) {
        results.push({
          network: 'espace',
          test: 'Balance Check',
          passed: false,
          duration: Date.now() - balanceStartTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 3: Check network ID
      const networkStartTime = Date.now();
      try {
        const network = await provider.getNetwork();
        results.push({
          network: 'espace',
          test: 'Network ID Check',
          passed: network.chainId === 2222n,
          duration: Date.now() - networkStartTime,
          error: network.chainId !== 2222n ? `Expected chain ID 2222, got ${network.chainId}` : undefined
        });
      } catch (error) {
        results.push({
          network: 'espace',
          test: 'Network ID Check',
          passed: false,
          duration: Date.now() - networkStartTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    } catch (error) {
      results.push({
        network: 'espace',
        test: 'Setup',
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  private async runCoreTests(port: number): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // Connect to local Core node
      const conflux = new Conflux({
        url: `http://127.0.0.1:${port}`,
        networkId: 1111
      });

      const account = conflux.wallet.addPrivateKey(
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      );

      // Test 1: Check connection
      const startTime = Date.now();
      try {
        const status = await conflux.getStatus();
        results.push({
          network: 'core',
          test: 'Connection Test',
          passed: true,
          duration: Date.now() - startTime
        });
      } catch (error) {
        results.push({
          network: 'core',
          test: 'Connection Test',
          passed: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 2: Check account balance
      const balanceStartTime = Date.now();
      try {
        const balance = await conflux.getBalance(account.address);
        // Convert to string for comparison
        const balanceStr = balance.toString();
        results.push({
          network: 'core',
          test: 'Balance Check',
          passed: balanceStr !== '0',
          duration: Date.now() - balanceStartTime,
          error: balanceStr === '0' ? 'Account has no balance' : undefined
        });
      } catch (error) {
        results.push({
          network: 'core',
          test: 'Balance Check',
          passed: false,
          duration: Date.now() - balanceStartTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 3: Check network ID
      const networkStartTime = Date.now();
      try {
        const networkId = conflux.networkId;
        results.push({
          network: 'core',
          test: 'Network ID Check',
          passed: networkId === 1111,
          duration: Date.now() - networkStartTime,
          error: networkId !== 1111 ? `Expected network ID 1111, got ${networkId}` : undefined
        });
      } catch (error) {
        results.push({
          network: 'core',
          test: 'Network ID Check',
          passed: false,
          duration: Date.now() - networkStartTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    } catch (error) {
      results.push({
        network: 'core',
        test: 'Setup',
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  private displayResults(results: TestResult[]): void {
    console.log(chalk.blue('\n📊 Test Results:'));
    console.log('================');

    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.network]) {
        acc[result.network] = [];
      }
      acc[result.network].push(result);
      return acc;
    }, {} as Record<string, TestResult[]>);

    Object.entries(groupedResults).forEach(([network, networkResults]) => {
      console.log(chalk.blue(`\n${network.toUpperCase()} Network:`));
      networkResults.forEach(result => {
        const status = result.passed ? chalk.green('✅') : chalk.red('❌');
        const duration = `${result.duration}ms`;
        console.log(`  ${status} ${result.test} (${duration})`);
        if (result.error) {
          console.log(chalk.red(`    Error: ${result.error}`));
        }
      });
    });

    const totalPassed = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : '0';

    console.log(chalk.blue(`\nOverall: ${totalPassed}/${totalTests} tests passed (${successRate}%)`));
  }
}
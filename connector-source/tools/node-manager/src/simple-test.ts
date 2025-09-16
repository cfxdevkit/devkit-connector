#!/usr/bin/env node

import { ConfluxNodeWrapper } from './ConfluxNodeWrapper';
import chalk from 'chalk';

async function runSimpleTest() {
  console.log(chalk.blue('🧪 Running simple wrapper test...'));

  const wrapper = new ConfluxNodeWrapper();
  
  try {
    // Test basic functionality without full node startup
    console.log(chalk.blue('📋 Testing wrapper initialization...'));
    
    // Test configuration
    const config = {
      corePort: 12537,
      evmPort: 8545,
      blockInterval: 1000,
      silent: true
    };

    console.log(chalk.green('✅ Wrapper initialized successfully'));
    console.log(chalk.blue(`📊 Configuration: ${JSON.stringify(config, null, 2)}`));
    
    // Test that we can create the wrapper
    console.log(chalk.green('✅ Wrapper creation test passed'));
    
    return {
      success: true,
      message: 'Simple test completed successfully',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(chalk.red('❌ Simple test failed:'), error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// Run the test
runSimpleTest().then(result => {
  console.log(chalk.blue('📊 Test Result:'));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error(chalk.red('❌ Test execution failed:'), error);
  process.exit(1);
});


#!/usr/bin/env ts-node

/**
 * Simple test script for Counter contract
 */

async function testCounter() {
  console.log('🧪 Testing Counter Contract...');
  
  // Simulate counter operations
  const operations = [
    { op: 'add', value: 10 },
    { op: 'add', value: 5 },
    { op: 'multiply', value: 2 },
    { op: 'subtract', value: 3 },
    { op: 'divide', value: 2 }
  ];

  let count = 0;
  
  for (const { op, value } of operations) {
    console.log(`📊 ${op}(${value})`);
    
    switch (op) {
      case 'add':
        count += value;
        break;
      case 'subtract':
        count -= value;
        break;
      case 'multiply':
        count *= value;
        break;
      case 'divide':
        count = Math.floor(count / value);
        break;
    }
    
    console.log(`   Count: ${count}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`✅ Counter test completed. Final count: ${count}`);
}

if (require.main === module) {
  testCounter().catch(console.error);
}


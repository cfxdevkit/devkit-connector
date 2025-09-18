// Test DevKit imports
console.log('Testing DevKit package imports...');

try {
  console.log('1. Testing @conflux-devkit/core...');
  const core = await import('@conflux-devkit/core');
  console.log('✅ Core package imported successfully');
  console.log('   Available exports:', Object.keys(core).slice(0, 10));
} catch (error) {
  console.error('❌ Core package import failed:', error.message);
}

try {
  console.log('2. Testing @conflux-devkit/blockchain...');
  const blockchain = await import('@conflux-devkit/blockchain');
  console.log('✅ Blockchain package imported successfully');
  console.log('   Available exports:', Object.keys(blockchain).slice(0, 10));
} catch (error) {
  console.error('❌ Blockchain package import failed:', error.message);
}

try {
  console.log('3. Testing @conflux-devkit/state...');
  const state = await import('@conflux-devkit/state');
  console.log('✅ State package imported successfully');
  console.log('   Available exports:', Object.keys(state).slice(0, 10));
} catch (error) {
  console.error('❌ State package import failed:', error.message);
}

try {
  console.log('4. Testing @conflux-devkit/node...');
  const node = await import('@conflux-devkit/node');
  console.log('✅ Node package imported successfully');
  console.log('   Available exports:', Object.keys(node).slice(0, 10));
} catch (error) {
  console.error('❌ Node package import failed:', error.message);
}

console.log('Import test completed.');





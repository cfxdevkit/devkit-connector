#!/usr/bin/env node

import { execSync } from 'node:child_process';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function runCommand(command, description) {
  console.log(`\n🔍 ${description}...`);
  try {
    const output = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    console.log(`✅ ${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.stdout || error.stderr || error.message);
    return { success: false, error };
  }
}

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function checkpoint() {
  console.log('🚀 Starting Conflux DevKit Checkpoint...\n');

  // Step 1: Run Biome checks
  const biomeResult = runCommand('pnpm run check', 'Running Biome checks');
  if (!biomeResult.success) {
    console.log(
      '\n❌ Biome checks failed. Please fix the issues before proceeding.'
    );
    rl.close();
    process.exit(1);
  }

  // Step 2: Run builds
  const buildResult = runCommand('pnpm run build', 'Building all packages');
  if (!buildResult.success) {
    console.log(
      '\n❌ Build failed. Please fix the build issues before proceeding.'
    );
    rl.close();
    process.exit(1);
  }

  // Step 3: Run tests
  const testResult = runCommand('pnpm run test', 'Running tests');
  if (!testResult.success) {
    console.log(
      '\n❌ Tests failed. Please fix the test issues before proceeding.'
    );
    rl.close();
    process.exit(1);
  }

  // Step 4: Run final check
  const finalCheckResult = runCommand('pnpm run check', 'Final Biome check');
  if (!finalCheckResult.success) {
    console.log(
      '\n❌ Final check failed. Please fix the remaining issues before proceeding.'
    );
    rl.close();
    process.exit(1);
  }

  console.log('\n✅ All diagnostic steps completed successfully!');

  // Step 5: Get commit message
  const commitMessage = await askQuestion('\n📝 Enter commit message: ');
  if (!commitMessage.trim()) {
    console.log('\n❌ Commit message cannot be empty.');
    rl.close();
    process.exit(1);
  }

  // Step 6: Commit changes
  console.log('\n💾 Committing changes...');
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log('✅ Changes committed successfully');
  } catch (error) {
    console.error('❌ Failed to commit changes:', error.message);
    rl.close();
    process.exit(1);
  }

  // Step 7: Push changes
  const shouldPush = await askQuestion('\n🚀 Push changes to remote? (y/N): ');
  if (shouldPush.toLowerCase() === 'y' || shouldPush.toLowerCase() === 'yes') {
    console.log('\n📤 Pushing changes...');
    try {
      execSync('git push', { stdio: 'inherit' });
      console.log('✅ Changes pushed successfully');
    } catch (error) {
      console.error('❌ Failed to push changes:', error.message);
      rl.close();
      process.exit(1);
    }
  } else {
    console.log('\n⏸️  Skipping push. Changes are committed locally.');
  }

  console.log('\n🎉 Checkpoint completed successfully!');
  console.log('📊 Summary:');
  console.log('  ✅ Biome checks passed');
  console.log('  ✅ All packages built successfully');
  console.log('  ✅ All tests passed');
  console.log('  ✅ Final checks passed');
  console.log('  ✅ Changes committed');
  if (shouldPush.toLowerCase() === 'y' || shouldPush.toLowerCase() === 'yes') {
    console.log('  ✅ Changes pushed to remote');
  }

  rl.close();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Checkpoint interrupted by user');
  rl.close();
  process.exit(0);
});

checkpoint().catch(error => {
  console.error('\n💥 Checkpoint failed with error:', error.message);
  rl.close();
  process.exit(1);
});

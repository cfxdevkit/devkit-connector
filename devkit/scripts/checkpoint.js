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

  // Step 5: Validate changelog
  const changelogResult = runCommand('pnpm changelog show', 'Checking changelog status');
  if (!changelogResult.success) {
    console.log(
      '\n❌ Changelog check failed. Please ensure changelog is accessible.'
    );
    rl.close();
    process.exit(1);
  }

  // Check if changelog has recent entries (within last 7 days)
  try {
    const changelogContent = changelogResult.output;
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    // Look for recent changelog entries - check for any date pattern in the last 7 days
    const datePattern = /\d{4}-\d{2}-\d{2}/g;
    const dates = changelogContent.match(datePattern) || [];
    
    let hasRecentEntry = false;
    for (const date of dates) {
      const entryDate = new Date(date);
      if (entryDate >= sevenDaysAgo && entryDate <= today) {
        hasRecentEntry = true;
        break;
      }
    }
    
    // Also check for today's date specifically
    if (!hasRecentEntry) {
      hasRecentEntry = changelogContent.includes(todayStr) || 
                      changelogContent.includes(sevenDaysAgoStr);
    }
    
    if (!hasRecentEntry) {
      console.log('\n⚠️  Warning: No recent changelog entries found.');
      console.log('   Consider running: pnpm changelog add');
      console.log('   This will not fail the checkpoint but is recommended.');
    } else {
      console.log('✅ Recent changelog entries found');
    }
  } catch (error) {
    console.log('\n⚠️  Warning: Could not validate changelog dates.');
    console.log('   This will not fail the checkpoint but consider running: pnpm changelog add');
  }

  console.log('\n✅ All diagnostic steps completed successfully!');
  console.log('\n🎉 Checkpoint completed successfully!');
  console.log('📊 Summary:');
  console.log('  ✅ Biome checks passed');
  console.log('  ✅ All packages built successfully');
  console.log('  ✅ All tests passed');
  console.log('  ✅ Final checks passed');
  console.log('  ✅ Changelog validation completed');
  console.log('\n💡 Ready for manual commit!');
  console.log('   Run: git add . && git commit -m "your message"');

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

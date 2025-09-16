#!/usr/bin/env node

/**
 * Simple test script that doesn't require full node startup
 * Usage: node examples/simple-test.js
 */

export default async function simpleTest(node) {
  // Just return basic information about the wrapper
  return {
    message: 'Simple test executed successfully',
    timestamp: new Date().toISOString(),
    nodeAvailable: !!node,
    coreClient: !!node.getCoreClient(),
    evmClient: !!node.getEvmClient()
  };
}


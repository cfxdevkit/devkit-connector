import { DeploymentOrchestrator } from './deployment-orchestrator';

async function main() {
  const orchestrator = new DeploymentOrchestrator();
  
  // Get network from command line args or default to localEspace
  const network = process.argv[2] || 'localEspace';
  
  console.log(`🚀 Starting orchestration on ${network} network`);
  
  await orchestrator.run(network);
}

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

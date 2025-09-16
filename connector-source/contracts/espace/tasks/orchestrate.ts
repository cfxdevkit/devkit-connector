import { task } from "hardhat/config";
import { DeploymentOrchestrator } from "../scripts/deployment-orchestrator";

task("orchestrate", "Deploy contracts using the orchestrator")
  .addOptionalParam("network", "Network to deploy to", "localEspace")
  .setAction(async (taskArgs, hre) => {
    const orchestrator = new DeploymentOrchestrator();
    
    console.log(`🚀 Starting orchestration on ${taskArgs.network} network`);
    
    await orchestrator.run(taskArgs.network);
  });

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DelegationManagerModule = buildModule("DelegationManagerModule", (m) => {
  const delegationManager = m.contract("DelegationManager", []);

  return { delegationManager };
});

export default DelegationManagerModule;

// UI-friendly contract representation and visualization helpers

import type {
  ContractDeploymentSummary,
  ContractInteractionSummary,
  ContractOrchestrator,
} from '../types/contract-orchestration';

export class ContractUIRepresentation {
  /**
   * Create UI-friendly contract card data
   */
  static createContractCard(contract: ContractOrchestrator): {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    address: string;
    network: string;
    chainType: 'core' | 'evm';
    category: string;
    tags: string[];
    icon?: string;
    color?: string;
    status: 'active' | 'inactive' | 'error';
    capabilities: {
      canRead: boolean;
      canWrite: boolean;
      hasEvents: boolean;
    };
    stats: {
      methods: number;
      events: number;
      usageCount: number;
      lastUsed?: Date;
    };
    actions: Array<{
      label: string;
      type: 'read' | 'write' | 'event' | 'info';
      method?: string;
      description?: string;
    }>;
  } {
    return {
      id: contract.id,
      title: contract.ui.displayName,
      subtitle: contract.address,
      description: contract.ui.description,
      address: contract.address,
      network: contract.network.name,
      chainType: contract.chainType,
      category: contract.ui.category,
      tags: contract.ui.tags,
      icon: contract.metadata.icon,
      color: contract.metadata.color,
      status: contract.ui.isActive
        ? contract.types.error
          ? 'error'
          : 'active'
        : 'inactive',
      capabilities: {
        canRead: contract.capabilities.canRead,
        canWrite: contract.capabilities.canWrite,
        hasEvents: contract.capabilities.hasEvents,
      },
      stats: {
        methods: contract.methods.read.length + contract.methods.write.length,
        events: contract.methods.events.length,
        usageCount: contract.ui.usageCount,
        lastUsed: contract.ui.lastUsed,
      },
      actions: ContractUIRepresentation.createContractActions(contract),
    };
  }

  /**
   * Create contract actions for UI
   */
  private static createContractActions(contract: ContractOrchestrator): Array<{
    label: string;
    type: 'read' | 'write' | 'event' | 'info';
    method?: string;
    description?: string;
  }> {
    const actions: Array<{
      label: string;
      type: 'read' | 'write' | 'event' | 'info';
      method?: string;
      description?: string;
    }> = [];

    // Add read methods
    for (const method of contract.methods.read.slice(0, 3)) {
      actions.push({
        label: method.name,
        type: 'read',
        method: method.name,
        description: `Read ${method.name}`,
      });
    }

    // Add write methods
    for (const method of contract.methods.write.slice(0, 3)) {
      actions.push({
        label: method.name,
        type: 'write',
        method: method.name,
        description: `Call ${method.name}`,
      });
    }

    // Add events
    if (contract.methods.events.length > 0) {
      actions.push({
        label: 'View Events',
        type: 'event',
        description: `View ${contract.methods.events.length} events`,
      });
    }

    // Add info action
    actions.push({
      label: 'Contract Info',
      type: 'info',
      description: 'View contract details',
    });

    return actions;
  }

  /**
   * Create method list for UI
   */
  static createMethodList(contract: ContractOrchestrator): {
    read: Array<{
      name: string;
      description: string;
      inputs: Array<{ name: string; type: string; required: boolean }>;
      outputs: Array<{ name: string; type: string }>;
      isView: boolean;
      isPure: boolean;
    }>;
    write: Array<{
      name: string;
      description: string;
      inputs: Array<{ name: string; type: string; required: boolean }>;
      outputs: Array<{ name: string; type: string }>;
      isPayable: boolean;
      gasEstimate?: bigint;
    }>;
    events: Array<{
      name: string;
      description: string;
      inputs: Array<{ name: string; type: string; indexed: boolean }>;
      category: string;
    }>;
  } {
    return {
      read: contract.methods.read.map((method) => ({
        name: method.name,
        description: method.description || `Read ${method.name}`,
        inputs: method.inputs.map((input) => ({
          name: input.name,
          type: input.type,
          required: true,
        })),
        outputs: method.outputs.map((output) => ({
          name: output.name,
          type: output.type,
        })),
        isView: method.isView || false,
        isPure: method.isPure || false,
      })),
      write: contract.methods.write.map((method) => ({
        name: method.name,
        description: method.description || `Call ${method.name}`,
        inputs: method.inputs.map((input) => ({
          name: input.name,
          type: input.type,
          required: true,
        })),
        outputs: method.outputs.map((output) => ({
          name: output.name,
          type: output.type,
        })),
        isPayable: method.isPayable || false,
        gasEstimate: method.gasEstimate,
      })),
      events: contract.methods.events.map((event) => ({
        name: event.name,
        description: event.description || `Event ${event.name}`,
        inputs: event.inputs.map((input) => ({
          name: input.name,
          type: input.type,
          indexed: input.indexed || false,
        })),
        category: event.category || 'custom',
      })),
    };
  }

  /**
   * Create deployment summary for UI
   */
  static createDeploymentSummaryUI(summary: ContractDeploymentSummary): {
    totalContracts: number;
    byChainType: { evm: number; core: number };
    byNetwork: Array<{ network: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
    recentlyDeployed: Array<{
      name: string;
      address: string;
      network: string;
      deployedAt: Date;
    }>;
    mostUsed: Array<{
      name: string;
      address: string;
      usageCount: number;
    }>;
    withErrors: Array<{
      name: string;
      address: string;
      error: string;
    }>;
  } {
    return {
      totalContracts: summary.totalContracts,
      byChainType: summary.byChainType,
      byNetwork: Object.entries(summary.byNetwork).map(([network, count]) => ({
        network,
        count,
      })),
      byCategory: Object.entries(summary.byCategory).map(
        ([category, count]) => ({
          category,
          count,
        })
      ),
      recentlyDeployed: summary.recentlyDeployed.map((contract) => ({
        name: contract.name,
        address: contract.address,
        network: contract.network.name,
        deployedAt: contract.deployment.deployedAt,
      })),
      mostUsed: summary.mostUsed.map((contract) => ({
        name: contract.name,
        address: contract.address,
        usageCount: contract.ui.usageCount,
      })),
      withErrors: summary.withErrors.map((contract) => ({
        name: contract.name,
        address: contract.address,
        error: contract.types.error || 'Unknown error',
      })),
    };
  }

  /**
   * Create interaction summary for UI
   */
  static createInteractionSummaryUI(summary: ContractInteractionSummary): {
    contractName: string;
    totalCalls: number;
    readCalls: number;
    writeCalls: number;
    eventLogs: number;
    successRate: number;
    averageGasUsed: string;
    totalGasUsed: string;
    lastInteraction: Date;
    errors: Array<{
      methodName: string;
      error: string;
      count: number;
      lastOccurred: Date;
    }>;
  } {
    return {
      contractName: summary.contractName,
      totalCalls: summary.totalCalls,
      readCalls: summary.readCalls,
      writeCalls: summary.writeCalls,
      eventLogs: summary.eventLogs,
      successRate: Math.round(summary.successRate * 100) / 100,
      averageGasUsed: ContractUIRepresentation.formatGas(
        summary.averageGasUsed
      ),
      totalGasUsed: ContractUIRepresentation.formatGas(summary.totalGasUsed),
      lastInteraction: summary.lastInteraction,
      errors: summary.errors,
    };
  }

  /**
   * Create contract dashboard data
   */
  static createContractDashboard(contracts: ContractOrchestrator[]): {
    overview: {
      totalContracts: number;
      activeContracts: number;
      contractsWithErrors: number;
      totalInteractions: number;
    };
    byChainType: { evm: number; core: number };
    byCategory: Array<{ category: string; count: number; percentage: number }>;
    byNetwork: Array<{ network: string; count: number; percentage: number }>;
    recentActivity: Array<{
      contractName: string;
      action: string;
      timestamp: Date;
      success: boolean;
    }>;
    topContracts: Array<{
      name: string;
      address: string;
      usageCount: number;
      successRate: number;
    }>;
  } {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter((c) => c.ui.isActive).length;
    const contractsWithErrors = contracts.filter((c) => c.types.error).length;

    // Calculate by chain type
    const byChainType = {
      evm: contracts.filter((c) => c.chainType === 'evm').length,
      core: contracts.filter((c) => c.chainType === 'core').length,
    };

    // Calculate by category
    const categoryCounts: Record<string, number> = {};
    for (const contract of contracts) {
      const category = contract.metadata.category || 'custom';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    const byCategory = Object.entries(categoryCounts).map(
      ([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalContracts) * 100),
      })
    );

    // Calculate by network
    const networkCounts: Record<string, number> = {};
    for (const contract of contracts) {
      networkCounts[contract.networkId] =
        (networkCounts[contract.networkId] || 0) + 1;
    }
    const byNetwork = Object.entries(networkCounts).map(([network, count]) => ({
      network,
      count,
      percentage: Math.round((count / totalContracts) * 100),
    }));

    // Mock recent activity (would come from actual interaction logs)
    const recentActivity: Array<{
      contractName: string;
      action: string;
      timestamp: Date;
      success: boolean;
    }> = [];

    // Top contracts by usage
    const topContracts = contracts
      .sort((a, b) => b.ui.usageCount - a.ui.usageCount)
      .slice(0, 5)
      .map((contract) => ({
        name: contract.name,
        address: contract.address,
        usageCount: contract.ui.usageCount,
        successRate: 100, // Would calculate from actual data
      }));

    return {
      overview: {
        totalContracts,
        activeContracts,
        contractsWithErrors,
        totalInteractions: contracts.reduce(
          (sum, c) => sum + c.ui.usageCount,
          0
        ),
      },
      byChainType,
      byCategory,
      byNetwork,
      recentActivity,
      topContracts,
    };
  }

  /**
   * Format gas amount for display
   */
  private static formatGas(gas: bigint): string {
    if (gas === 0n) return '0';
    if (gas < 1000n) return gas.toString();
    if (gas < 1000000n) return `${(Number(gas) / 1000).toFixed(1)}K`;
    if (gas < 1000000000n) return `${(Number(gas) / 1000000).toFixed(1)}M`;
    return `${(Number(gas) / 1000000000).toFixed(1)}B`;
  }

  /**
   * Create contract search suggestions
   */
  static createSearchSuggestions(contracts: ContractOrchestrator[]): Array<{
    type: 'contract' | 'method' | 'event';
    name: string;
    contractName: string;
    description: string;
    category: string;
  }> {
    const suggestions: Array<{
      type: 'contract' | 'method' | 'event';
      name: string;
      contractName: string;
      description: string;
      category: string;
    }> = [];

    for (const contract of contracts) {
      // Add contract suggestions
      suggestions.push({
        type: 'contract',
        name: contract.name,
        contractName: contract.name,
        description: contract.ui.description,
        category: contract.ui.category,
      });

      // Add method suggestions
      for (const method of [
        ...contract.methods.read,
        ...contract.methods.write,
      ]) {
        suggestions.push({
          type: 'method',
          name: method.name,
          contractName: contract.name,
          description: `${method.name} method in ${contract.name}`,
          category: method.category || 'method',
        });
      }

      // Add event suggestions
      for (const event of contract.methods.events) {
        suggestions.push({
          type: 'event',
          name: event.name,
          contractName: contract.name,
          description: `${event.name} event in ${contract.name}`,
          category: event.category || 'event',
        });
      }
    }

    return suggestions;
  }
}

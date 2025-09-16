import { DelegationSession, DelegationConfig, WalletOperation } from '@conflux-wallet/types';
import { EventEmitter } from 'events';

export class DelegationEngine extends EventEmitter {
  private sessions: Map<string, DelegationSession> = new Map();
  private operations: Map<string, WalletOperation> = new Map();

  /**
   * Create a new delegation session
   */
  async createSession(
    userAddress: string,
    signature: string,
    message: string,
    config: DelegationConfig
  ): Promise<DelegationSession> {
    // Verify signature
    const isValid = await this.verifySignature(userAddress, message, signature);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    const sessionId = this.generateSessionId();
    const expiresAt = Date.now() + (config.sessionDuration || 60) * 60 * 1000;

    const session: DelegationSession = {
      sessionId,
      userAddress,
      eSpaceAddress: userAddress, // Convert if needed
      coreAddress: this.convertToCoreAddress(userAddress),
      expiresAt,
      permissions: config.allowedOperations || ['sign_transaction', 'sign_message'],
      config
    };

    this.sessions.set(sessionId, session);
    this.emit('session_created', session);

    return session;
  }

  /**
   * Get active delegation session
   */
  getSession(sessionId: string): DelegationSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  /**
   * Create a wallet operation
   */
  async createOperation(
    sessionId: string,
    type: WalletOperation['type'],
    payload: any,
    chainType: 'eSpace' | 'core'
  ): Promise<WalletOperation> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    const operation: WalletOperation = {
      id: this.generateOperationId(),
      sessionId,
      type,
      status: 'pending',
      chainType,
      payload,
      createdAt: Date.now(),
      requiresUserApproval: await this.requiresUserApproval(session, type, payload)
    };

    this.operations.set(operation.id, operation);
    this.emit('operation_created', operation);

    return operation;
  }

  /**
   * Verify wallet signature
   */
  private async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      const { verifyMessage } = await import('ethers');
      const recoveredAddress = verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Convert eSpace address to Core format
   */
  private convertToCoreAddress(eSpaceAddress: string): string {
    // Implementation would use js-conflux-sdk format.address
    return `cfx:${eSpaceAddress.slice(2)}`;
  }

  /**
   * Check if operation requires user approval
   */
  private async requiresUserApproval(
    session: DelegationSession,
    type: string,
    payload: any
  ): Promise<boolean> {
    // Check auto-approval rules
    if (session.config.autoApprovalRules) {
      for (const rule of session.config.autoApprovalRules) {
        if (await this.matchesRule(rule, payload)) {
          return !rule.autoApprove;
        }
      }
    }

    // Default to requiring approval for write operations
    return ['sign_transaction', 'sign_message'].includes(type);
  }

  /**
   * Check if payload matches auto-approval rule
   */
  private async matchesRule(rule: any, payload: any): Promise<boolean> {
    switch (rule.type) {
      case 'transaction_value':
        const value = BigInt(payload.value || '0');
        const ruleValue = BigInt(rule.value as string);
        return rule.condition === 'less_than' ? value < ruleValue : value === ruleValue;
      case 'contract_address':
        const to = payload.to?.toLowerCase();
        const addresses = (rule.value as string[]).map(addr => addr.toLowerCase());
        return rule.condition === 'whitelist' ? addresses.includes(to) : !addresses.includes(to);
      default:
        return false;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

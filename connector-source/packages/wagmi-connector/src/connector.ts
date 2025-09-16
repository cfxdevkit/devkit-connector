import { Connector } from 'wagmi'
import { getAddress, type Address, type Chain } from 'viem'
import { confluxESpace, confluxESpaceTestnet } from './chains'
import { DelegationEngine } from '@conflux-wallet/core'
import { DelegationConfig } from '@conflux-wallet/types'

export interface ConfluxDelegationOptions {
  mode: 'server-managed' | 'user-delegated'
  serverUrl?: string
  delegationConfig?: DelegationConfig
  chains?: Chain[]
}

export class ConfluxDelegationConnector extends Connector<
  any,
  ConfluxDelegationOptions
> {
  readonly id = 'conflux-delegation'
  readonly name = 'Conflux Delegation'
  readonly ready = true

  private delegationEngine: DelegationEngine
  private currentMode: 'server-managed' | 'user-delegated' | null = null

  constructor(config: { chains?: Chain[]; options: ConfluxDelegationOptions }) {
    super({
      chains: config.chains ?? [confluxESpace, confluxESpaceTestnet],
      options: config.options,
    })
    
    this.delegationEngine = new DelegationEngine()
  }

  async connect(config?: { chainId?: number }): Promise<{
    account: Address
    chain: { id: number; unsupported: boolean }
    provider: any
  }> {
    const { mode } = this.options
    
    if (mode === 'server-managed') {
      return this.connectServerManaged(config)
    } else {
      return this.connectUserDelegated(config)
    }
  }

  private async connectServerManaged(config?: { chainId?: number }) {
    // Mock implementation - would integrate with actual server
    const mockAddress = '0x742d35Cc6634C0532925a3b8D4B17dd07E2b9e84'
    
    this.currentMode = 'server-managed'
    
    return {
      account: getAddress(mockAddress),
      chain: { 
        id: config?.chainId ?? confluxESpace.id, 
        unsupported: false 
      },
      provider: {} as any,
    }
  }

  private async connectUserDelegated(config?: { chainId?: number }) {
    // Mock implementation - would integrate with actual delegation
    const mockAddress = '0x742d35Cc6634C0532925a3b8D4B17dd07E2b9e84'
    
    this.currentMode = 'user-delegated'
    
    return {
      account: getAddress(mockAddress),
      chain: { 
        id: config?.chainId ?? confluxESpace.id, 
        unsupported: false 
      },
      provider: {} as any,
    }
  }

  async disconnect(): Promise<void> {
    this.currentMode = null
  }

  async getAccount(): Promise<Address> {
    return getAddress('0x742d35Cc6634C0532925a3b8D4B17dd07E2b9e84')
  }

  async getChainId(): Promise<number> {
    return confluxESpace.id
  }

  async getProvider(): Promise<any> {
    return {} as any
  }

  async isAuthorized(): Promise<boolean> {
    return this.currentMode !== null
  }

  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) this.emit('disconnect')
    else this.emit('change', { account: getAddress(accounts[0]!) })
  }

  protected onChainChanged(chain: string | number): void {
    const id = Number(chain)
    const unsupported = !this.chains.some((x) => x.id === id)
    this.emit('change', { chain: { id, unsupported } })
  }

  protected onDisconnect(): void {
    this.emit('disconnect')
  }
}

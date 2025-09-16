import { ContractService, createContractService, ContractConfig } from "@conflux-wallet/server";

export interface WebComponentConfig extends ContractConfig {
  theme?: 'light' | 'dark';
  locale?: string;
  debug?: boolean;
}

export abstract class BaseWebComponent extends HTMLElement {
  protected contractService?: ContractService;
  protected config: WebComponentConfig;
  protected shadowRoot: ShadowRoot;
  protected isConnected = false;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.config = this.getDefaultConfig();
    this.setupEventListeners();
  }

  // Abstract methods to be implemented by subclasses
  protected abstract getDefaultConfig(): WebComponentConfig;
  protected abstract render(): void;
  protected abstract getTemplate(): string;
  protected abstract getStyles(): string;

  // Web Component lifecycle
  connectedCallback() {
    this.isConnected = true;
    this.initializeContractService();
    this.render();
    this.setupContractEventListeners();
  }

  disconnectedCallback() {
    this.isConnected = false;
    this.cleanup();
  }

  // Attribute handling
  static get observedAttributes() {
    return [
      'network',
      'rpc-url',
      'theme',
      'locale',
      'debug',
      'contract-address'
    ];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'network':
        this.config.network = newValue as any;
        break;
      case 'rpc-url':
        this.config.rpcUrl = newValue;
        break;
      case 'theme':
        this.config.theme = newValue as 'light' | 'dark';
        break;
      case 'locale':
        this.config.locale = newValue;
        break;
      case 'debug':
        this.config.debug = newValue === 'true';
        break;
      case 'contract-address':
        // Handle custom contract address
        break;
    }

    if (this.isConnected) {
      this.initializeContractService();
      this.render();
    }
  }

  // Contract service initialization
  protected initializeContractService() {
    try {
      this.contractService = createContractService(this.config);
      this.log('Contract service initialized', { config: this.config });
    } catch (error) {
      this.log('Failed to initialize contract service', { error });
      this.dispatchEvent(new CustomEvent('contract-error', {
        detail: { error: error.message }
      }));
    }
  }

  // Event system
  protected setupEventListeners() {
    // Override in subclasses for specific event handling
  }

  protected setupContractEventListeners() {
    // Override in subclasses for contract-specific events
  }

  // Rendering
  protected render() {
    if (!this.isConnected) return;

    const template = this.getTemplate();
    const styles = this.getStyles();
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${template}
    `;

    this.attachEventListeners();
  }

  protected attachEventListeners() {
    // Override in subclasses to attach specific event listeners
  }

  // Utility methods
  protected log(message: string, data?: any) {
    if (this.config.debug) {
      console.log(`[${this.tagName}] ${message}`, data);
    }
  }

  protected dispatchCustomEvent(eventName: string, detail?: any) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  // Contract operations
  protected async executeContractOperation<T>(
    operation: () => Promise<T>,
    eventName: string
  ): Promise<T | null> {
    try {
      this.dispatchCustomEvent(`${eventName}-start`);
      const result = await operation();
      this.dispatchCustomEvent(`${eventName}-success`, { result });
      return result;
    } catch (error) {
      this.log(`Contract operation failed: ${eventName}`, { error });
      this.dispatchCustomEvent(`${eventName}-error`, { error: error.message });
      return null;
    }
  }

  // Cleanup
  protected cleanup() {
    // Override in subclasses for specific cleanup
  }

  // Getters for common properties
  get network() {
    return this.getAttribute('network') || 'confluxEspaceTestnet';
  }

  get rpcUrl() {
    return this.getAttribute('rpc-url') || '';
  }

  get theme() {
    return this.getAttribute('theme') || 'light';
  }

  get locale() {
    return this.getAttribute('locale') || 'en';
  }

  get debug() {
    return this.getAttribute('debug') === 'true';
  }

  get contractAddress() {
    return this.getAttribute('contract-address') || '';
  }

  // Setters for common properties
  set network(value: string) {
    this.setAttribute('network', value);
  }

  set rpcUrl(value: string) {
    this.setAttribute('rpc-url', value);
  }

  set theme(value: string) {
    this.setAttribute('theme', value);
  }

  set locale(value: string) {
    this.setAttribute('locale', value);
  }

  set debug(value: boolean) {
    this.setAttribute('debug', value.toString());
  }

  set contractAddress(value: string) {
    this.setAttribute('contract-address', value);
  }
}

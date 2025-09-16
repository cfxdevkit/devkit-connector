import { BaseWebComponent, WebComponentConfig } from '../base/BaseWebComponent';
import { TransactionData } from '@conflux-wallet/types';

export interface TransactionExecutorConfig extends WebComponentConfig {
  delegationId?: number;
  autoSign?: boolean;
  showAdvanced?: boolean;
}

export class TransactionExecutorComponent extends BaseWebComponent {
  private delegationId?: number;
  private transactionData: Partial<TransactionData> = {};

  protected getDefaultConfig(): TransactionExecutorConfig {
    return {
      network: 'confluxEspaceTestnet',
      rpcUrl: '',
      theme: 'light',
      locale: 'en',
      debug: false,
      delegationId: undefined,
      autoSign: false,
      showAdvanced: false,
    };
  }

  static get observedAttributes() {
    return [
      ...BaseWebComponent.observedAttributes,
      'delegation-id',
      'auto-sign',
      'show-advanced'
    ];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    super.attributeChangedCallback(name, oldValue, newValue);

    switch (name) {
      case 'delegation-id':
        this.delegationId = parseInt(newValue) || undefined;
        break;
      case 'auto-sign':
        (this.config as TransactionExecutorConfig).autoSign = newValue === 'true';
        break;
      case 'show-advanced':
        (this.config as TransactionExecutorConfig).showAdvanced = newValue === 'true';
        break;
    }
  }

  protected getTemplate(): string {
    return `
      <div class="transaction-executor">
        <div class="header">
          <h2>Transaction Executor</h2>
          <div class="controls">
            <button id="check-execution-btn" class="btn btn-secondary">
              Check Execution
            </button>
            <button id="toggle-advanced-btn" class="btn btn-secondary">
              ${this.config.showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
        </div>
        
        <div class="content">
          <div class="transaction-form">
            ${this.renderTransactionForm()}
          </div>
          
          <div id="execution-status" class="execution-status" style="display: none;">
            ${this.renderExecutionStatus()}
          </div>
        </div>
        
        <div id="error-message" class="error-message" style="display: none;"></div>
      </div>
    `;
  }

  protected getStyles(): string {
    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --primary-color: #3b82f6;
          --secondary-color: #6b7280;
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
          --background-color: #ffffff;
          --text-color: #111827;
          --border-color: #e5e7eb;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        :host([theme="dark"]) {
          --background-color: #1f2937;
          --text-color: #f9fafb;
          --border-color: #374151;
        }

        .transaction-executor {
          background: var(--background-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--background-color);
        }

        .header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .controls {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: var(--secondary-color);
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-success {
          background: var(--success-color);
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-danger {
          background: var(--error-color);
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .content {
          padding: 1rem;
        }

        .transaction-form {
          display: grid;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }

        .form-input {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--background-color);
          color: var(--text-color);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .advanced-section {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background-color);
        }

        .advanced-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .execution-status {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 6px;
          background: var(--background-color);
        }

        .status-success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .status-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .status-warning {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .delegation-info {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .delegation-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .delegation-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-weight: 500;
          color: var(--secondary-color);
          margin-bottom: 0.25rem;
        }

        .detail-value {
          color: var(--text-color);
        }
      </style>
    `;
  }

  protected attachEventListeners() {
    const checkBtn = this.shadowRoot.getElementById('check-execution-btn');
    const toggleBtn = this.shadowRoot.getElementById('toggle-advanced-btn');
    const form = this.shadowRoot.querySelector('form');

    checkBtn?.addEventListener('click', () => this.checkExecution());
    toggleBtn?.addEventListener('click', () => this.toggleAdvanced());
    form?.addEventListener('submit', (e) => this.handleTransactionSubmit(e));

    // Real-time validation
    const inputs = this.shadowRoot.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.validateForm());
    });
  }

  private renderTransactionForm(): string {
    return `
      <form>
        <div class="form-group">
          <label class="form-label" for="delegation-id">Delegation ID</label>
          <input 
            type="number" 
            id="delegation-id" 
            class="form-input" 
            value="${this.delegationId || ''}"
            placeholder="Enter delegation ID"
            required
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="to-address">To Address</label>
            <input 
              type="text" 
              id="to-address" 
              class="form-input" 
              placeholder="0x..."
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="value">Value (CFX)</label>
            <input 
              type="number" 
              id="value" 
              class="form-input" 
              placeholder="0.1"
              step="0.001"
              min="0"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="data">Data (Hex)</label>
          <textarea 
            id="data" 
            class="form-input form-textarea" 
            placeholder="0x"
          ></textarea>
        </div>
        
        ${this.config.showAdvanced ? this.renderAdvancedSection() : ''}
        
        <div class="action-buttons">
          <button type="submit" class="btn btn-primary">
            Execute Transaction
          </button>
          <button type="button" class="btn btn-secondary" onclick="this.clearForm()">
            Clear
          </button>
        </div>
      </form>
    `;
  }

  private renderAdvancedSection(): string {
    return `
      <div class="advanced-section">
        <h3>Advanced Options</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="nonce">Nonce</label>
            <input 
              type="number" 
              id="nonce" 
              class="form-input" 
              placeholder="Auto"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="deadline">Deadline (Unix timestamp)</label>
            <input 
              type="number" 
              id="deadline" 
              class="form-input" 
              placeholder="${Math.floor(Date.now() / 1000) + 3600}"
            />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="signature">Signature (Hex)</label>
          <textarea 
            id="signature" 
            class="form-input form-textarea" 
            placeholder="0x..."
          ></textarea>
        </div>
      </div>
    `;
  }

  private renderExecutionStatus(): string {
    return `
      <div class="execution-status">
        <h3>Execution Status</h3>
        <div id="status-content">
          <!-- Status content will be populated dynamically -->
        </div>
      </div>
    `;
  }

  private async checkExecution() {
    const delegationId = this.getFormValue('delegation-id');
    const value = this.getFormValue('value');

    if (!delegationId || !value) {
      this.showError('Please fill in delegation ID and value');
      return;
    }

    const result = await this.executeContractOperation(
      () => this.contractService!.canExecuteTransaction(parseInt(delegationId), value),
      'check-execution'
    );

    if (result) {
      this.showExecutionStatus(result);
    }
  }

  private async handleTransactionSubmit(event: Event) {
    event.preventDefault();
    
    const formData = this.getFormData();
    
    if (!this.validateFormData(formData)) {
      return;
    }

    const result = await this.executeContractOperation(
      () => this.contractService!.executeTransaction(
        formData.delegationId,
        {
          to: formData.toAddress,
          value: formData.value,
          data: formData.data || '0x',
          nonce: formData.nonce || 0,
          deadline: formData.deadline || Math.floor(Date.now() / 1000) + 3600,
        },
        formData.signature || ''
      ),
      'execute-transaction'
    );

    if (result) {
      this.showSuccess('Transaction executed successfully');
      this.clearForm();
    }
  }

  private getFormData() {
    return {
      delegationId: parseInt(this.getFormValue('delegation-id')),
      toAddress: this.getFormValue('to-address'),
      value: this.getFormValue('value'),
      data: this.getFormValue('data') || '0x',
      nonce: parseInt(this.getFormValue('nonce')) || 0,
      deadline: parseInt(this.getFormValue('deadline')) || Math.floor(Date.now() / 1000) + 3600,
      signature: this.getFormValue('signature') || '',
    };
  }

  private getFormValue(id: string): string {
    const element = this.shadowRoot.getElementById(id) as HTMLInputElement;
    return element?.value || '';
  }

  private validateFormData(data: any): boolean {
    if (!data.delegationId || data.delegationId <= 0) {
      this.showError('Invalid delegation ID');
      return false;
    }

    if (!data.toAddress || !data.toAddress.startsWith('0x')) {
      this.showError('Invalid to address');
      return false;
    }

    if (!data.value || parseFloat(data.value) <= 0) {
      this.showError('Invalid value');
      return false;
    }

    return true;
  }

  private validateForm() {
    // Real-time form validation
    const inputs = this.shadowRoot.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value) {
        isValid = false;
      }
    });

    const submitBtn = this.shadowRoot.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }
  }

  private showExecutionStatus(status: any) {
    const statusElement = this.shadowRoot.getElementById('execution-status');
    const contentElement = this.shadowRoot.getElementById('status-content');
    
    if (statusElement && contentElement) {
      statusElement.style.display = 'block';
      
      const statusClass = status.canExecute ? 'status-success' : 'status-error';
      contentElement.innerHTML = `
        <div class="${statusClass}">
          <strong>Can Execute:</strong> ${status.canExecute ? 'Yes' : 'No'}
          ${!status.canExecute ? `<br><strong>Reason:</strong> ${status.reason}` : ''}
        </div>
      `;
    }
  }

  private showSuccess(message: string) {
    this.showMessage(message, 'success');
  }

  private showError(message: string) {
    this.showMessage(message, 'error');
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning') {
    const errorElement = this.shadowRoot.getElementById('error-message');
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.className = `error-message ${type === 'success' ? 'status-success' : type === 'warning' ? 'status-warning' : 'status-error'}`;
      errorElement.textContent = message;
      
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }

  private toggleAdvanced() {
    this.config.showAdvanced = !this.config.showAdvanced;
    this.render();
  }

  private clearForm() {
    const form = this.shadowRoot.querySelector('form') as HTMLFormElement;
    form?.reset();
    this.transactionData = {};
  }

  // Public methods
  public setDelegationId(id: number) {
    this.delegationId = id;
    const input = this.shadowRoot.getElementById('delegation-id') as HTMLInputElement;
    if (input) {
      input.value = id.toString();
    }
  }

  public getTransactionData(): Partial<TransactionData> {
    return { ...this.transactionData };
  }
}

// Register the custom element
customElements.define('transaction-executor', TransactionExecutorComponent);

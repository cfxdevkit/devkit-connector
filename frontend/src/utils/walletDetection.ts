export interface WalletInfo {
  name: string;
  installed: boolean;
  provider?: any;
  icon?: string;
  downloadUrl?: string;
}

export function detectAvailableWallets(): WalletInfo[] {
  const wallets: WalletInfo[] = [];

  try {
    // Use the global helper if available
    if ((window as any).getAvailableWallets) {
      const globalWallets = (window as any).getAvailableWallets();
      return globalWallets.map((wallet: any) => ({
        name: wallet.name,
        installed: true,
        provider: wallet.provider,
        icon: wallet.name === 'MetaMask' ? '🦊' : wallet.name === 'Fluent Wallet' ? '🌊' : '💼',
        downloadUrl: wallet.name === 'MetaMask' ? 'https://metamask.io/download/' :
                    wallet.name === 'Fluent Wallet' ? 'https://fluentwallet.com/' :
                    '#'
      }));
    }

    // Fallback to manual detection with error handling
    // MetaMask detection
    try {
      wallets.push({
        name: 'MetaMask',
        installed: !!(window as any).ethereum?.isMetaMask && !(window as any).ethereum?.isFluentWallet,
        provider: (window as any).ethereum?.isMetaMask && !(window as any).ethereum?.isFluentWallet ? (window as any).ethereum : undefined,
        icon: '🦊',
        downloadUrl: 'https://metamask.io/download/'
      });
    } catch (e) {
      console.warn('Error detecting MetaMask:', e);
      wallets.push({
        name: 'MetaMask',
        installed: false,
        icon: '🦊',
        downloadUrl: 'https://metamask.io/download/'
      });
    }

    // Fluent Wallet detection
    try {
      wallets.push({
        name: 'Fluent Wallet',
        installed: !!((window as any).fluent || (window as any).ethereum?.isFluentWallet),
        provider: (window as any).fluent || ((window as any).ethereum?.isFluentWallet ? (window as any).ethereum : undefined),
        icon: '🌊',
        downloadUrl: 'https://fluentwallet.com/'
      });
    } catch (e) {
      console.warn('Error detecting Fluent Wallet:', e);
      wallets.push({
        name: 'Fluent Wallet',
        installed: false,
        icon: '🌊',
        downloadUrl: 'https://fluentwallet.com/'
      });
    }

    // Other wallet detection (for any remaining conflux providers)
    try {
      if ((window as any).conflux && !(window as any).fluent && !(window as any).ethereum?.isFluentWallet) {
        wallets.push({
          name: 'Conflux Wallet',
          installed: true,
          provider: (window as any).conflux,
          icon: '💼',
          downloadUrl: '#'
        });
      }
    } catch (e) {
      console.warn('Error detecting other Conflux wallet:', e);
    }

    return wallets;
  } catch (error) {
    console.error('Error in detectAvailableWallets:', error);
    // Return default wallet list if detection fails completely
    return [
      {
        name: 'MetaMask',
        installed: false,
        icon: '🦊',
        downloadUrl: 'https://metamask.io/download/'
      },
      {
        name: 'Fluent Wallet',
        installed: false,
        icon: '🌊',
        downloadUrl: 'https://fluentwallet.com/'
      }
    ];
  }
}

export function getPreferredWallet(): WalletInfo | null {
  const wallets = detectAvailableWallets();
  const installed = wallets.filter(w => w.installed);

  if (installed.length === 0) return null;

  // Prefer Fluent Wallet for Conflux, then MetaMask
  const fluent = installed.find(w => w.name === 'Fluent Wallet');
  if (fluent) return fluent;

  const metamask = installed.find(w => w.name === 'MetaMask');
  if (metamask) return metamask;

  return installed[0];
}

export function handleWalletConflicts(): {
  hasConflicts: boolean;
  conflicts: string[];
  recommendations: string[];
} {
  const wallets = detectAvailableWallets();
  const installed = wallets.filter(w => w.installed);

  const hasConflicts = installed.length > 1;
  const conflicts = hasConflicts ? installed.map(w => w.name) : [];

  const recommendations = hasConflicts ? [
    'Multiple wallet extensions detected. This may cause conflicts.',
    'For best experience with Conflux, keep only Fluent Wallet enabled.',
    'Disable other wallet extensions or use them on different browser profiles.',
    'If you encounter errors, try refreshing the page or disabling conflicting extensions.'
  ] : [];

  return {
    hasConflicts,
    conflicts,
    recommendations
  };
}
// Utility functions for the client package
export const formatAddress = (address: string, length = 6): string => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const formatBalance = (balance: string, decimals = 18): string => {
  const num = parseFloat(balance) / Math.pow(10, decimals);
  return num.toFixed(4);
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate hex string
 */
export function isValidHex(hex: string): boolean {
  return /^0x[a-fA-F0-9]*$/.test(hex);
}

/**
 * Validate positive integer
 */
export function isValidPositiveInteger(value: string | number): boolean {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return Number.isInteger(num) && num > 0;
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

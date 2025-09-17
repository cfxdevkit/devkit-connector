/**
 * Format wei to CFX
 */
export function formatWeiToCfx(
  wei: string | bigint,
  decimals: number = 18
): string {
  const weiBigInt = typeof wei === 'string' ? BigInt(wei) : wei;
  const divisor = BigInt(10 ** decimals);

  const wholePart = weiBigInt / divisor;
  const fractionalPart = weiBigInt % divisor;

  if (fractionalPart === 0n) {
    return wholePart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  return trimmedFractional
    ? `${wholePart}.${trimmedFractional}`
    : wholePart.toString();
}

/**
 * Format CFX to wei
 */
export function formatCfxToWei(
  cfx: string | number,
  decimals: number = 18
): string {
  const cfxStr = cfx.toString();
  const [wholePart, fractionalPart = ''] = cfxStr.split('.');

  const paddedFractional = fractionalPart
    .padEnd(decimals, '0')
    .slice(0, decimals);
  return wholePart + paddedFractional;
}

/**
 * Format number with commas
 */
export function formatNumberWithCommas(num: string | number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

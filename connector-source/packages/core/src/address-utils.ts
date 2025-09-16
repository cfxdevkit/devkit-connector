import { format } from 'js-conflux-sdk';

export class AddressUtils {
  /**
   * Convert eSpace address to Core format
   */
  static eSpaceToCore(eSpaceAddress: string, networkId: number = 1029): string {
    try {
      return format.address(eSpaceAddress, networkId);
    } catch (error) {
      throw new Error(`Failed to convert eSpace address to Core: ${error.message}`);
    }
  }

  /**
   * Convert Core address to eSpace format
   */
  static coreToESpace(coreAddress: string): string {
    try {
      // Remove cfx: prefix and convert to 0x format
      if (coreAddress.startsWith('cfx:')) {
        return `0x${coreAddress.slice(4)}`;
      }
      return coreAddress;
    } catch (error) {
      throw new Error(`Failed to convert Core address to eSpace: ${error.message}`);
    }
  }

  /**
   * Validate eSpace address format
   */
  static isValidESpace(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Validate Core address format
   */
  static isValidCore(address: string): boolean {
    return /^cfx:[a-z0-9]{34}$/.test(address);
  }

  /**
   * Normalize address to lowercase
   */
  static normalize(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Get address type
   */
  static getAddressType(address: string): 'eSpace' | 'core' | 'unknown' {
    if (this.isValidESpace(address)) return 'eSpace';
    if (this.isValidCore(address)) return 'core';
    return 'unknown';
  }

  /**
   * Convert address to both formats
   */
  static toBothFormats(address: string, networkId: number = 1029): {
    eSpace: string;
    core: string;
  } {
    const type = this.getAddressType(address);
    
    if (type === 'eSpace') {
      return {
        eSpace: address,
        core: this.eSpaceToCore(address, networkId)
      };
    } else if (type === 'core') {
      return {
        eSpace: this.coreToESpace(address),
        core: address
      };
    } else {
      throw new Error('Invalid address format');
    }
  }
}

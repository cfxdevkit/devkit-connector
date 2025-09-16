import * as crypto from 'crypto';

export class EncryptionUtils {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  /**
   * Generate a random encryption key
   */
  static generateKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  /**
   * Generate a random IV
   */
  static generateIV(): string {
    return crypto.randomBytes(this.IV_LENGTH).toString('hex');
  }

  /**
   * Encrypt data with AES-256-CBC
   */
  static encrypt(data: string, key: string, iv?: string): { encrypted: string; iv: string } {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = iv ? Buffer.from(iv, 'hex') : crypto.randomBytes(this.IV_LENGTH);
    
    const cipher = crypto.createCipher(this.ALGORITHM, keyBuffer);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: ivBuffer.toString('hex')
    };
  }

  /**
   * Decrypt data with AES-256-CBC
   */
  static decrypt(encryptedData: string, key: string, iv: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    
    const decipher = crypto.createDecipher(this.ALGORITHM, keyBuffer);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash data with SHA-256
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a random session ID
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a random operation ID
   */
  static generateOperationId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate a secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

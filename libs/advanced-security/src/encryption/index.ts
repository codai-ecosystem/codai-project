/**
 * CODAI Encryption & Cryptography System
 * Enterprise-grade encryption utilities with AES-GCM, RSA, and key management
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface EncryptionOptions {
  algorithm?: string;
  keySize?: number;
  ivSize?: number;
  tagSize?: number;
  iterations?: number;
  saltSize?: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  salt?: string;
  algorithm: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  format: 'pem' | 'der';
  keySize: number;
}

export interface EncryptionKey {
  id: string;
  key: Buffer;
  algorithm: string;
  createdAt: Date;
  expiresAt?: Date;
  purposes: string[];
  metadata?: Record<string, any>;
}

export class EncryptionManager {
  private readonly defaultAlgorithm = 'aes-256-gcm';
  private readonly defaultKeySize = 32; // 256 bits
  private readonly defaultIvSize = 16; // 128 bits
  private readonly defaultTagSize = 16; // 128 bits
  private readonly defaultIterations = 100000;
  private readonly defaultSaltSize = 32;

  private masterKey: Buffer;
  private keyCache: Map<string, EncryptionKey> = new Map();

  constructor(masterKey?: string) {
    this.masterKey = masterKey
      ? Buffer.from(masterKey, 'hex')
      : crypto.randomBytes(32);
  }

  /**
   * Encrypt data using AES-GCM
   */
  encrypt(
    data: string | Buffer,
    key?: Buffer,
    options: EncryptionOptions = {}
  ): EncryptedData {
    const algorithm = options.algorithm || this.defaultAlgorithm;
    const encryptionKey = key || this.masterKey;
    const iv = crypto.randomBytes(options.ivSize || this.defaultIvSize);

    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv) as crypto.CipherGCM;
    cipher.setAAD(Buffer.from('CODAI-AUTH'));

    let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      data: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm
    };
  }

  /**
   * Decrypt data using AES-GCM
   */
  decrypt(
    encryptedData: EncryptedData,
    key?: Buffer
  ): string {
    const decryptionKey = key || this.masterKey;
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');

    const decipher = crypto.createDecipheriv(encryptedData.algorithm, decryptionKey, iv) as crypto.DecipherGCM;
    decipher.setAAD(Buffer.from('CODAI-AUTH'));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypt data with password-based encryption (PBKDF2)
   */
  encryptWithPassword(
    data: string,
    password: string,
    options: EncryptionOptions = {}
  ): EncryptedData {
    const salt = crypto.randomBytes(options.saltSize || this.defaultSaltSize);
    const iterations = options.iterations || this.defaultIterations;
    const keySize = options.keySize || this.defaultKeySize;

    const key = crypto.pbkdf2Sync(password, salt, iterations, keySize, 'sha256');
    const iv = crypto.randomBytes(options.ivSize || this.defaultIvSize);

    const cipher = crypto.createCipheriv(this.defaultAlgorithm, key, iv) as crypto.CipherGCM;

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      data: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex'),
      algorithm: this.defaultAlgorithm
    };
  }

  /**
   * Decrypt data with password-based encryption
   */
  decryptWithPassword(
    encryptedData: EncryptedData,
    password: string,
    options: EncryptionOptions = {}
  ): string {
    if (!encryptedData.salt) {
      throw new Error('Salt is required for password-based decryption');
    }

    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iterations = options.iterations || this.defaultIterations;
    const keySize = options.keySize || this.defaultKeySize;

    const key = crypto.pbkdf2Sync(password, salt, iterations, keySize, 'sha256');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');

    const decipher = crypto.createDecipheriv(encryptedData.algorithm, key, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate RSA key pair
   */
  generateRSAKeyPair(keySize: number = 2048): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return {
      publicKey,
      privateKey,
      format: 'pem',
      keySize
    };
  }

  /**
   * Encrypt data using RSA public key
   */
  encryptWithRSA(data: string, publicKey: string): string {
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(data));

    return encrypted.toString('base64');
  }

  /**
   * Decrypt data using RSA private key
   */
  decryptWithRSA(encryptedData: string, privateKey: string): string {
    const decrypted = crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(encryptedData, 'base64'));

    return decrypted.toString('utf8');
  }

  /**
   * Create digital signature
   */
  sign(data: string, privateKey: string): string {
    try {
      return crypto.sign('sha256', Buffer.from(data), privateKey).toString('base64');
    } catch (error) {
      throw new Error(`Signature creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify digital signature
   */
  verify(data: string, signature: string, publicKey: string): boolean {
    try {
      const verifier = crypto.createVerify('sha256');
      verifier.update(data);
      return verifier.verify(publicKey, signature, 'base64');
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate cryptographically secure random string
   */
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate UUID v4
   */
  generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash data using SHA-512
   */
  hashSecure(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Generate HMAC
   */
  generateHMAC(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data: string, key: string, expectedHmac: string): boolean {
    const actualHmac = this.generateHMAC(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(actualHmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string, saltRounds: number = 12): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against bcrypt hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate encryption key with metadata
   */
  generateKey(purposes: string[] = ['encryption'], expiresIn?: number): EncryptionKey {
    const key: EncryptionKey = {
      id: this.generateUUID(),
      key: crypto.randomBytes(32),
      algorithm: this.defaultAlgorithm,
      createdAt: new Date(),
      purposes,
      metadata: {}
    };

    if (expiresIn) {
      key.expiresAt = new Date(Date.now() + expiresIn);
    }

    this.keyCache.set(key.id, key);
    return key;
  }

  /**
   * Get encryption key by ID
   */
  getKey(keyId: string): EncryptionKey | null {
    const key = this.keyCache.get(keyId);

    if (!key) {
      return null;
    }

    // Check if key is expired
    if (key.expiresAt && key.expiresAt < new Date()) {
      this.keyCache.delete(keyId);
      return null;
    }

    return key;
  }

  /**
   * Rotate encryption key
   */
  rotateKey(keyId: string, purposes?: string[]): EncryptionKey | null {
    const oldKey = this.getKey(keyId);
    if (!oldKey) {
      return null;
    }

    const newKey = this.generateKey(purposes || oldKey.purposes);

    // Mark old key as deprecated
    oldKey.metadata = { ...oldKey.metadata, deprecated: true, replacedBy: newKey.id };

    return newKey;
  }

  /**
   * Secure key derivation using PBKDF2
   */
  deriveKey(
    password: string,
    salt: Buffer,
    iterations: number = 100000,
    keyLength: number = 32
  ): Buffer {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  }

  /**
   * Secure key derivation using Argon2 (when available)
   */
  async deriveKeyArgon2(
    password: string,
    salt: Buffer,
    options: {
      timeCost?: number;
      memoryCost?: number;
      parallelism?: number;
      keyLength?: number;
    } = {}
  ): Promise<Buffer> {
    // Fallback to PBKDF2 if Argon2 is not available
    // In production, you would use the argon2 library
    const iterations = options.timeCost || 3;
    const keyLength = options.keyLength || 32;

    return this.deriveKey(password, salt, iterations * 33333, keyLength);
  }

  /**
   * Encrypt file contents
   */
  encryptFile(filePath: string, outputPath: string, key?: Buffer): void {
    const fs = require('fs');
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputPath);

    const encryptionKey = key || this.masterKey;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv) as crypto.CipherGCM;

    // Write IV to the beginning of the file
    output.write(iv);

    input.pipe(cipher).pipe(output);

    cipher.on('end', () => {
      // Write authentication tag at the end
      output.write(cipher.getAuthTag());
    });
  }

  /**
   * Decrypt file contents
   */
  decryptFile(filePath: string, outputPath: string, key?: Buffer): void {
    const fs = require('fs');
    const decryptionKey = key || this.masterKey;

    const data = fs.readFileSync(filePath);
    const iv = data.slice(0, 16);
    const tag = data.slice(-16);
    const encrypted = data.slice(16, -16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', decryptionKey, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    fs.writeFileSync(outputPath, decrypted);
  }

  /**
   * Generate cryptographic proof of work
   */
  generateProofOfWork(data: string, difficulty: number = 4): { nonce: number; hash: string } {
    let nonce = 0;
    let hash = '';
    const target = '0'.repeat(difficulty);

    do {
      nonce++;
      hash = this.hash(data + nonce);
    } while (!hash.startsWith(target));

    return { nonce, hash };
  }

  /**
   * Verify proof of work
   */
  verifyProofOfWork(data: string, nonce: number, difficulty: number = 4): boolean {
    const hash = this.hash(data + nonce);
    return hash.startsWith('0'.repeat(difficulty));
  }

  /**
   * Secure memory cleanup
   */
  clearSensitiveData(): void {
    // Clear key cache
    this.keyCache.clear();

    // Overwrite master key (in production, use secure memory management)
    if (this.masterKey) {
      this.masterKey.fill(0);
    }
  }

  /**
   * Export encryption key for backup
   */
  exportKey(keyId: string): string | null {
    const key = this.getKey(keyId);
    if (!key) {
      return null;
    }

    const exportData = {
      id: key.id,
      algorithm: key.algorithm,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      purposes: key.purposes,
      metadata: key.metadata
    };

    return Buffer.from(JSON.stringify(exportData)).toString('base64');
  }

  /**
   * Import encryption key from backup
   */
  importKey(exportedKey: string, keyData: Buffer): boolean {
    try {
      const keyInfo = JSON.parse(Buffer.from(exportedKey, 'base64').toString());

      const key: EncryptionKey = {
        id: keyInfo.id,
        key: keyData,
        algorithm: keyInfo.algorithm,
        createdAt: new Date(keyInfo.createdAt),
        expiresAt: keyInfo.expiresAt ? new Date(keyInfo.expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year if not specified
        purposes: keyInfo.purposes,
        metadata: keyInfo.metadata
      };

      this.keyCache.set(key.id, key);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Utility functions for common encryption tasks
export const CryptoUtils = {
  /**
   * Generate secure password
   */
  generateSecurePassword(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += chars.charAt(crypto.randomInt(0, chars.length));
    }

    return password;
  },

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    passed: boolean;
  } {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    return {
      score,
      feedback,
      passed: score >= 4
    };
  },

  /**
   * Generate salt for password hashing
   */
  generateSalt(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Constant-time string comparison
   */
  constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return crypto.timingSafeEqual(bufferA, bufferB);
  }
};

export default EncryptionManager;

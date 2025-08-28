import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { MfaSetup, User } from './auth.types';

export class MfaManager {
  private issuer: string;

  constructor(issuer: string = 'CodAI') {
    this.issuer = issuer;
  }

  /**
   * Generate MFA secret and QR code for user
   */
  async generateMfaSetup(user: User): Promise<MfaSetup> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${this.issuer} (${user.email})`,
      issuer: this.issuer,
      length: 32,
    });

    // Generate QR code
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: this.issuer,
      encoding: 'base32',
    });

    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Verify TOTP code
   */
  verifyTotpCode(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after current time
    });
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(userBackupCodes: string[], inputCode: string): boolean {
    const normalizedInput = inputCode.toUpperCase().replace(/\s/g, '');
    return userBackupCodes.includes(normalizedInput);
  }

  /**
   * Remove used backup code
   */
  removeUsedBackupCode(userBackupCodes: string[], usedCode: string): string[] {
    const normalizedUsed = usedCode.toUpperCase().replace(/\s/g, '');
    return userBackupCodes.filter(code => code !== normalizedUsed);
  }

  /**
   * Check if user has backup codes left
   */
  hasBackupCodes(userBackupCodes: string[]): boolean {
    return userBackupCodes && userBackupCodes.length > 0;
  }

  /**
   * Generate new backup codes (regenerate)
   */
  regenerateBackupCodes(): string[] {
    return this.generateBackupCodes();
  }

  /**
   * Validate MFA setup by verifying a TOTP code
   */
  validateMfaSetup(secret: string, verificationCode: string): boolean {
    return this.verifyTotpCode(secret, verificationCode);
  }

  /**
   * Generate recovery email code for MFA bypass
   */
  generateRecoveryEmailCode(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Check if MFA is required for user
   */
  isMfaRequired(user: User): boolean {
    return user.isMfaEnabled && !!user.mfaSecret;
  }

  /**
   * Disable MFA for user (returns new backup codes if needed)
   */
  disableMfa(): { success: boolean; message: string } {
    return {
      success: true,
      message: 'MFA has been disabled successfully',
    };
  }

  /**
   * Get MFA status for user
   */
  getMfaStatus(user: User): {
    enabled: boolean;
    hasSecret: boolean;
    hasBackupCodes: boolean;
    backupCodeCount: number;
  } {
    return {
      enabled: user.isMfaEnabled,
      hasSecret: !!user.mfaSecret,
      hasBackupCodes: false, // This would come from database
      backupCodeCount: 0, // This would come from database
    };
  }
}
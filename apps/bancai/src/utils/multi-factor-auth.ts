/**
 * @fileoverview Multi-Factor Authentication (MFA)
 * @description TOTP, SMS, and backup code implementations
 */

import crypto from 'crypto';

export interface MFAMethod {
    id: string;
    type: 'totp' | 'sms' | 'email' | 'backup_codes';
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    lastUsed?: Date;
}

export interface TOTPMethod extends MFAMethod {
    type: 'totp';
    secret: string;
    qrCodeUrl?: string;
}

export interface SMSMethod extends MFAMethod {
    type: 'sms';
    phoneNumber: string;
    maskedPhoneNumber: string;
}

export interface BackupCodesMethod extends MFAMethod {
    type: 'backup_codes';
    codes: Array<{ code: string; used: boolean; usedAt?: Date }>;
}

export class MultiFactorAuth {
    private readonly secretLength = 32;
    private readonly codeLength = 6;
    private readonly timeStep = 30; // seconds
    private readonly window = 1; // allow ±1 time step

    /**
     * Generate TOTP secret and setup URL
     */
    generateTOTPSecret(userEmail: string): { secret: string; setupUrl: string; qrCodeUrl: string } {
        const secret = crypto.randomBytes(this.secretLength).toString('base64').replace(/[^A-Z0-9]/gi, '').substr(0, this.secretLength);
        const issuer = 'bancai';
        const accountName = `${issuer}:${userEmail}`;
        
        const setupUrl = `otpauth://totp/${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupUrl)}`;

        return { secret, setupUrl, qrCodeUrl };
    }

    /**
     * Verify TOTP code
     */
    verifyTOTPCode(secret: string, code: string): boolean {
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Check current time step and adjacent ones (to handle clock drift)
        for (let i = -this.window; i <= this.window; i++) {
            const timeStep = Math.floor(currentTime / this.timeStep) + i;
            const expectedCode = this.generateTOTPCode(secret, timeStep);
            
            if (expectedCode === code) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate TOTP code for a given time step
     */
    private generateTOTPCode(secret: string, timeStep: number): string {
        const key = Buffer.from(secret, 'base64');
        const time = Buffer.alloc(8);
        time.writeBigUInt64BE(BigInt(timeStep), 0);

        const hmac = crypto.createHmac('sha1', key);
        hmac.update(time);
        const hash = hmac.digest();

        const offset = hash[19] & 0x0f;
        const code = (
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff)
        ) % Math.pow(10, this.codeLength);

        return code.toString().padStart(this.codeLength, '0');
    }

    /**
     * Generate SMS verification code
     */
    generateSMSCode(): { code: string; expiresAt: Date } {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        return { code, expiresAt };
    }

    /**
     * Send SMS verification code (placeholder - integrate with SMS provider)
     */
    async sendSMSCode(phoneNumber: string, code: string): Promise<boolean> {
        try {
            // Integrate with SMS provider (Twilio, AWS SNS, etc.)
            console.log(`Sending SMS code ${code} to ${phoneNumber}`);
            
            // Placeholder implementation
            return true;
        } catch (error) {
            console.error('SMS sending failed:', error);
            return false;
        }
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes(count: number = 10): Array<{ code: string; used: boolean }> {
        const codes = [];
        
        for (let i = 0; i < count; i++) {
            const code = crypto.randomBytes(4).toString('hex').toLowerCase();
            codes.push({ code, used: false });
        }
        
        return codes;
    }

    /**
     * Verify backup code
     */
    verifyBackupCode(codes: Array<{ code: string; used: boolean; usedAt?: Date }>, inputCode: string): boolean {
        const code = codes.find(c => c.code === inputCode.toLowerCase() && !c.used);
        
        if (code) {
            code.used = true;
            code.usedAt = new Date();
            return true;
        }
        
        return false;
    }

    /**
     * Mask phone number for display
     */
    maskPhoneNumber(phoneNumber: string): string {
        if (phoneNumber.length < 4) return phoneNumber;
        
        const lastFour = phoneNumber.slice(-4);
        const masked = phoneNumber.slice(0, -4).replace(/\d/g, '*');
        
        return masked + lastFour;
    }

    /**
     * Check if user has MFA enabled
     */
    hasMFAEnabled(methods: MFAMethod[]): boolean {
        return methods.some(method => method.isActive && method.isVerified);
    }

    /**
     * Get available MFA methods for user
     */
    getActiveMethods(methods: MFAMethod[]): MFAMethod[] {
        return methods.filter(method => method.isActive && method.isVerified);
    }

    /**
     * Validate MFA challenge
     */
    async validateMFAChallenge(
        methods: MFAMethod[],
        methodId: string,
        code: string,
        additionalData?: any
    ): Promise<{ valid: boolean; method?: MFAMethod; error?: string }> {
        const method = methods.find(m => m.id === methodId && m.isActive && m.isVerified);
        
        if (!method) {
            return { valid: false, error: 'Invalid MFA method' };
        }

        let isValid = false;

        switch (method.type) {
            case 'totp':
                const totpMethod = method as TOTPMethod;
                isValid = this.verifyTOTPCode(totpMethod.secret, code);
                break;

            case 'sms':
                // Verify SMS code (requires stored code and expiration check)
                isValid = additionalData?.storedCode === code && 
                         additionalData?.expiresAt > new Date();
                break;

            case 'backup_codes':
                const backupMethod = method as BackupCodesMethod;
                isValid = this.verifyBackupCode(backupMethod.codes, code);
                break;

            default:
                return { valid: false, error: 'Unsupported MFA method' };
        }

        if (isValid) {
            method.lastUsed = new Date();
            return { valid: true, method };
        }

        return { valid: false, error: 'Invalid verification code' };
    }

    /**
     * Generate MFA recovery token
     */
    generateRecoveryToken(userId: string): { token: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return { token, expiresAt };
    }
}

// MFA middleware for protecting routes
export function requireMFA(options: { allowBackupCodes?: boolean } = {}) {
    return async (req: any, res: any, next: any) => {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Check if user has MFA enabled
            const userMFAMethods = await getUserMFAMethods(user.sub);
            const mfa = new MultiFactorAuth();
            
            if (!mfa.hasMFAEnabled(userMFAMethods)) {
                // MFA not enabled, proceed
                return next();
            }

            // Check MFA verification in session or header
            const mfaVerified = req.session?.mfaVerified || req.headers['x-mfa-verified'];
            
            if (!mfaVerified) {
                return res.status(403).json({
                    error: 'MFA verification required',
                    mfaRequired: true,
                    availableMethods: mfa.getActiveMethods(userMFAMethods).map(method => ({
                        id: method.id,
                        type: method.type,
                        maskedInfo: method.type === 'sms' ? (method as SMSMethod).maskedPhoneNumber : undefined
                    }))
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ error: 'MFA verification failed' });
        }
    };
}

// Helper function (implement according to your data layer)
async function getUserMFAMethods(userId: string): Promise<MFAMethod[]> {
    // This should query your database for user's MFA methods
    return [];
}

// MFA setup flow helper
export class MFASetupFlow {
    private pendingSetups = new Map<string, any>();

    /**
     * Start MFA setup process
     */
    startSetup(userId: string, methodType: 'totp' | 'sms'): { setupId: string; setupData: any } {
        const setupId = crypto.randomUUID();
        const mfa = new MultiFactorAuth();
        
        let setupData;
        
        switch (methodType) {
            case 'totp':
                const userEmail = 'user@example.com'; // Get from user data
                setupData = mfa.generateTOTPSecret(userEmail);
                break;
                
            case 'sms':
                setupData = { phoneNumber: '', verificationCode: '' };
                break;
        }

        this.pendingSetups.set(setupId, {
            userId,
            methodType,
            setupData,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        return { setupId, setupData };
    }

    /**
     * Complete MFA setup
     */
    async completeSetup(setupId: string, verificationCode: string): Promise<{ success: boolean; method?: MFAMethod }> {
        const setup = this.pendingSetups.get(setupId);
        
        if (!setup || setup.expiresAt < new Date()) {
            return { success: false };
        }

        const mfa = new MultiFactorAuth();
        let isValid = false;

        switch (setup.methodType) {
            case 'totp':
                isValid = mfa.verifyTOTPCode(setup.setupData.secret, verificationCode);
                break;
                
            case 'sms':
                isValid = setup.setupData.verificationCode === verificationCode;
                break;
        }

        if (isValid) {
            const method: MFAMethod = {
                id: crypto.randomUUID(),
                type: setup.methodType,
                isActive: true,
                isVerified: true,
                createdAt: new Date()
            };

            // Save method to database
            this.pendingSetups.delete(setupId);
            
            return { success: true, method };
        }

        return { success: false };
    }
}
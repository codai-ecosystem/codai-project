import { firestore } from '../lib/firebase'
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'firebase/firestore'

interface MFASecret {
    userId: string
    secret: string
    backupCodes: string[]
    isEnabled: boolean
    createdAt: Date
    lastUsed?: Date
}

interface SMSVerification {
    userId: string
    phoneNumber: string
    code: string
    expiresAt: Date
    attempts: number
    isVerified: boolean
}

interface BiometricAuth {
    userId: string
    deviceId: string
    publicKey: string
    credentialId: string
    isEnabled: boolean
    lastUsed?: Date
    deviceInfo: {
        userAgent: string
        platform: string
        name: string
    }
}

export class MFAService {
    private static instance: MFAService

    public static getInstance(): MFAService {
        if (!MFAService.instance) {
            MFAService.instance = new MFAService()
        }
        return MFAService.instance
    }

    // TOTP (Time-based One-Time Password) Setup
    public async setupTOTP(userId: string): Promise<{
        success: boolean
        secret?: string
        qrCode?: string
        backupCodes?: string[]
        error?: string
    }> {
        try {
            // Generate secret (32 char base32)
            const secret = this.generateTOTPSecret()

            // Generate backup codes
            const backupCodes = this.generateBackupCodes()

            // Generate QR code URL
            const qrCode = this.generateQRCodeURL(secret, userId)

            // Save to Firestore
            const mfaData: Partial<MFASecret> = {
                userId,
                secret,
                backupCodes,
                isEnabled: false, // Will be enabled after verification
                createdAt: serverTimestamp() as any
            }

            await setDoc(doc(firestore, 'mfa_secrets', userId), mfaData)

            return {
                success: true,
                secret,
                qrCode,
                backupCodes
            }

        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la configurarea TOTP: ${error.message}`
            }
        }
    }

    // Verify TOTP code and enable MFA
    public async verifyAndEnableTOTP(userId: string, code: string): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            const mfaDoc = await getDoc(doc(firestore, 'mfa_secrets', userId))

            if (!mfaDoc.exists()) {
                return { success: false, error: 'TOTP nu a fost configurat' }
            }

            const mfaData = mfaDoc.data() as MFASecret

            // Verify TOTP code
            const isValid = this.verifyTOTPCode(mfaData.secret, code)

            if (!isValid) {
                return { success: false, error: 'Cod TOTP invalid' }
            }

            // Enable MFA
            await updateDoc(doc(firestore, 'mfa_secrets', userId), {
                isEnabled: true,
                lastUsed: serverTimestamp()
            })

            return { success: true }

        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la verificarea TOTP: ${error.message}`
            }
        }
    }

    // Verify TOTP code during login
    public async verifyTOTP(userId: string, code: string): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            const mfaDoc = await getDoc(doc(firestore, 'mfa_secrets', userId))

            if (!mfaDoc.exists()) {
                return { success: false, error: 'MFA nu este configurat' }
            }

            const mfaData = mfaDoc.data() as MFASecret

            if (!mfaData.isEnabled) {
                return { success: false, error: 'MFA nu este activat' }
            }

            // Check if it's a backup code
            if (mfaData.backupCodes.includes(code)) {
                // Remove used backup code
                const updatedCodes = mfaData.backupCodes.filter(c => c !== code)
                await updateDoc(doc(firestore, 'mfa_secrets', userId), {
                    backupCodes: updatedCodes,
                    lastUsed: serverTimestamp()
                })
                return { success: true }
            }

            // Verify TOTP code
            const isValid = this.verifyTOTPCode(mfaData.secret, code)

            if (!isValid) {
                return { success: false, error: 'Cod invalid' }
            }

            // Update last used
            await updateDoc(doc(firestore, 'mfa_secrets', userId), {
                lastUsed: serverTimestamp()
            })

            return { success: true }

        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la verificarea codului: ${error.message}`
            }
        }
    }

    // SMS Verification Setup
    public async setupSMSVerification(userId: string, phoneNumber: string): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            // Generate 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString()

            // Set expiration (5 minutes)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

            const smsData: Partial<SMSVerification> = {
                userId,
                phoneNumber,
                code,
                expiresAt,
                attempts: 0,
                isVerified: false
            }

            await setDoc(doc(firestore, 'sms_verifications', userId), smsData)

            // In production, send SMS here
            // await this.sendSMS(phoneNumber, code)
            console.log(`SMS Code pentru ${phoneNumber}: ${code}`)

            return { success: true }

        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la trimiterea SMS: ${error.message}`
            }
        }
    }

    // Verify SMS code
    public async verifySMS(userId: string, code: string): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            const smsDoc = await getDoc(doc(firestore, 'sms_verifications', userId))

            if (!smsDoc.exists()) {
                return { success: false, error: 'Verificarea SMS nu a fost inițiată' }
            }

            const smsData = smsDoc.data() as SMSVerification

            // Check expiration
            if (new Date() > smsData.expiresAt.toDate()) {
                return { success: false, error: 'Codul a expirat' }
            }

            // Check attempts
            if (smsData.attempts >= 3) {
                return { success: false, error: 'Prea multe încercări greșite' }
            }

            // Verify code
            if (smsData.code !== code) {
                // Increment attempts
                await updateDoc(doc(firestore, 'sms_verifications', userId), {
                    attempts: smsData.attempts + 1
                })
                return { success: false, error: 'Cod SMS invalid' }
            }

            // Mark as verified
            await updateDoc(doc(firestore, 'sms_verifications', userId), {
                isVerified: true
            })

            return { success: true }

        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la verificarea SMS: ${error.message}`
            }
        }
    }

    // Biometric Authentication Setup
    public async setupBiometricAuth(
        userId: string,
        credentialId: string,
        publicKey: string,
        deviceInfo: BiometricAuth['deviceInfo']
    ): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            const deviceId = this.generateDeviceId()

            const biometricData: Partial<BiometricAuth> = {
                userId,
                deviceId,
                publicKey,
                credentialId,
                isEnabled: true,
                deviceInfo
            }

            await setDoc(doc(firestore, 'biometric_auth', `${userId}_${deviceId}`), biometricData)

            return { success: true }

        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la configurarea autentificării biometrice: ${error.message}`
            }
        }
    }

    // Verify Biometric Authentication
    public async verifyBiometric(
        userId: string,
        credentialId: string,
        signature: string
    ): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            // Find biometric record
            const biometricQuery = query(
                collection(firestore, 'biometric_auth'),
                where('userId', '==', userId),
                where('credentialId', '==', credentialId),
                where('isEnabled', '==', true)
            )

            const snapshot = await getDocs(biometricQuery)

            if (snapshot.empty) {
                return { success: false, error: 'Autentificare biometrică nu este configurată' }
            }

            // In production, verify signature with public key
            // const isValid = await this.verifySignature(publicKey, signature, challenge)

            // For now, simulate successful verification
            const isValid = true

            if (!isValid) {
                return { success: false, error: 'Verificarea biometrică a eșuat' }
            }

            // Update last used
            const docRef = snapshot.docs[0].ref
            await updateDoc(docRef, {
                lastUsed: serverTimestamp()
            })

            return { success: true }

        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la verificarea biometrică: ${error.message}`
            }
        }
    }

    // Check if user has MFA enabled
    public async isMFAEnabled(userId: string): Promise<boolean> {
        try {
            const mfaDoc = await getDoc(doc(firestore, 'mfa_secrets', userId))
            return mfaDoc.exists() && mfaDoc.data()?.isEnabled === true
        } catch (error) {
            return false
        }
    }

    // Disable MFA
    public async disableMFA(userId: string): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            await deleteDoc(doc(firestore, 'mfa_secrets', userId))
            return { success: true }
        } catch (error: any) {
            return {
                success: false,
                error: `Eroare la dezactivarea MFA: ${error.message}`
            }
        }
    }

    // Get MFA status and methods
    public async getMFAStatus(userId: string): Promise<{
        totpEnabled: boolean
        smsEnabled: boolean
        biometricEnabled: boolean
        backupCodesCount: number
        lastUsed?: Date
    }> {
        try {
            // Check TOTP
            const mfaDoc = await getDoc(doc(firestore, 'mfa_secrets', userId))
            const totpEnabled = mfaDoc.exists() && mfaDoc.data()?.isEnabled
            const backupCodesCount = mfaDoc.exists() ? mfaDoc.data()?.backupCodes?.length || 0 : 0
            const lastUsed = mfaDoc.exists() ? mfaDoc.data()?.lastUsed?.toDate() : undefined

            // Check SMS
            const smsDoc = await getDoc(doc(firestore, 'sms_verifications', userId))
            const smsEnabled = smsDoc.exists() && smsDoc.data()?.isVerified

            // Check Biometric
            const biometricQuery = query(
                collection(firestore, 'biometric_auth'),
                where('userId', '==', userId),
                where('isEnabled', '==', true)
            )
            const biometricSnapshot = await getDocs(biometricQuery)
            const biometricEnabled = !biometricSnapshot.empty

            return {
                totpEnabled,
                smsEnabled,
                biometricEnabled,
                backupCodesCount,
                lastUsed
            }

        } catch (error) {
            return {
                totpEnabled: false,
                smsEnabled: false,
                biometricEnabled: false,
                backupCodesCount: 0
            }
        }
    }

    // Private helper methods
    private generateTOTPSecret(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
        let secret = ''
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return secret
    }

    private generateBackupCodes(): string[] {
        const codes = []
        for (let i = 0; i < 8; i++) {
            const code = Math.floor(10000000 + Math.random() * 90000000).toString()
            codes.push(code)
        }
        return codes
    }

    private generateQRCodeURL(secret: string, userId: string): string {
        const issuer = 'LOGAI'
        const accountName = userId
        const otpauth = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`
    }

    private verifyTOTPCode(secret: string, code: string): boolean {
        // In production, use a proper TOTP library like 'otplib'
        // For now, simulate verification
        return code.length === 6 && /^\d+$/.test(code)
    }

    private generateDeviceId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
}

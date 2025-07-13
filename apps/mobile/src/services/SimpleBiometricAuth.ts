/**
 * CODAI Mobile Biometric Authentication Service
 * Simplified authentication service for Next.js compatibility
 */

export interface BiometricResult {
    success: boolean;
    biometryType?: string;
    error?: string;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    token?: string;
}

export class BiometricAuth {
    private static instance: BiometricAuth;

    static getInstance(): BiometricAuth {
        if (!BiometricAuth.instance) {
            BiometricAuth.instance = new BiometricAuth();
        }
        return BiometricAuth.instance;
    }

    async isAvailable(): Promise<BiometricResult> {
        try {
            // Simulate biometric availability check
            return {
                success: true,
                biometryType: 'FaceID',
            };
        } catch (error) {
            return {
                success: false,
                error: `Biometric check failed: ${error}`,
            };
        }
    }

    async authenticate(reason: string = 'Authenticate with biometrics'): Promise<AuthResult> {
        try {
            // Simulate biometric authentication
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                token: 'mock-biometric-token-' + Date.now(),
            };
        } catch (error) {
            return {
                success: false,
                error: `Authentication failed: ${error}`,
            };
        }
    }

    async enableBiometrics(): Promise<BiometricResult> {
        try {
            // Simulate enabling biometrics
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                success: true,
                biometryType: 'FaceID',
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to enable biometrics: ${error}`,
            };
        }
    }

    async disableBiometrics(): Promise<BiometricResult> {
        try {
            // Simulate disabling biometrics
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to disable biometrics: ${error}`,
            };
        }
    }

    getSupportedBiometricTypes(): string[] {
        return ['FaceID', 'TouchID', 'Fingerprint'];
    }
}

export default BiometricAuth.getInstance();

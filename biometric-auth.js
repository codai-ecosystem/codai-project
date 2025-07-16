// Biometric Authentication Interface
class BiometricAuth {
  constructor() {
    this.supportedMethods = ['fingerprint', 'face', 'voice', 'iris'];
    this.webAuthnSupported = this.checkWebAuthnSupport();
  }
  
  checkWebAuthnSupport() {
    return typeof window !== 'undefined' && 
           window.PublicKeyCredential && 
           PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable;
  }
  
  async registerBiometric(userId, method = 'fingerprint') {
    if (!this.webAuthnSupported) {
      throw new Error('WebAuthn not supported');
    }
    
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: this.generateChallenge(),
        rp: { name: 'CODAI Ecosystem', id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: userId
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        }
      }
    });
    
    return credential;
  }
  
  generateChallenge() {
    return crypto.getRandomValues(new Uint8Array(32));
  }
}

export default BiometricAuth;

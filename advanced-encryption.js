// Advanced Encryption Implementation
import crypto from 'crypto';
import bcrypt from 'bcrypt';

class AdvancedEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.saltRounds = 12;
  }
  
  // AES-256-GCM encryption
  encrypt(text, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipher(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  // Password hashing with bcrypt
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }
  
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

export default AdvancedEncryption;

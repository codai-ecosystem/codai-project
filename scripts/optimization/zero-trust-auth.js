// Zero Trust Authentication System
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class ZeroTrustAuth {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    this.algorithms = ['HS256', 'RS256'];
  }
  
  // Verify every request
  async verifyRequest(req, res, next) {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = jwt.verify(token, this.secretKey);
      const isValid = await this.validateSession(decoded);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      req.user = decoded;
      req.sessionId = decoded.sessionId;
      
      // Log access for behavioral analysis
      await this.logAccess(req);
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }
  
  generateToken(payload, expiresIn = '1h') {
    return jwt.sign({
      ...payload,
      sessionId: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000)
    }, this.secretKey, { expiresIn });
  }
}

export default ZeroTrustAuth;

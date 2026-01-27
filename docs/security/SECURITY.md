# Security Best Practices

## Overview

This document outlines security best practices for the SaaS Platform.

## Application Security

### 1. Authentication

#### JWT Best Practices
- Use strong secret keys (256-bit minimum)
- Set short expiration times (15 minutes for access tokens)
- Implement refresh token rotation
- Store refresh tokens securely (httpOnly cookies)
- Invalidate tokens on logout

```javascript
// Example JWT configuration
const jwtConfig = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256',
  issuer: 'saas-platform',
};
```

#### Password Security
- Minimum 8 characters
- Require complexity (uppercase, lowercase, numbers, symbols)
- Use bcrypt with 10+ rounds
- Implement password reset flow
- Enable account lockout after failed attempts
- Prevent password reuse

```javascript
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

#### Multi-Factor Authentication (MFA)
- Support TOTP (Time-based OTP)
- SMS-based verification (backup)
- Recovery codes for account recovery

### 2. Authorization

#### Role-Based Access Control (RBAC)
```javascript
const roles = {
  ADMIN: ['read', 'write', 'delete', 'manage_users'],
  USER: ['read', 'write'],
  VIEWER: ['read'],
};
```

#### Principle of Least Privilege
- Grant minimum necessary permissions
- Regular permission audits
- Time-limited access for elevated privileges

### 3. Input Validation

#### Server-Side Validation
```javascript
const { body, validationResult } = require('express-validator');

router.post('/api/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().escape(),
], validate, handler);
```

#### Sanitization
- Escape HTML special characters
- Sanitize database inputs
- Validate file uploads
- Check file types and sizes

### 4. SQL Injection Prevention

#### Use Parameterized Queries
```javascript
// Good - Parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// Bad - String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

#### ORM/Query Builder
- Use Prisma, TypeORM, or Sequelize
- Avoid raw SQL when possible

### 5. XSS Prevention

#### Content Security Policy (CSP)
```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}));
```

#### Output Encoding
- Escape user-generated content
- Use template engines with auto-escaping
- Sanitize HTML with DOMPurify

### 6. CSRF Prevention

#### CSRF Tokens
```javascript
const csrf = require('csurf');
app.use(csrf({ cookie: true }));
```

#### SameSite Cookies
```javascript
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
});
```

## API Security

### 1. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

### 2. API Authentication

#### Bearer Tokens
```
Authorization: Bearer <token>
```

#### API Keys
- Rotate regularly
- Store in secrets manager
- Never commit to repository

### 3. CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Infrastructure Security

### 1. Network Security

#### Firewall Rules
```yaml
# Security Group Example
ingress:
  - port: 443
    protocol: tcp
    source: 0.0.0.0/0
  - port: 22
    protocol: tcp
    source: corporate_ip_range
```

#### VPC Isolation
- Private subnets for databases
- Public subnets for load balancers
- NAT gateway for outbound traffic
- Network ACLs

### 2. Secrets Management

#### AWS Secrets Manager
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

const secret = await secretsManager.getSecretValue({
  SecretId: 'prod/database/credentials'
}).promise();
```

#### Environment Variables
- Never commit .env files
- Use different secrets per environment
- Rotate credentials regularly
- Encrypt sensitive variables

### 3. Container Security

#### Docker Best Practices
```dockerfile
# Use minimal base image
FROM node:18-alpine

# Run as non-root user
USER node

# Read-only filesystem
RUN chmod -R 555 /app

# Scan images for vulnerabilities
```

#### Kubernetes Security
```yaml
# SecurityContext
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

### 4. TLS/SSL

#### Certificate Management
- Use Let's Encrypt for free certificates
- Automate renewal with cert-manager
- Enforce HTTPS redirect
- Use TLS 1.3

```nginx
ssl_protocols TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
```

## Data Security

### 1. Encryption at Rest

#### Database Encryption
```sql
-- Enable encryption for PostgreSQL
ALTER DATABASE saas_db SET 
  ssl = on,
  ssl_cert_file = '/path/to/cert',
  ssl_key_file = '/path/to/key';
```

#### File Encryption
- Use AWS S3 encryption
- KMS for key management
- Client-side encryption for sensitive files

### 2. Encryption in Transit

- HTTPS for all communications
- TLS for database connections
- Secure WebSocket connections (WSS)

### 3. Data Retention

#### GDPR Compliance
- Right to be forgotten
- Data export functionality
- Audit logs
- Cookie consent

#### Backup Security
- Encrypt backups
- Secure backup storage
- Regular restore testing
- Off-site backups

## Monitoring & Auditing

### 1. Security Monitoring

#### Logging
```javascript
logger.info('User login', { 
  userId, 
  ip: req.ip, 
  userAgent: req.headers['user-agent'],
  timestamp: new Date().toISOString()
});
```

#### Alert on Suspicious Activity
- Multiple failed login attempts
- Unusual API usage patterns
- Privilege escalation attempts
- Unauthorized access attempts

### 2. Security Scanning

#### Dependency Scanning
```bash
npm audit
npm audit fix
```

#### Container Scanning
```bash
trivy image myapp:latest
```

#### Static Code Analysis
```bash
npm run lint
eslint --ext .js,.jsx src/
```

### 3. Penetration Testing

- Regular security audits
- Bug bounty program
- Third-party security assessments
- Vulnerability disclosure policy

## Incident Response

### 1. Preparation

- Incident response plan
- Security contacts list
- Escalation procedures
- Communication templates

### 2. Detection

- Real-time monitoring
- Automated alerts
- Log analysis
- Anomaly detection

### 3. Response

- Isolate affected systems
- Preserve evidence
- Investigate root cause
- Implement fixes
- Document lessons learned

## Compliance

### Standards
- GDPR (General Data Protection Regulation)
- SOC 2 (Service Organization Control 2)
- ISO 27001
- PCI DSS (if handling payments)

### Regular Audits
- Quarterly security reviews
- Annual penetration tests
- Compliance assessments
- Third-party audits

## Security Checklist

- [ ] All dependencies up to date
- [ ] No known vulnerabilities (npm audit)
- [ ] Secrets not in code
- [ ] HTTPS enforced
- [ ] Authentication implemented
- [ ] Authorization implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Logging implemented
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Disaster recovery plan
- [ ] Incident response plan
- [ ] Security training completed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)

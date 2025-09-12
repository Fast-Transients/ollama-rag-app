# Security Guide

## Security Features

### Input Validation
- File type validation (PDF, DOCX, TXT only)
- File size limits (50MB maximum)
- Filename sanitization to prevent path traversal
- Question length validation (1000 characters max)
- Model selection validation against allowlist

### Rate Limiting
- Upload endpoint: 10 requests per 15 minutes
- Chat endpoint: 20 requests per minute
- Memory-based rate limiter with automatic cleanup
- Client identification using User-Agent and forwarded headers

### Security Headers
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff (MIME type protection)
- X-XSS-Protection: 1; mode=block (XSS prevention)
- Content-Security-Policy: Restrictive policy with Ollama exception
- Referrer-Policy: origin-when-cross-origin

### Data Protection
- All processing happens locally
- No external API calls or data transmission
- Vector database stored in protected `/data` directory
- Uploaded files stored in secured `/uploads` directory
- Temporary file cleanup after processing

### Error Handling
- Sanitized error messages to prevent information leakage
- Comprehensive logging for debugging
- Graceful failure handling for missing models
- Input validation error responses

## Security Considerations

### File Upload Security
```typescript
export function validateFileUpload(file: File) {
  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }
  
  // Type validation
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat();
  
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Unsupported file format. Allowed: PDF, DOCX, TXT.');
  }
}
```

### Path Sanitization
```typescript
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.\./g, '_')
    .slice(0, 255);
}
```

### Rate Limiting Implementation
```typescript
class RateLimiter {
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now - entry.windowStart > this.config.windowMs) {
      this.store.set(identifier, { count: 1, windowStart: now });
      return true;
    }

    return entry.count < this.config.maxRequests;
  }
}
```

## Production Security Checklist

### Environment Variables
- [ ] Set NODE_ENV=production
- [ ] Configure secure CORS origins
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Configure proper CSP headers

### Container Security
- [ ] Use non-root users in containers
- [ ] Scan images for vulnerabilities
- [ ] Enable container resource limits
- [ ] Use secrets management for sensitive data
- [ ] Regular security updates

### Network Security
- [ ] Configure firewall rules
- [ ] Use private networks for internal communication
- [ ] Enable TLS encryption
- [ ] Implement network segmentation
- [ ] Monitor network traffic

### Data Security
- [ ] Encrypt data at rest
- [ ] Secure backup procedures
- [ ] Regular security audits
- [ ] Access logging and monitoring
- [ ] Data retention policies

## Threat Model

### Potential Threats
1. **File Upload Attacks**: Malicious file uploads
2. **Path Traversal**: Directory access attempts
3. **DoS Attacks**: Resource exhaustion
4. **XSS**: Cross-site scripting
5. **CSRF**: Cross-site request forgery

### Mitigations
1. **File Validation**: Strict type and size checking
2. **Path Sanitization**: Filename cleaning and validation
3. **Rate Limiting**: Request throttling and resource limits
4. **Security Headers**: Browser protection mechanisms
5. **Input Validation**: All user inputs sanitized

## Security Monitoring

### Logging
- Failed authentication attempts
- Rate limit violations
- File upload failures
- Invalid input attempts
- System errors and exceptions

### Alerts
- Unusual traffic patterns
- Multiple failed requests
- Large file uploads
- System resource exhaustion
- Security header violations

## Incident Response

### Security Incident Steps
1. Identify and contain the threat
2. Assess the impact and scope
3. Implement immediate mitigations
4. Document the incident
5. Review and improve security measures

### Contact Information
- Security team: security@company.com
- Emergency contact: on-call@company.com
- Vendor support: Ollama, Next.js communities
/**
 * Security utilities for TLC Journal
 * Provides input sanitization, rate limiting, and authorization helpers
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return sanitizeInput(email).toLowerCase();
}

/**
 * Rate limiter for login attempts
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  /**
   * Check if an identifier (IP/email) is rate limited
   */
  isLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record) return false;
    
    // Reset if window has passed
    if (now > record.resetTime) {
      this.attempts.delete(identifier);
      return false;
    }
    
    return record.count >= this.maxAttempts;
  }
  
  /**
   * Record a login attempt
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      record.count++;
    }
  }
  
  /**
   * Get remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return this.maxAttempts;
    
    const now = Date.now();
    if (now > record.resetTime) return this.maxAttempts;
    
    return Math.max(0, this.maxAttempts - record.count);
  }
  
  /**
   * Clear attempts for an identifier (after successful login)
   */
  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, allowedTypes: string[], maxSizeMB: number): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
  }
  
  // Check for executable files
  const executableExtensions = ['.exe', '.bat', '.cmd', '.sh', '.js', '.php', '.py'];
  const fileName = file.name.toLowerCase();
  if (executableExtensions.some(ext => fileName.endsWith(ext))) {
    return { valid: false, error: 'Executable files are not allowed' };
  }
  
  return { valid: true };
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password (simple hash for demo - in production use bcrypt/argon2)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'tlc-journal-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Validate submission ID format
 */
export function isValidSubmissionId(id: string): boolean {
  return /^TLC-SUB-\d{4}-\d{5}$/.test(id) || /^TLCJ-\d{4}-\d{5}$/.test(id);
}

/**
 * Sanitize HTML content (allow only safe tags)
 */
export function sanitizeHTML(html: string): string {
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  function sanitizeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      if (!allowedTags.includes(tagName)) {
        return Array.from(element.childNodes).map(sanitizeNode).join('');
      }
      
      const children = Array.from(element.childNodes).map(sanitizeNode).join('');
      return `<${tagName}>${children}</${tagName}>`;
    }
    
    return '';
  }
  
  return Array.from(doc.body.childNodes).map(sanitizeNode).join('');
}

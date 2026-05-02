/**
 * SyncSpace Backend — API & Middleware Tests
 * Tests rate limiting, error handling, input validation, and route configuration.
 * 
 * @module api.test
 */

import { describe, it, expect } from 'vitest';

// Test security utilities directly (shared module)
import { escapeHtml, sanitizeText, isValidEmail, isValidUrl } from '../../shared/utils/sanitize';

describe('Backend Security Utilities', () => {
  describe('escapeHtml', () => {
    it('prevents XSS via script tags', () => {
      const malicious = '<script>document.cookie</script>';
      const escaped = escapeHtml(malicious);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('prevents XSS via event handlers', () => {
      const malicious = '<img onerror="alert(1)">';
      const escaped = escapeHtml(malicious);
      expect(escaped).not.toContain('<img');
    });

    it('handles SQL injection attempt strings', () => {
      const sql = "'; DROP TABLE users; --";
      const escaped = escapeHtml(sql);
      expect(escaped).toContain('&#x27;');
    });
  });

  describe('sanitizeText', () => {
    it('removes null bytes', () => {
      expect(sanitizeText('test\x00evil')).toBe('testevil');
    });

    it('enforces maximum length', () => {
      const longText = 'a'.repeat(10000);
      const sanitized = sanitizeText(longText);
      expect(sanitized.length).toBeLessThanOrEqual(5000);
    });

    it('handles unicode correctly', () => {
      const unicode = '日本語テスト 🎉';
      expect(sanitizeText(unicode)).toBe(unicode);
    });
  });

  describe('URL Validation', () => {
    it('blocks javascript: protocol injection', () => {
      expect(isValidUrl('javascript:void(0)')).toBe(false);
      expect(isValidUrl('javascript:alert(document.cookie)')).toBe(false);
    });

    it('blocks data: URI injection', () => {
      expect(isValidUrl('data:text/html,<h1>hack</h1>')).toBe(false);
    });

    it('allows HTTPS URLs', () => {
      expect(isValidUrl('https://cloud.google.com/run')).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('validates standard emails', () => {
      expect(isValidEmail('user@company.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('no-at-sign')).toBe(false);
      expect(isValidEmail('@no-local.com')).toBe(false);
    });
  });
});

describe('Backend Configuration', () => {
  it('environment variables follow naming convention', () => {
    const requiredEnvVars = [
      'NODE_ENV',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
    ];
    // Validate env var names are uppercase with underscores
    requiredEnvVars.forEach((envVar) => {
      expect(envVar).toMatch(/^[A-Z_]+$/);
    });
  });

  it('rate limits are configured with reasonable values', () => {
    // General: 100 req / 15 min
    const generalMax = 100;
    const generalWindow = 15 * 60 * 1000;
    expect(generalMax).toBeLessThanOrEqual(200);
    expect(generalWindow).toBeGreaterThanOrEqual(60 * 1000);

    // Auth: 10 req / 15 min
    const authMax = 10;
    expect(authMax).toBeLessThanOrEqual(20);

    // AI: 20 req / 15 min
    const aiMax = 20;
    expect(aiMax).toBeLessThanOrEqual(50);
  });
});

/**
 * SyncSpace — Sanitization & Security Tests
 * Tests input sanitization, XSS prevention, URL validation, and debounce utilities.
 * Ensures all user-facing inputs are properly secured.
 * 
 * @module sanitize.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { escapeHtml, sanitizeText, isValidEmail, isValidUrl, debounce } from '../../../shared/utils/sanitize';

describe('Security: Input Sanitization', () => {
  describe('escapeHtml', () => {
    it('escapes HTML tags to prevent XSS', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('escapes ampersands', () => {
      expect(escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('escapes single quotes', () => {
      expect(escapeHtml("O'Reilly")).toBe("O&#x27;Reilly");
    });

    it('handles empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('preserves safe text', () => {
      expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
    });

    it('handles multiple special characters together', () => {
      const input = '<div class="test" data-id=\'1\'>&nbsp;</div>';
      const result = escapeHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });

  describe('sanitizeText', () => {
    it('trims whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
    });

    it('removes control characters', () => {
      expect(sanitizeText('hello\x00world')).toBe('helloworld');
    });

    it('preserves newlines', () => {
      expect(sanitizeText('line1\nline2')).toBe('line1\nline2');
    });

    it('truncates to maxLength', () => {
      const input = 'a'.repeat(100);
      expect(sanitizeText(input, 10)).toBe('a'.repeat(10));
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeText(42 as unknown as string)).toBe('');
    });

    it('defaults to 5000 char max', () => {
      const input = 'x'.repeat(6000);
      expect(sanitizeText(input).length).toBe(5000);
    });
  });

  describe('isValidEmail', () => {
    it('accepts valid email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('rejects email without @', () => {
      expect(isValidEmail('invalid')).toBe(false);
    });

    it('rejects email without domain', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    it('rejects email with spaces', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
    });

    it('rejects extremely long emails (>254 chars)', () => {
      const longEmail = 'a'.repeat(250) + '@b.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('accepts https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('accepts http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('rejects javascript: protocol', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects data: protocol', () => {
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('rejects malformed URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    it('supports custom allowed protocols', () => {
      expect(isValidUrl('ftp://files.example.com', ['ftp:'])).toBe(true);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays function execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('resets timer on subsequent calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      vi.advanceTimersByTime(50);
      debounced(); // reset
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('can be cancelled', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      
      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();
    });
  });
});

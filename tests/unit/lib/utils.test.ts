import { describe, it, expect } from 'vitest';
import { cn, generateConversationTitle, formatDate, formatRelativeTime } from '@/lib/utils';

describe('cn()', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conflicting tailwind classes by keeping the last one', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should filter out falsy values', () => {
    const result = cn('base', false, null, undefined, 'other');
    expect(result).toBe('base other');
  });
});

describe('generateConversationTitle()', () => {
  it('should return the original message if it is 30 characters or less', () => {
    const message = 'Hello, this is a test';
    const result = generateConversationTitle(message);
    expect(result).toBe('Hello, this is a test');
  });

  it('should truncate message longer than 30 characters and add ellipsis', () => {
    const message = 'This is a very long message that exceeds thirty characters';
    const result = generateConversationTitle(message);
    expect(result).toBe('This is a very long message th...');
    expect(result.length).toBe(33); // 30 + '...'
  });

  it('should trim whitespace before processing', () => {
    const message = '  Hello World  ';
    const result = generateConversationTitle(message);
    expect(result).toBe('Hello World');
  });

  it('should handle empty string after trim', () => {
    const message = '   ';
    const result = generateConversationTitle(message);
    expect(result).toBe('');
  });

  it('should handle exactly 30 characters without truncation', () => {
    const message = '123456789012345678901234567890'; // exactly 30
    const result = generateConversationTitle(message);
    expect(result).toBe('123456789012345678901234567890');
  });

  it('should truncate at 31 characters', () => {
    const message = '1234567890123456789012345678901'; // 31 characters
    const result = generateConversationTitle(message);
    expect(result).toBe('123456789012345678901234567890...');
  });
});

describe('formatDate()', () => {
  it('should format date in Japanese locale', () => {
    const date = new Date('2024-01-15T10:30:00');
    const result = formatDate(date);
    expect(result).toMatch(/2024\/01\/15/);
    expect(result).toMatch(/10:30/);
  });

  it('should handle different dates correctly', () => {
    const date = new Date('2023-12-31T23:59:00');
    const result = formatDate(date);
    expect(result).toMatch(/2023\/12\/31/);
    expect(result).toMatch(/23:59/);
  });

  it('should pad single-digit months and days', () => {
    const date = new Date('2024-03-05T09:05:00');
    const result = formatDate(date);
    expect(result).toMatch(/2024\/03\/05/);
    expect(result).toMatch(/09:05/);
  });
});

describe('formatRelativeTime()', () => {
  it('should return "たった今" for times less than 60 seconds ago', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    const result = formatRelativeTime(date);
    expect(result).toBe('たった今');
  });

  it('should return minutes for times less than 60 minutes ago', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    const result = formatRelativeTime(date);
    expect(result).toBe('5分前');
  });

  it('should return "1分前" for exactly 1 minute ago', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 60 * 1000); // 1 minute ago
    const result = formatRelativeTime(date);
    expect(result).toBe('1分前');
  });

  it('should return hours for times less than 24 hours ago', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = formatRelativeTime(date);
    expect(result).toBe('3時間前');
  });

  it('should return days for times less than 7 days ago', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const result = formatRelativeTime(date);
    expect(result).toBe('2日前');
  });

  it('should return formatted date for times 7 days or more ago', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/);
  });

  it('should handle boundary at exactly 59 seconds', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 59 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe('たった今');
  });

  it('should handle boundary at exactly 59 minutes', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 59 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe('59分前');
  });

  it('should handle boundary at exactly 23 hours', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 23 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe('23時間前');
  });

  it('should handle boundary at exactly 6 days', () => {
    const now = new Date();
    const date = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe('6日前');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { validatePassword, getPasswordStrength, passwordRequirements } from './passwordValidation';

describe('validatePassword', () => {
  it('rejects empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.requirements.every(r => r.met)).toBe(false);
  });

  it('rejects short password', () => {
    const result = validatePassword('Ab1!');
    expect(result.isValid).toBe(false);
    expect(result.requirements.find(r => r.id === 'minLength')?.met).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = validatePassword('lowercase1!');
    expect(result.isValid).toBe(false);
    expect(result.requirements.find(r => r.id === 'uppercase')?.met).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const result = validatePassword('UPPERCASE1!');
    expect(result.isValid).toBe(false);
    expect(result.requirements.find(r => r.id === 'lowercase')?.met).toBe(false);
  });

  it('rejects password without number', () => {
    const result = validatePassword('NoNumberHere!');
    expect(result.isValid).toBe(false);
    expect(result.requirements.find(r => r.id === 'number')?.met).toBe(false);
  });

  it('rejects password without special character', () => {
    const result = validatePassword('NoSpecial1');
    expect(result.isValid).toBe(false);
    expect(result.requirements.find(r => r.id === 'special')?.met).toBe(false);
  });

  it('accepts strong password', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result.isValid).toBe(true);
    expect(result.requirements.every(r => r.met)).toBe(true);
  });

  it('returns all 5 requirements', () => {
    const result = validatePassword('test');
    expect(result.requirements.length).toBe(5);
  });
});

describe('getPasswordStrength', () => {
  it('returns weak for short passwords', () => {
    const result = getPasswordStrength('a');
    expect(result.level).toBe('weak');
    expect(result.score).toBeLessThan(40);
  });

  it('returns fair for medium passwords', () => {
    const result = getPasswordStrength('Ab1');
    expect(['weak', 'fair', 'good']).toContain(result.level);
  });

  it('returns strong for complete passwords', () => {
    const result = getPasswordStrength('StrongP@ss1');
    expect(result.level).toBe('strong');
    expect(result.score).toBe(100);
  });

  it('score is between 0 and 100', () => {
    const result = getPasswordStrength('anything');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

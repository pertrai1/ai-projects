import { describe, it, expect } from 'vitest';
import { scoreAnswer, normalizeAnswer } from '../../src/scoring/scorer.js';

describe('normalizeAnswer', () => {
  it('trims whitespace', () => {
    expect(normalizeAnswer('  408  ')).toBe('408');
  });

  it('lowercases', () => {
    expect(normalizeAnswer('Au')).toBe('au');
  });

  it('strips leading article "the"', () => {
    expect(normalizeAnswer('The answer is B')).toBe('answer is b');
  });

  it('strips leading article "a"', () => {
    expect(normalizeAnswer('A good answer')).toBe('good answer');
  });

  it('strips trailing punctuation', () => {
    expect(normalizeAnswer('12.')).toBe('12');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeAnswer('hello   world')).toBe('hello world');
  });
});

describe('scoreAnswer', () => {
  it('scores exact match as correct', () => {
    const result = scoreAnswer('408', '408');
    expect(result.correct).toBe(true);
  });

  it('scores case-insensitive match as correct', () => {
    const result = scoreAnswer('Au', 'au');
    expect(result.correct).toBe(true);
  });

  it('scores with whitespace tolerance', () => {
    const result = scoreAnswer('  408  ', '408');
    expect(result.correct).toBe(true);
  });

  it('scores after stripping leading article', () => {
    const result = scoreAnswer('The answer is B', 'answer is B');
    expect(result.correct).toBe(true);
  });

  it('scores after stripping trailing punctuation', () => {
    const result = scoreAnswer('12.', '12');
    expect(result.correct).toBe(true);
  });

  it('scores wrong answer as incorrect', () => {
    const result = scoreAnswer('409', '408');
    expect(result.correct).toBe(false);
  });

  it('scores multiple choice letter case-insensitively', () => {
    const result = scoreAnswer('B', 'b');
    expect(result.correct).toBe(true);
  });

  it('scores word answer case-insensitively', () => {
    const result = scoreAnswer('No', 'no');
    expect(result.correct).toBe(true);
  });

  it('scores empty given as incorrect', () => {
    const result = scoreAnswer('', '408');
    expect(result.correct).toBe(false);
  });

  it('does not collapse internal spaces into no-space', () => {
    const result = scoreAnswer('4  0  8', '408');
    expect(result.correct).toBe(false);
  });

  it('preserves original given and expected in result', () => {
    const result = scoreAnswer('  Au  ', 'AU');
    expect(result.given).toBe('  Au  ');
    expect(result.expected).toBe('AU');
    expect(result.normalizedGiven).toBe('au');
    expect(result.normalizedExpected).toBe('au');
  });
});

import { describe, it, expect } from 'vitest';
import { signValue, unsignValue } from '../functions/api/_helpers';

describe('signed cookies helpers', () => {
  it('signs and verifies a value', async () => {
    const secret = 'test-secret-123';
    const value = 'user-1';
    const signed = await signValue(secret, value);
    const extracted = await unsignValue(secret, signed);
    expect(extracted).toBe(value);
  });
});

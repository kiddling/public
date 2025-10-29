import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses clipboard API when available', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    Object.assign(window, { isSecureContext: true });

    const result = await copyToClipboard('test text');

    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('test text');
  });

  it('falls back to execCommand when clipboard API is not available', async () => {
    Object.assign(navigator, { clipboard: undefined });
    const mockExecCommand = vi.fn().mockReturnValue(true);
    document.execCommand = mockExecCommand;

    const result = await copyToClipboard('test text');

    expect(result).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
  });

  it('returns false on error', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Failed'));
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    Object.assign(window, { isSecureContext: true });

    const result = await copyToClipboard('test text');

    expect(result).toBe(false);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorage } from '@/lib/storage';

describe('LocalStorage', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  it('should store and retrieve data', () => {
    const storage = new LocalStorage<string>('test-key');
    const mockData = 'test-value';

    const getItemSpy = vi.spyOn(global.localStorage, 'getItem');
    const setItemSpy = vi.spyOn(global.localStorage, 'setItem');

    getItemSpy.mockReturnValue(JSON.stringify(mockData));

    storage.set(mockData);
    expect(setItemSpy).toHaveBeenCalledWith('test-key', JSON.stringify(mockData));

    const retrieved = storage.get();
    expect(getItemSpy).toHaveBeenCalledWith('test-key');
  });

  it('should handle null values', () => {
    const storage = new LocalStorage<string>('test-key');
    
    const getItemSpy = vi.spyOn(global.localStorage, 'getItem');
    getItemSpy.mockReturnValue(null);

    const result = storage.get();
    expect(result).toBeNull();
  });

  it('should handle JSON parse errors', () => {
    const storage = new LocalStorage<string>('test-key');
    
    const getItemSpy = vi.spyOn(global.localStorage, 'getItem');
    getItemSpy.mockReturnValue('invalid-json');

    const result = storage.get();
    expect(result).toBeNull();
  });

  it('should remove items', () => {
    const storage = new LocalStorage<string>('test-key');
    
    const removeItemSpy = vi.spyOn(global.localStorage, 'removeItem');

    storage.remove();
    expect(removeItemSpy).toHaveBeenCalledWith('test-key');
  });

  it('should handle complex objects', () => {
    const storage = new LocalStorage<{ name: string; age: number }>('test-key');
    const mockData = { name: 'Test', age: 25 };

    const getItemSpy = vi.spyOn(global.localStorage, 'getItem');
    const setItemSpy = vi.spyOn(global.localStorage, 'setItem');

    getItemSpy.mockReturnValue(JSON.stringify(mockData));

    storage.set(mockData);
    expect(setItemSpy).toHaveBeenCalledWith('test-key', JSON.stringify(mockData));
  });
});

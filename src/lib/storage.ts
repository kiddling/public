export class LocalStorage<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  get(): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = window.localStorage.getItem(this.key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${this.key}":`, error);
      return null;
    }
  }

  set(value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${this.key}":`, error);
    }
  }

  remove(): void {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Error removing localStorage key "${this.key}":`, error);
    }
  }

  clear(): void {
    this.remove();
  }
}

export const designLogsStorage = new LocalStorage<any[]>('design-logs');
export const caseStudiesStorage = new LocalStorage<any[]>('case-studies');
export const aiPromptsStorage = new LocalStorage<any[]>('ai-prompts');

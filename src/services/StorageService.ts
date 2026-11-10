export class StorageService {
  public static getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (e) {
      console.error(`Error reading from localStorage [${key}]:`, e);
      return null;
    }
  }

  public static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing to localStorage [${key}]:`, e);
    }
  }
}
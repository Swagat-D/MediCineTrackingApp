import { storageService } from '../storage/storageService';

class CacheService {
  async setAppData(key: string, data: any): Promise<void> {
    await storageService.setItem(key, JSON.stringify(data));
  }

  async getAppData<T>(key: string): Promise<T | null> {
    const data = await storageService.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async clearAppData(key: string): Promise<void> {
    await storageService.removeItem(key);
  }
}

export const cacheService = new CacheService();
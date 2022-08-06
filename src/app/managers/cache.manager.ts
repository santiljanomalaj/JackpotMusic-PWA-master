import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';

/*
 * App task 1 - Cache host app
 */

interface CachedElement<T> {
  date: number,
  value: T
}
@Injectable()
export class CacheManager {

  private ttl: number = 60 * 60 * 1000; // default Time-To-Live is an hour

  constructor(private storage: Storage) {
  }

  /**
   * Sets max time to live
   * @param ttl Time to live in seconds
   */
  setTTL(ttl: number): void {
    this.ttl = ttl * 1000;
  }

  /**
   * Set the value in the cache store
   */
  async set<T>(key: string, value: T): Promise<void> {
    await this.storage.set(key, { date: Date.now(), value });
  }

  /**
   * Return the value
   */
  async get<T>(key: string): Promise<T | null> {
    const cachedElement = await this.storage.get(key) as CachedElement<T> || null;
    return cachedElement ? cachedElement.value : null
  }

  /**
   * Remove the value from the cache store
   */
  async remove(key: string): Promise<void> {
    await this.storage.remove(key);
  }

  /**
   * Remove all expired values
   */
  async clearExpired(): Promise<void> {
    const expiredKeys = await this.getExpiredKeys();
    if (!expiredKeys) { return; }
    for (const key of expiredKeys) {
      await this.remove(key);
    }
  }
  async getCacheKeys() {
    const keys = await this.storage.keys();
    const cachedElementsPromises = keys.map(async (key) => {
      const { date } = await this.storage.get(key) as CachedElement<any>
      return {
        key,
        date
      }
    })
    const cachedElements = await Promise.all(cachedElementsPromises)
    return cachedElements.reduce((elements, element) => {
      return { ...elements, ...element.date ? { [element.key]: element.date } : {} }
    }, {})
  }
  /**
   * Remove all cached values
   */
  async clearAll(): Promise<void> {
    const cacheKeys = await this.getCacheKeys();
    if (!cacheKeys) { return; }
    const keys = Object.keys(cacheKeys);
    for (const key of keys) {
      await this.remove(key);
    }
  }


  private async getExpiredKeys(): Promise<string[]> {
    const cacheKeys = await this.getCacheKeys();
    if (!cacheKeys) { return; }
    const keys = Object.keys(cacheKeys);
    return keys.filter(
      (key) => (Date.now() - cacheKeys[key]) >= this.ttl
    );
  }

}

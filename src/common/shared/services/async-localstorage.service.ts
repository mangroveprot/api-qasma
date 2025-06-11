import { AsyncLocalStorage } from 'async_hooks';

export class AsyncStrorageService {
  private static instance: AsyncStrorageService;
  private storage: AsyncLocalStorage<Map<string, any>>;

  private constructor() {
    this.storage = new AsyncLocalStorage();
  }

  public static getInstance(): AsyncStrorageService {
    if (!AsyncStrorageService.instance) {
      AsyncStrorageService.instance = new AsyncStrorageService();
    }
    return AsyncStrorageService.instance;
  }

  public set(key: string, value: any) {
    const store = this.storage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  public get(key: string): any {
    const store = this.storage.getStore();
    return store ? store.get(key) : undefined;
  }

  public run(callback: () => void, initialValue?: Map<string, any>) {
    this.storage.run(initialValue || new Map(), callback);
  }
}

import { BaseModel } from './../models/base-model';
import { Logger } from "./logger";
export class WindowStorage<T> {
  private allowed: boolean;
  private key: string;

  /**
   * Creates an instance of windowStorage.
   * @param {string} key
   * @memberof WindowStorage
   * @throws
   */
  constructor(key: string) {
    this.key = key;
    if (this.storageAvailable('localStorage')) {
      this.allowed = true;
    }
    else {
      this.allowed = false;
      throw new LocalStorageNAException();
    }
  }
  /**
   *
   *
   * @param {T} someModel
   * @memberof WindowStorage
   */
  public set(someModel: T[]): void {
    try {
      someModel = someModel.filter(x => x)
      const modelString = JSON.stringify(someModel);
      window.localStorage.setItem(this.key, modelString)
    } catch (error) {
      Logger.error(error)
    }
  }
  public update(someModel: T): void {
    try {
      if (!someModel.hasOwnProperty("id")) {
        throw new Error("Object does not have an id");
      }
      const models = this.getAll() as any;
      const modelWithId = someModel as any;
      // bithacky
      let modelIdx = models.findIndex(x => (x.id && x.id === modelWithId.id))
      models[modelIdx] = someModel;
      const modelString = JSON.stringify(models as T[]);
      window.localStorage.setItem(this.key, modelString);
    } catch (error) {
      Logger.error(error);
    }
  }
  /**
   * adds the model to the existing array
   *
   * @param {T} someModel
   * @memberof WindowStorage
   */
  public add(someModel: T): void {
    try {
      // grab from storage
      const fromStorage = this.getAll();
      fromStorage.push(someModel);
      // string modified from storage
      const sModifiedFromStorage = JSON.stringify(fromStorage);
      window.localStorage.setItem(this.key, sModifiedFromStorage)
    } catch (error) {
      Logger.error(error)
    }
  }
  /**
   *
   *
   * @returns {T[]}
   * @memberof WindowStorage
   */
  public getAll(): T[] {
    try {
      const modelString = window.localStorage.getItem(this.key);
      const model = JSON.parse(modelString) as T[] || [];
      return model;
    } catch (error) {
      Logger.error(error);
    }
  }
  public clear(): void {
    try {
      window.localStorage.removeItem(this.key);
    } catch (error) {
      Logger.error(error);
    }
  }

  public delete(id: string): void {
    try {
      const models = this.getAll();
      const model = (models as any).find(x => x.id && x.id === id)
      delete models[models.indexOf(model)];
      this.set(models);
    } catch (error) {
      Logger.error(error);
    }
  }
  private storageAvailable(type) {
    const storage = window[type];
    const x = '__storage_test__';
    try {

      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch (e) {
      return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0;
    }
  }
}

export class LocalStorageNAException extends Error {
  constructor() {
    super("localStorage is not available");
  }
}

export const KEYS = {
  TODO_LIST: 'TODO_LIST',
}

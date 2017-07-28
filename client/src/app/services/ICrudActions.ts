export interface ICrudActions<T> {
  getAll(): Promise<T[]>;
  get(id: string): Promise<T>;
  add(model: T): Promise<T>;
  update(model: T): Promise<T>;
  delete(id: string): Promise<T>;
}

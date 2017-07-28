import { WindowStorage, KEYS } from '../utilities/windowStorage';
import { ICrudActions } from './ICrudActions';
import { Todo } from '../models/todo';
import { Injectable } from '@angular/core';
@Injectable()

export class TodoService implements ICrudActions<Todo> {
  private windowStorage: WindowStorage<Todo>
  constructor() {
    this.windowStorage = new WindowStorage<Todo>(KEYS.TODO_LIST)
  }
  save(model: Todo): Promise<Todo> {
    return new Promise(resolve => {
      this.get(model.id).then(modelFromStorage => {
        if (modelFromStorage) {
          this.update(model);
        } else {

          this.add(model);
        }
      }).then(next => {
        resolve(this.get(model.id))
      })
    });
  }
  add(model: Todo): Promise<Todo> {
    return new Promise(resolve => {
      model.unsaved = false;
      this.windowStorage.add(model);
      resolve(this.get(model.id));
    });
  }
  getAll(): Promise<Todo[]> {
    return Promise.resolve(this.windowStorage.getAll());
  }
  get(id: string): Promise<Todo> {
    return Promise.resolve(this.windowStorage.getAll().find(x => (x.id === id)));
  }
  update(model: Todo): Promise<Todo> {
    return new Promise(resolve => {
      model.unsaved = false;
      this.windowStorage.update(model);
      resolve(this.get(model.id));
    });
  }
  delete(id: string): Promise<Todo> {
    return new Promise(resolve => {
      const modelToDelete = this.get(id);
      this.windowStorage.delete(id);
      resolve(modelToDelete);
    });
  }
  clear(): Promise<any> {
    return Promise.resolve(this.windowStorage.clear());
  }
  stamp (allModels: Todo[]) : Promise<Todo[]> {
    return new Promise(resolve => {
      this.windowStorage.set(allModels);
      resolve(this.getAll());
    });
  }
}

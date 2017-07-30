import { WindowStorage, KEYS } from '../utilities/windowStorage';
import { ICrudActions } from './ICrudActions';
import { Todo } from '../models/todo';
import { Injectable } from '@angular/core';

/**
 * CRUD actions for the todos
 *
 * @export
 * @class TodoService
 * @implements {ICrudActions<Todo>}
 */
@Injectable()
export class TodoService implements ICrudActions<Todo> {
  /**
   * The storage api
   *
   * @private
   * @type {WindowStorage<Todo>}
   * @memberof TodoService
   */
  private windowStorage: WindowStorage<Todo>

  constructor() {
    this.windowStorage = new WindowStorage<Todo>(KEYS.TODO_LIST)
  }

  /**
   * inserts if todo.id does not exist
   * updates if todo.id exists. The entire todo model is updated with the task passed in
   *
   * @param {Todo} model
   * @returns {Promise<Todo>}
   * @memberof TodoService
   */
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

  /**
   * inserts the task into the todo list
   *
   * @param {Todo} model
   * @returns {Promise<Todo>}
   * @memberof TodoService
   */
  add(model: Todo): Promise<Todo> {
    return new Promise(resolve => {
      model.unsaved = false;
      this.windowStorage.add(model);
      resolve(this.get(model.id));
    });
  }

  /**
   * Gets all the tasks (i.e. todo list)
   *
   * @returns {Promise<Todo[]>}
   * @memberof TodoService
   */
  getAll(): Promise<Todo[]> {
    return Promise.resolve(this.windowStorage.getAll());
  }

  /**
   * Gets a particular task via id
   *
   * @param {string} id
   * @returns {Promise<Todo>}
   * @memberof TodoService
   */
  get(id: string): Promise<Todo> {
    return Promise.resolve(this.windowStorage.getAll().find(x => (x.id === id)));
  }

  /**
   * updates a particular task
   *
   * @param {Todo} model
   * @returns {Promise<Todo>}
   * @memberof TodoService
   */
  update(model: Todo): Promise<Todo> {
    return new Promise(resolve => {
      model.unsaved = false;
      this.windowStorage.update(model);
      resolve(this.get(model.id));
    });
  }

  /**
   * deletes a particular task
   *
   * @param {string} id
   * @returns {Promise<Todo>}
   * @memberof TodoService
   */
  delete(id: string): Promise<Todo> {
    return new Promise(resolve => {
      const modelToDelete = this.get(id);
      this.windowStorage.delete(id);
      resolve(modelToDelete);
    });
  }

  /**
   * wipes the entire todo list
   *
   * @returns {Promise<any>}
   * @memberof TodoService
   */
  clear(): Promise<any> {
    return Promise.resolve(this.windowStorage.clear());
  }

  /**
   * replaces the entire todo list in storage with what has been passed in
   *
   * @param {Todo[]} allModels
   * @returns {Promise<Todo[]>}
   * @memberof TodoService
   */
  stamp (allModels: Todo[]) : Promise<Todo[]> {
    return new Promise(resolve => {
      this.windowStorage.set(allModels);
      resolve(this.getAll());
    });
  }
}

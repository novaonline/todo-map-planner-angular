import { TodoService } from '../../services/todo.service';
import { Component, OnInit } from '@angular/core';
import { Todo } from "../../models/todo";
@Component({
  selector: 'app-todo-container',
  templateUrl: './todo-container.component.html',
  styleUrls: ['./todo-container.component.css'],
  providers: [TodoService],
})
export class TodoContainerComponent implements OnInit {
  /**
   * A list of the tasks a user wishes to complete
   *
   * @type {Todo[]}
   * @memberof TodoContainerComponent
   */
  todos: Todo[];

  /**
   * The selected todo a user wishes to modify
   *
   * @type {Todo}
   * @memberof TodoContainerComponent
   */
  selectedTodo: Todo;

  constructor(private todoService: TodoService) {
    this.todos = [];
    this.selectedTodo = null;
  }

  ngOnInit(): void {
    this.todoService.getAll()
      .then(todos => {
        this.todos = todos;
      })
  }

  /**
   * adding a todo to the list
   *
   * @returns {void}
   * @memberof TodoContainerComponent
   */
  addTodo(): void {
    // pre condition
    if (this.todos.some(x => x.unsaved)) {
      alert('An unsaved entry available. Please use that instead')
      return;
    }
    var newTodo = new Todo({ editMode: true, unsaved: true });
    this.todos.push(newTodo);
    this.selectedTodo = newTodo;
  }

  /**
   * selecting a todo from list
   *
   * @param {Todo} todo
   * @memberof TodoContainerComponent
   */
  selectTodo(todo: Todo): void {
    const prevSelected = this.selectedTodo;
    this.selectedTodo = todo;
    // cancel anything that is in edit mode
    this.todos.filter(t => t.id !== todo.id && t.unsaved === false).forEach(t => {
      this.handleCancelClick(t, prevSelected);
    })
  }

  /**
   * removing a todo from list
   *
   * @param {string} id
   * @memberof TodoContainerComponent
   */
  removeFromList(id: string): void {
    this.todoService.delete(id).then(result => {
      this.todos = this.todos.filter(item => item.id !== id);
    });
  }

  /**
   * swaping positions of a todo from the list
   *
   * @param {any} todo
   * @param {any} direction
   * @returns {void}
   * @memberof TodoContainerComponent
   */
  swap(todo, direction): void {
    if (direction === 0 || !todo) {
      return;
    }
    else {
      this.todoService.getAll().then(models => {
        const srcIndex = models.findIndex(t => t.id === todo.id);
        const destIndex = srcIndex + direction;
        models[srcIndex] = models.splice(destIndex, 1, models[srcIndex])[0] // swap
        this.todoService.stamp(models).then(results => {
          this.todos = results;
          this.selectedTodo = this.todos[destIndex];
        })
      })
    }
  }

  /**
   * deselecting the selected todo
   *
   * @memberof TodoContainerComponent
   */
  deselect(): void {
    this.selectedTodo = null;
  }

  /**
   * save the unsaved todo in the 'buffer' form control
   *
   * @param {any} todo
   * @memberof TodoContainerComponent
   */
  saveTodo(todo) {
    todo.editMode = false;
    this.todoService.save(todo).then(model => {
      todo = model;
    });
  }

  /**
   * toggle which todo is in edit mode
   * note:
   * it was originally designed so that multiple todos could be edited at once
   * but simplified it to just one so that is why edit mode is not structured the same as select mode
   *
   * @param {any} todo
   * @memberof TodoContainerComponent
   */
  toggleEditMode(todo) {
    todo.editMode = !todo.editMode;
  }

  /**
   * toggle a todo item as completed or not completed
   *
   * @param {any} todo
   * @memberof TodoContainerComponent
   */
  toggleCheck(todo) {
    todo.completed = !todo.completed;
    this.todoService.save(todo).then(model => {
      todo = model;
    });
  }

  /**
   * an alias for 'removeFromList'
   *
   * @param {any} todo
   * @memberof TodoContainerComponent
   */
  deleteItem(todo) {
    this.removeFromList(todo.id);
  }

  /**
   * handles the event when a cancel has been initiated by user
   *
   * @param {any} todo
   * @param {any} prevSelected
   * @returns
   * @memberof TodoContainerComponent
   */
  handleCancelClick(todo, prevSelected) {
    if (todo.editMode === false) {
      return;
    }
    if (todo.unsaved) {
      this.deleteItem(todo);
    }
    this.todoService.get(todo.id).then(item => {
      if (!item) {
        return;
      }
      if (item.name !== todo.name) { // check if current item is dirty
        const response = confirm(`Unsaved Entry:\n"${todo.name}"\nAre you sure you want to overwrite your information?`)
        if (response) {
          this.cancelAction(todo);
        }
        else {
          // user cancelled. revert back to the previous state
          this.selectedTodo = prevSelected;
        }
      } else {
        this.cancelAction(todo);
      }
    });
  }

  /**
   * the actual cancel action
   *
   * @param {any} todo
   * @memberof TodoContainerComponent
   */
  cancelAction(todo) {
    this.toggleEditMode(todo);
    if (todo.unsaved) {
      todo.id = null;
      this.deleteItem(todo);
    } else {
      this.todoService.get(todo.id).then(item => {
        this.todos[this.todos.findIndex(x => x.id === todo.id)] = item;
        todo = item;
      })
    }
  }

  /**
   * ensure that the selected todo is one of the todos in the list
   * this might have been overkill. there's a chance that all I needed to do was to find id in this.todos
   *
   * @param {Todo} todo
   * @memberof TodoContainerComponent
   */
  syncSelectedTodo(todo: Todo) {
    this.selectedTodo = this.todos.find(x => x.id === todo.id);
  }
}

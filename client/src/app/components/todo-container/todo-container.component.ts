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
  todos: Todo[];
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
  selectTodo(todo: Todo): void {
    const prevSelected = this.selectedTodo;
    this.selectedTodo = todo;
    // cancel anything that is in edit mode
    this.todos.filter(t => t.id !== todo.id && t.unsaved === false).forEach(t => {
      this.handleCancelClick(t, prevSelected);
    })
  }
  removeFromList(id: string): void {
    this.todoService.delete(id).then(result => {
      this.todos = this.todos.filter(item => item.id !== id);
    });
  }
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
  deselect(): void {
    this.selectedTodo = null;
  }
  // todo
  saveTodo(todo) {
    todo.editMode = false;
    this.todoService.save(todo).then(model => {
      todo = model;
    });
  }
  toggleEditMode(todo) {
    todo.editMode = !todo.editMode;
  }
  toggleCheck(todo) {
    todo.completed = !todo.completed;
    this.todoService.save(todo).then(model => {
      todo = model;
    });
  }
  deleteItem(todo) {
    this.removeFromList(todo.id);
  }
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
  syncSelectedTodo(todo: Todo) {
    // this might have been overkill. there's a chance that all I needed to do was to find id in this.todos
    this.selectedTodo = this.todos.find(x => x.id === todo.id);
  }
}

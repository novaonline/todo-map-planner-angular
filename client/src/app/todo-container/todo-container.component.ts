import { TodoService } from './../../services/todo.service';
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
    var newTodo = new Todo({ editMode: true, unsaved: true });
    this.todos.push(newTodo);
    this.selectedTodo = newTodo;
  }
  selectTodo(todo: Todo): void {
    this.selectedTodo = todo;
  }
  removeFromList(id: string): void {
    this.todoService.delete(id).then(result => {
      this.todos = this.todos.filter(item => item.id !== id)
    })
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
  handleCancelClick(todo) {
    this.toggleEditMode(todo);
    if (todo.unsaved) {
      todo.id = null;
      this.deleteItem(todo);
    } else {
      this.todoService.get(todo.id).then(item => {
        todo = item;
      })
    }
  }
}

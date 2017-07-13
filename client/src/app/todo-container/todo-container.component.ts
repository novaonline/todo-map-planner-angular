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
  ngOnInit() : void {
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
  selectTodo(todo: Todo) : void {
    this.selectedTodo = todo;
  }
  removeFromList(id: string) : void {
    this.todoService.delete(id).then(result => {
      this.todos = this.todos.filter( item => item.id !== id)
    })
  }
  deselect(): void {
    this.selectedTodo = null;
  }
}

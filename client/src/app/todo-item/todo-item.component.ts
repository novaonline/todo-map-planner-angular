import { TodoService } from './../../services/todo.service';
import { Todo } from './../../models/todo';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css'],
  providers: [TodoService],
})
export class TodoItemComponent implements OnInit {
  @Input() todo: Todo;
  @Input() removeHandler;

  constructor(private todoService: TodoService) { }

  ngOnInit() {
  }
  saveTodo() {
    this.todo.editMode = false;
    this.todoService.save(this.todo).then(model => {
      this.todo = model;
    });
  }
  toggleEditMode() {
    this.todo.editMode = !this.todo.editMode;
  }
  toggleCheck() {
    this.todo.completed = !this.todo.completed;
    this.todoService.save(this.todo).then(model => {
      this.todo = model;
    });
  }
  deleteItem() {
    this.removeHandler(this.todo.id);
  }
  handleCancelClick() {
    this.toggleEditMode();
    if (this.todo.unsaved) {
      this.todo.id = null;
      this.deleteItem();
    } else {
      this.todoService.get(this.todo.id).then(item => {
        this.todo = item;
      })
    }
  }
}

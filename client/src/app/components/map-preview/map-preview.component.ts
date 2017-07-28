import { TodoService } from './../../services/todo.service';
import { Todo } from './../../models/todo';
import { LocationService } from './../../services/location.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'map-preview',
  templateUrl: './map-preview.component.html',
  styleUrls: ['./map-preview.component.css'],
  providers: [LocationService],
})
export class MapPreviewComponent implements OnInit {
  private _selectedTodo: Todo;

  @Input() set selectedTodo(value: Todo) {
    this._selectedTodo = value;
    //trigger map movement
    if (this._selectedTodo && this._selectedTodo.coords) {
      this.lat = this._selectedTodo.coords.lat;
      this.lng = this._selectedTodo.coords.lng;
    }
  }
  get selectedTodo(): Todo {
    return this._selectedTodo;
  }

  @Input() todos: Todo[];
  @Output() selectedTodoChange: EventEmitter<Todo>;
  loaded: boolean = false;
  lat: number = 51.678418;
  lng: number = 7.809007;
  constructor(private locationService: LocationService, private todoService: TodoService) {
    this.selectedTodoChange = new EventEmitter<Todo>();
  }

  ngOnInit() {
    this.locationService.getCurrentLocation().then(coords => {
      this.lat = coords.lat;
      this.lng = coords.lng;
      this.loaded = true;
    })
  }

  addMarker(e) {
    const selectedIdIndex = this.todos.findIndex(t => t.id === this.selectedTodo.id);
    this.todos[selectedIdIndex].coords = e.coords
    // save to service
    if(!this.todos[selectedIdIndex].editMode){
      this.todoService.save(this.todos[selectedIdIndex]).then(x => {
        console.log(`saved ${x.id}`);
      })
    }
  }
  clickedMarker(todo: Todo) {
    this.selectedTodo = todo;
    this.selectedTodoChange.emit(todo);
  }
}

import { NavigationDirective } from './../../directives/navigation/navigation.directive';
import { MapsAPILoader, LatLngBoundsLiteral, LatLngBounds } from '@agm/core';
import { TodoService } from './../../services/todo.service';
import { Todo } from './../../models/todo';
import { LocationService } from './../../services/location.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormControl } from "@angular/forms";
import { } from '@types/googlemaps';
declare var google: any;

@Component({
  selector: 'map-preview',
  templateUrl: './map-preview.component.html',
  styleUrls: ['./map-preview.component.css'],
  providers: [LocationService, TodoService],
})
export class MapPreviewComponent implements OnInit {
  private _selectedTodo: Todo;

  @ViewChild("search")
  public searchElementRef: ElementRef; // element reference

  @Input() todos: Todo[];

  @Output() selectedTodoChange: EventEmitter<Todo>;

  public searchControl: FormControl;

  loaded: boolean = false;

  lat: number = 51.678418;

  lng: number = 7.809007;

  z: number = 8;

  fitBounds: LatLngBoundsLiteral | LatLngBounds;

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

  constructor(
    private locationService: LocationService,
    private todoService: TodoService,
    private mapLoader: MapsAPILoader,
    private ngZone: NgZone,
  ) {
    this.selectedTodoChange = new EventEmitter<Todo>();
    //create search FormControl
    this.searchControl = new FormControl();
  }

  @ViewChild(NavigationDirective) navDirective: NavigationDirective;

  ngOnInit() {
    this.locationService.getCurrentLocation().then(coords => {
      this.lat = coords.lat;
      this.lng = coords.lng;
      this.loaded = true;
    }).catch((e) => {
      alert(e);
      this.loaded = true;
    });

    this.mapLoader.load().then(() => {
      // http://brianflove.com/2016/10/18/angular-2-google-maps-places-autocomplete/
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
      }
        /*,options*/);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.z = this.guessZoom(place.geometry.viewport)
        })
      })
    });
  }

  addMarker(e) {
    if(this.selectedTodo === null ){
      return;
    }
    const selectedIdIndex = this.todos.findIndex(t => t.id === this.selectedTodo.id);
    this.todos[selectedIdIndex].coords = e.coords
    // save to service
    if (!this.todos[selectedIdIndex].editMode) {
      this.todoService.save(this.todos[selectedIdIndex]).then(x => {
        console.log(`saved ${x.id}`);
      })
    }

  }
  clickedMarker(todo: Todo) {
    this.selectedTodo = todo;
    this.selectedTodoChange.emit(todo);
  }

  boundsChanged(e) {
    console.log('bounds changed');
  }
  private guessZoom(viewport: google.maps.LatLngBounds) {
    // https://stackoverflow.com/questions/294250/how-do-i-retrieve-an-html-elements-actual-width-and-height
    var GLOBE_WIDTH = 256; // a constant in Google's map projection
    console.log(viewport);
    var west = viewport.getSouthWest().lng();
    var east = viewport.getNorthEast().lng();
    var angle = east - west;
    if (angle < 0) {
      angle += 360;
    }
    // assume map width is 1200px
    var zoom = Math.floor(Math.log(1200 * 360 / angle / GLOBE_WIDTH) / Math.LN2)
    return zoom;
  }

  public calcRoute() {
    this.navDirective.getRoute();
  }

}

import { NavigationDirective } from './../../directives/navigation/navigation.directive';
import { MapsAPILoader, LatLngBoundsLiteral, LatLngBounds } from '@agm/core';
import { TodoService } from './../../services/todo.service';
import { Todo } from './../../models/todo';
import { LocationService } from './../../services/location.service';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormControl } from "@angular/forms";
import { } from '@types/googlemaps';

@Component({
  selector: 'map-preview',
  templateUrl: './map-preview.component.html',
  styleUrls: ['./map-preview.component.css'],
  providers: [LocationService, TodoService],
})

export class MapPreviewComponent implements OnInit {
  /**
   * We use the Todos to create a map representation of the list
   * Some things like creating a lat long point depend on this
   *
   * @type {Todo[]}
   * @memberof MapPreviewComponent
   */
  @Input() todos: Todo[];

  /**
   * Used for searching a location
   *
   * @type {FormControl}
   * @memberof MapPreviewComponent
   */
  public searchControl: FormControl;

  /**
   * Flag used to determine if the view should show a loader or not
   *
   * @type {boolean}
   * @memberof MapPreviewComponent
   */
  loaded: boolean = false;

  /**
   * The latitude property
   *
   * @type {number}
   * @memberof MapPreviewComponent
   */
  lat: number = 51.678418;

  /**
   * The longitude property
   *
   * @type {number}
   * @memberof MapPreviewComponent
   */
  lng: number = 7.809007;

  /**
   * The zoom property
   *
   * @type {number}
   * @memberof MapPreviewComponent
   */
  z: number = 8;

  /**
   * This needs to go. It'll be in a separate directive called 'camera'
   *
   * @type {(LatLngBoundsLiteral | LatLngBounds)}
   * @memberof MapPreviewComponent
   */
  fitBounds: LatLngBoundsLiteral | LatLngBounds;

  /**
   * used to relay that the selected todo has changed back to the master list
   *
   * @type {EventEmitter<Todo>}
   * @memberof MapPreviewComponent
   */
  @Output() selectedTodoChange: EventEmitter<Todo>;

  /**
   * stores the selectedTodo for this component
   *
   * @private
   * @type {Todo}
   * @memberof MapPreviewComponent
   */
  private _selectedTodo: Todo;

  /**
   * Directive used to power the navigation aspect
   *
   * @type {NavigationDirective}
   * @memberof MapPreviewComponent
   */
  @ViewChild(NavigationDirective) navDirective: NavigationDirective;

  /**
   * Element reference to the search input
   *
   * @type {ElementRef}
   * @memberof MapPreviewComponent
   */
  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    private locationService: LocationService,
    private todoService: TodoService,
    private mapLoader: MapsAPILoader,
    private ngZone: NgZone,
  ) {
    this.selectedTodoChange = new EventEmitter<Todo>();
    this.searchControl = new FormControl();
  }

  /**
   * The getter for a selectedTodo
   *
   * @readonly
   * @type {Todo}
   * @memberof MapPreviewComponent
   */
  get selectedTodo(): Todo {
    return this._selectedTodo;
  }

  /**
  * Setter for Selected TODO
  *
  * @memberof MapPreviewComponent
  */
  @Input() set selectedTodo(value: Todo) {
    this._selectedTodo = value;
    //trigger map movement
    if (this._selectedTodo && this._selectedTodo.coords) {
      this.lat = this._selectedTodo.coords.lat;
      this.lng = this._selectedTodo.coords.lng;
    }
  }

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

  /**
   * used to add a marker for a todo that does not have coords
   *
   * @param {any} e
   * @returns
   * @memberof MapPreviewComponent
   */
  addMarker(e) {
    if (this.selectedTodo === null) {
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

  /**
   * Determines what should happen when a marker is clicked.
   * For the most part it will broadcast that the selectedTodo has changed
   *
   * @param {Todo} todo
   * @memberof MapPreviewComponent
   */
  clickedMarker(todo: Todo) {
    this.selectedTodo = todo;
    this.selectedTodoChange.emit(todo);
  }

  /**
   * computes the round trip via the todo points
   *
   * @memberof MapPreviewComponent
   */
  calcRoute() {
    this.navDirective.getRoute();
  }

  /**
   * Gets the best zoom level from a viewport
   * calculated used: https://stackoverflow.com/questions/294250/how-do-i-retrieve-an-html-elements-actual-width-and-height
   * assumes a map width of 1200px
   * @private
   * @param {google.maps.LatLngBounds} viewport
   * @returns
   * @memberof MapPreviewComponent
   */
  private guessZoom(viewport: google.maps.LatLngBounds) {
    let GLOBE_WIDTH = 256; // a constant in Google's map projection
    let MAP_WIDTH = 1200; // in pixels
    console.log(viewport);
    let west = viewport.getSouthWest().lng();
    let east = viewport.getNorthEast().lng();
    let angle = east - west;
    if (angle < 0) {
      angle += 360;
    }
    let zoom = Math.floor(Math.log(MAP_WIDTH * 360 / angle / GLOBE_WIDTH) / Math.LN2)
    return zoom;
  }

}

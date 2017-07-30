import { Todo } from '../../models/todo';
import { Coords } from '../../models/coords';
import { GoogleMapsAPIWrapper, LatLngBounds, MapsAPILoader } from '@agm/core';
import { Directive, Input, NgZone } from '@angular/core';

@Directive({
  selector: 'map-navigation'
})
export class NavigationDirective {

  /**
   * User location latitude
   *
   * @type {number}
   * @memberof NavigationDirective
   */
  @Input() userLocationLat: number;

  /**
   * User location longitude
   *
   * @type {number}
   * @memberof NavigationDirective
   */
  @Input() userLocationLng: number;

  /**
   * The list of todos used as via points to calculate a route
   *
   * @type {Todo[]}
   * @memberof NavigationDirective
   */
  @Input() todos: Todo[];

  /**
   * currently accepts any, but is actually google.maps.DirectionsRenderer
   * Using the actual class introduces some type issues with the 'nativeMAP' returned by agm
   * agm essentially created their own types
   *
   * @private
   * @type {google.maps.DirectionsRenderer}
   * @memberof NavigationDirective
   */
  private directionsDisplay: any;

  /**
   * google maps Directions service
   *
   * @private
   * @type {google.maps.DirectionsService}
   * @memberof NavigationDirective
   */
  private directionService: google.maps.DirectionsService;

  constructor(private _mapApi: GoogleMapsAPIWrapper, private _mapLoader: MapsAPILoader, private ngZone: NgZone) {
    this._mapLoader.load().then(r => {
      this.directionService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer();
    })
  }

  /**
   * Grab the userLocation Input and calculates the routes using the todos as via waypoints
   *
   * @returns
   * @memberof NavigationDirective
   */
  public getRoute() {
    if (this.userLocationLat === null || this.userLocationLng === null) {
      // display warning
      return;
    }
    // pre conditions passed... going to need the native map object
    this._mapApi.getNativeMap().then(m => {
      this.ngZone.run(() => {
        // get directions service
        const startingCoords = new google.maps.LatLng(this.userLocationLat, this.userLocationLng);
        const endingCoords = new google.maps.LatLng(this.userLocationLat, this.userLocationLng);
        this.directionsDisplay.setMap(m);
        this.directionsDisplay.setOptions({
          polylineOptions: {
            strokeWeight: 8,
            strokeOpacity: 0.7,
            strokeColor: '#00468c'
          }
        });

        const request = {
          origin: startingCoords,
          destination: endingCoords, // for testing
          travelMode: google.maps.TravelMode.DRIVING,
          waypoints: this.convertToWaypoints(),
          optimizeWaypoints: true,
        };
        const me = this; // need to do this.. because... javascript
        this.directionsDisplay.setDirections({ routes: [] }); // reset directions display
        this.directionService.route(request, (response, status) => {
          if (status.toString() === 'OK') {
            me.directionsDisplay.setDirections(response);
            this.produceBonusStuff(response);
          } else {
            console.log('Directions request failed due to ' + status);
            // one of the failures that should be handled is the max waypoint limit
            // or simply add a todo limit
            // might want to bypass it by making a checkpoint system.
            // calc route to get end position, use end position as the starting point for next route
          }
        });
      });
    })
  }

  private produceBonusStuff(response: google.maps.DirectionsResult) {
    // a little bonus (this will help for the 'pickmeup' app)
    const point = response.routes[0].legs[0];
    const estimatedTime = point.duration.text;
    const estimatedDistance = point.distance.text;
    console.log(estimatedTime);
    console.log('Estimated travel time: ' + point.duration.text + ' (' + point.distance.text + ')');
    // this is wrong
  }
  private convertToWaypoints(): google.maps.DirectionsWaypoint[] {
    return this.todos.filter(todo => {
      return todo.coords;
    }).map(todo => {
      return {
        location: new google.maps.LatLng(todo.coords.lat, todo.coords.lng),
        stopover: true,
      };
    });
  }
}

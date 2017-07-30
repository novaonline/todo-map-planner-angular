import { Coords } from '../models/coords';
import { Injectable } from '@angular/core';

/**
 * Location service.
 * Primarily used to get the user's current location
 *
 * @export
 * @class LocationService
 */
@Injectable()
export class LocationService {

  constructor() { }

  /**
   * Returns the user's current location
   *
   * @returns {Promise<Coords>}
   * @memberof LocationService
   */
  getCurrentLocation(): Promise<Coords> {
    return new Promise((resolve, reject) => {
      const coords = new Coords({});
      if ("geolocation" in navigator) {
        /* geolocation is available */
      } else {
        /* geolocation IS NOT available */
        alert('Warning: Geo Location is not available');
        return;
      }
      window.navigator.geolocation.getCurrentPosition((position) => {
        coords.lat = position.coords.latitude;
        coords.lng = position.coords.longitude;
        resolve(coords);
      }, (position) => {
        reject("Declined location service");
      })
    })

  }
}

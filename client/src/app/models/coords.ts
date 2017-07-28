export class Coords {
  lat: number;
  lng: number;
  constructor(props) {
    if (props) {
      this.lat = props.lat || null;
      this.lng = props.lng || null;
    }
  }
}

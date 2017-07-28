import { Coords } from './coords'
import { BaseModel } from "./base-model";
export class Todo extends BaseModel {
  name: string;
  coords: Coords;
  editMode: boolean;
  completed: boolean;
  unsaved: boolean;
  constructor(props?: any) {
    super(props);
    if (props) {
      this.name = props.name || null;
      this.coords = props.coords || null;
      this.editMode = props.editMode || false;
      this.completed = props.completed || false;
      this.unsaved = props.unsaved || false;
    }
  }
}

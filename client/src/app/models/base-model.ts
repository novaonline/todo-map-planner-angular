import uuidv4 from 'uuid/v4'
export class BaseModel {
  id: string;
  constructor(props? : any) {
    if (props) {
      this.id = props.id || uuidv4();
    }
  }
}

import { v4 } from "uuid";

export class Room {
  uuid: string;

  constructor() {
    this.uuid = v4();
  }
}

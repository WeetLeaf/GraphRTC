import { v4 } from "uuid";
import { Participant } from "./Participants";

export class Room {
  uuid: string;
  participants: Participant[] = [];

  constructor() {
    this.uuid = v4();
  }

  static New(): Room {
    return new Room();
  }
}

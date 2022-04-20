import { v4 } from "uuid";
import { RoomAction } from "./RoomAction";

export class Participant {
  uuid: string;
  name: string;

  constructor(name: string) {
    this.name = name;
    this.uuid = v4();
  }
}

export class ParticiantAction {
  participant: Participant;
  action: RoomAction;

  constructor(participant: Participant, action: RoomAction) {
    this.participant = participant;
    this.action = action;
  }
}

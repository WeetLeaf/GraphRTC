import { v4 } from "uuid";
import type { Offer } from "./Offer";
import type { Participant } from "./Participants";

export class Room {
  uuid: string;
  offer: Offer;
  participants: Participant[] = [];

  constructor(offer: Offer) {
    this.uuid = v4();
    this.offer = offer;
  }
}

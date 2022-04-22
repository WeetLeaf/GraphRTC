import { v4 } from "uuid";
import { Offer } from "./Offer";

export class Participant {
  uuid: string;

  constructor() {
    this.uuid = v4();
  }
}

export class ParticiantOffer {
  participant: Participant;
  offer: Offer;

  constructor(participant: Participant, offer: Offer) {
    this.participant = participant;
    this.offer = offer;
  }
}

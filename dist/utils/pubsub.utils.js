"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPubSub = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
class CustomPubSub {
    constructor() {
        this._pubsub = new graphql_subscriptions_1.PubSub();
    }
    publish(event, payload) {
        return this._pubsub.publish(event, payload);
    }
    asyncIterator(event) {
        return {
            [Symbol.asyncIterator]: () => this._pubsub.asyncIterator(event),
        };
    }
    subscribe(triggerName, onMessage) {
        return this._pubsub.subscribe(triggerName, onMessage);
    }
    unsubscribe(subId) {
        this._pubsub.unsubscribe(subId);
    }
}
exports.CustomPubSub = CustomPubSub;

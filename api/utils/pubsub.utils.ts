import { PubSub } from 'graphql-subscriptions';

export class CustomPubSub {
  private _pubsub: PubSub;

  constructor() {
    this._pubsub = new PubSub();
  }

  public publish<T>(event: string, payload: T) {
    return this._pubsub.publish(event, payload);
  }

  public asyncIterator<T>(event: string): AsyncIterable<T> {
    return {
      [Symbol.asyncIterator]: (): AsyncIterator<T> =>
        this._pubsub.asyncIterator<T>(event),
    };
  }

  public subscribe(
    triggerName: string,
    onMessage: (...args: any[]) => void
  ): Promise<number> {
    return this._pubsub.subscribe(triggerName, onMessage);
  }

  public unsubscribe(subId: number) {
    this._pubsub.unsubscribe(subId);
  }
}

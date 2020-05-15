import {
  init_subscribers,
  add_subscriber,
  remove_subscriber,
  call_subscribers,
  subscribers_is_empty,
} from './subscribers.js';

export class SubscriberMap {
  constructor() {
    this.subscribers = new Map();
  }

  add(key, subscriber) {
    const subscribers = this.subscribers.get(key) || init_subscribers();

    this.subscribers.set(key, add_subscriber(subscribers, subscriber));
  }

  remove(key, subscriber) {
    const subscribers = remove_subscriber(
      this.subscribers.get(key),
      subscriber
    );

    if (subscribers_is_empty(subscribers)) {
      this.subscribers.delete(key);
    } else {
      this.subscribers.set(key, subscribers);
    }
  }

  call(key, ...args) {
    const subscribers = this.subscribers.get(key) || init_subscribers();

    call_subscribers(subscribers, ...args);
  }

  subscribe(key, cb) {
    this.add(key, cb);

    return () => {
      if (cb === null) return;
      this.remove(key, cb);
      cb = null;
    };
  }
}

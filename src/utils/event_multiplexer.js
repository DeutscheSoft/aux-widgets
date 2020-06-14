import { typecheckFunction } from './typecheck.js';
import { subscriberError } from './subscribers.js';

export class EventMultiplexer {
  constructor(activate) {
    this.activate = activate;
    this.deactivate = null;
    this.subscribers = new Set();
    this._call = (...args) => {
      this.subscribers.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          subscriberError(err);
        }
      });
    };
  }

  add(cb) {
    typecheckFunction(cb);

    const subscribers = this.subscribers;
    const do_activate = subscribers.size === 0;

    if (subscribers.has(cb)) throw new Error('Adding subscriber twice.');

    subscribers.add(cb);

    if (!do_activate) return;

    this.deactivate = this.activate(this._call);
  }

  delete(cb) {
    const subscribers = this.subscribers;

    typecheckFunction(cb);

    if (!subscribers.delete(cb)) throw new Error('Unknown subscriber.');

    if (subscribers.size > 0) return;

    this.deactivate();
    this.deactivate = null;
  }
}

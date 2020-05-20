/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import {
  initSubscribers,
  addSubscriber,
  removeSubscriber,
  callSubscribers,
  subscribersIsEmpty,
} from './subscribers.js';

export class SubscriberMap {
  constructor() {
    this.subscribers = new Map();
  }

  add(key, subscriber) {
    const subscribers = this.subscribers.get(key) || initSubscribers();

    this.subscribers.set(key, addSubscriber(subscribers, subscriber));
  }

  remove(key, subscriber) {
    const subscribers = removeSubscriber(this.subscribers.get(key), subscriber);

    if (subscribersIsEmpty(subscribers)) {
      this.subscribers.delete(key);
    } else {
      this.subscribers.set(key, subscribers);
    }
  }

  call(key, ...args) {
    const subscribers = this.subscribers.get(key) || initSubscribers();

    callSubscribers(subscribers, ...args);
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

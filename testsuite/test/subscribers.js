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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import {
  initSubscribers,
  subscribersIsEmpty,
  addSubscriber,
  removeSubscriber,
  callSubscribers,
  Subscribers,
} from '../../src/utils/subscribers.js';
import { assert, assertError } from './utils/helpers.js';

const TO_SET = 32;
const TO_ARRAY = 16;

function makeCallback() {
  const cb = (...args) => {
    cb.calls.push(args);
  };

  cb.calls = [];
  return cb;
}

function makeCallbacks(count) {
  const callbacks = new Array(count);

  for (let i = 0; i < count; i++) callbacks[i] = makeCallback();

  return callbacks;
}

function addAll(subscribers, callbacks) {
  for (let i = 0; i < callbacks.length; i++) {
    subscribers = addSubscriber(subscribers, callbacks[i]);
  }

  return subscribers;
}

function removeAll(subscribers, callbacks) {
  for (let i = 0; i < callbacks.length; i++) {
    subscribers = removeSubscriber(subscribers, callbacks[i]);
  }

  return subscribers;
}

describe('subscribers', () => {
  it('starts empty', () => {
    assert(subscribersIsEmpty(initSubscribers()));
  });

  it('stores one subscriber as the function itself', () => {
    const cb = makeCallback();
    const subscribers = addSubscriber(initSubscribers(), cb);

    assert(subscribers === cb);

    callSubscribers(subscribers, 1, 2);
    assert(cb.calls.length === 1);
    assert(cb.calls[0][0] === 1);
    assert(cb.calls[0][1] === 2);

    assert(removeSubscriber(subscribers, cb) === null);
  });

  it('stores a few subscribers as a mutable array', () => {
    const [a, b, c] = makeCallbacks(3);
    let subscribers = addSubscriber(initSubscribers(), a);

    subscribers = addSubscriber(subscribers, b);
    assert(Array.isArray(subscribers));
    assert(subscribers.length === 2);

    const same = subscribers;

    subscribers = addSubscriber(subscribers, c);
    assert(subscribers === same);
    assert(subscribers.length === 3);

    callSubscribers(subscribers, 'x');
    assert(a.calls.length === 1);
    assert(b.calls.length === 1);
    assert(c.calls.length === 1);

    subscribers = removeSubscriber(subscribers, b);
    assert(Array.isArray(subscribers));
    assert(subscribers.length === 2);
    assert(subscribers[0] === a);
    assert(subscribers[1] === c);

    subscribers = removeSubscriber(subscribers, a);
    assert(subscribers === c);
  });

  it('switches to a Set at 32 subscribers', () => {
    const callbacks = makeCallbacks(TO_SET);
    let subscribers = addAll(initSubscribers(), callbacks.slice(0, TO_SET - 1));

    assert(Array.isArray(subscribers));
    assert(subscribers.length === TO_SET - 1);

    subscribers = addSubscriber(subscribers, callbacks[TO_SET - 1]);
    assert(subscribers instanceof Set);
    assert(subscribers.size === TO_SET);

    callSubscribers(subscribers, 7);
    for (let i = 0; i < callbacks.length; i++) {
      assert(callbacks[i].calls.length === 1);
      assert(callbacks[i].calls[0][0] === 7);
    }
  });

  it('switches back to an array at 16 subscribers', () => {
    const callbacks = makeCallbacks(TO_SET);
    let subscribers = addAll(initSubscribers(), callbacks);

    assert(subscribers instanceof Set);

    subscribers = removeAll(subscribers, callbacks.slice(TO_ARRAY + 1));
    assert(subscribers instanceof Set);
    assert(subscribers.size === TO_ARRAY + 1);

    subscribers = removeSubscriber(subscribers, callbacks[TO_ARRAY]);
    assert(Array.isArray(subscribers));
    assert(subscribers.length === TO_ARRAY);
  });

  it('shrinks from a Set to one function and then to null', () => {
    const callbacks = makeCallbacks(TO_SET);
    let subscribers = addAll(initSubscribers(), callbacks);

    subscribers = removeAll(subscribers, callbacks.slice(1));
    assert(subscribers === callbacks[0]);

    subscribers = removeSubscriber(subscribers, callbacks[0]);
    assert(subscribersIsEmpty(subscribers));
  });

  it('rejects adding the same subscriber twice', () => {
    const [a, b] = makeCallbacks(2);
    let subscribers = addSubscriber(initSubscribers(), a);

    assertError(() => addSubscriber(subscribers, a));

    subscribers = addSubscriber(subscribers, b);
    assertError(() => addSubscriber(subscribers, a));
    assertError(() => addSubscriber(subscribers, b));

    subscribers = addAll(subscribers, makeCallbacks(TO_SET - 2));
    assert(subscribers instanceof Set);
    assertError(() => addSubscriber(subscribers, a));
  });

  it('rejects removing an unknown subscriber', () => {
    const [a, b] = makeCallbacks(2);

    assertError(() => removeSubscriber(initSubscribers(), a));
    assertError(() => removeSubscriber(addSubscriber(initSubscribers(), a), b));

    let subscribers = addAll(initSubscribers(), makeCallbacks(TO_SET));
    assertError(() => removeSubscriber(subscribers, a));
  });

  it('rejects non-function subscribers', () => {
    assertError(() => addSubscriber(initSubscribers(), null));
    assertError(() => removeSubscriber(initSubscribers(), null));
  });

  it('keeps calling remaining subscribers if one throws', () => {
    const a = makeCallback();
    const boom = () => {
      boom.calls++;
      throw new Error('boom');
    };
    const b = makeCallback();

    boom.calls = 0;

    const subscribers = addAll(initSubscribers(), [a, boom, b]);

    callSubscribers(subscribers, 1);
    assert(a.calls.length === 1);
    assert(boom.calls === 1);
    assert(b.calls.length === 1);
  });

  it('Subscribers class wraps the functional API', () => {
    const subscribers = new Subscribers();
    const [a, b] = makeCallbacks(2);

    assert(subscribersIsEmpty(subscribers.subscribers));

    const unsubscribe = subscribers.subscribe(a);
    subscribers.add(b);
    subscribers.call(3);
    assert(a.calls.length === 1);
    assert(b.calls.length === 1);
    assert(a.calls[0][0] === 3);

    assertError(() => subscribers.add(a));

    unsubscribe();
    subscribers.call(4);
    assert(a.calls.length === 1);
    assert(b.calls.length === 2);

    subscribers.destroy();
    assert(subscribersIsEmpty(subscribers.subscribers));
  });
});

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

import { fromObservable, fromSubject } from '../../src/index.js';
import { assert, assertError } from './utils/helpers.js';

function makeSubject(initial) {
  const subscribers = [];
  let value = initial;

  return {
    get value() {
      return value;
    },
    get subscriberCount() {
      return subscribers.length;
    },
    subscribe(cb) {
      subscribers.push(cb);
      cb(value);
      return {
        unsubscribe() {
          const i = subscribers.indexOf(cb);
          if (i !== -1) subscribers.splice(i, 1);
        },
      };
    },
    next(v) {
      value = v;
      subscribers.slice().forEach((cb) => cb(v));
    },
  };
}

function makeObservable() {
  const subscribers = [];

  return {
    get subscriberCount() {
      return subscribers.length;
    },
    subscribe(cb) {
      subscribers.push(cb);
      return {
        unsubscribe() {
          const i = subscribers.indexOf(cb);
          if (i !== -1) subscribers.splice(i, 1);
        },
      };
    },
    push(v) {
      subscribers.slice().forEach((cb) => cb(v));
    },
  };
}

describe('fromObservable', () => {
  it('normalizes object teardown to a function', () => {
    const observable = makeObservable();
    const readable = fromObservable(observable);
    const seen = [];

    const unsubscribe = readable.subscribe((v) => seen.push(v));
    assert(typeof unsubscribe === 'function');
    assert(observable.subscriberCount === 1);

    observable.push(1);
    assert(seen[0] === 1);

    unsubscribe();
    assert(observable.subscriberCount === 0);
    observable.push(2);
    assert(seen.length === 1);
  });

  it('forwards function teardown unchanged', () => {
    let closed = false;
    const readable = fromObservable({
      subscribe(cb) {
        cb(7);
        return () => {
          closed = true;
        };
      },
    });

    const unsubscribe = readable.subscribe(() => {});
    assert(typeof unsubscribe === 'function');
    unsubscribe();
    assert(closed);
  });

  it('requires subscribe', () => {
    assertError(() => fromObservable(null));
    assertError(() => fromObservable({}));
  });
});

describe('fromSubject', () => {
  it('maps set to next and returns a function from subscribe', () => {
    const subject = makeSubject(1);
    const value = fromSubject(subject);
    const seen = [];

    const unsubscribe = value.subscribe((v) => seen.push(v));
    assert(typeof unsubscribe === 'function');
    assert(seen.length === 1);
    assert(seen[0] === 1);

    value.set(2);
    assert(subject.value === 2);
    assert(seen[1] === 2);

    unsubscribe();
    assert(subject.subscriberCount === 0);

    value.set(3);
    assert(seen.length === 2);
  });

  it('requires subscribe and next', () => {
    assertError(() => fromSubject(null));
    assertError(() => fromSubject({ subscribe() {} }));
    assertError(() => fromSubject({ next() {} }));
  });
});

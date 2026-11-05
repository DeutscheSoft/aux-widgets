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

import { getCurrentValue } from '../../src/utils/get_current_value.js';
import { assert } from './utils/helpers.js';

function makeStateful(initial) {
  const subscribers = [];
  let value = initial;

  return {
    subscribe(cb) {
      subscribers.push(cb);
      if (value !== void 0) cb(value);
      return () => {
        const i = subscribers.indexOf(cb);
        if (i !== -1) subscribers.splice(i, 1);
      };
    },
    set(v) {
      value = v;
      subscribers.slice().forEach((cb) => cb(v));
    },
    get subscriberCount() {
      return subscribers.length;
    },
  };
}

function makeCold() {
  const subscribers = [];

  return {
    subscribe(cb) {
      subscribers.push(cb);
      return () => {
        const i = subscribers.indexOf(cb);
        if (i !== -1) subscribers.splice(i, 1);
      };
    },
    push(v) {
      subscribers.slice().forEach((cb) => cb(v));
    },
    get subscriberCount() {
      return subscribers.length;
    },
  };
}

describe('getCurrentValue', () => {
  it('returns the synchronous subscribe value', () => {
    const readable = makeStateful(7);
    assert(getCurrentValue(readable) === 7);
    assert(getCurrentValue(readable, 0) === 7);
  });

  it('returns initialValue when nothing is emitted synchronously', () => {
    const readable = makeCold();
    assert(getCurrentValue(readable) === void 0);
    assert(getCurrentValue(readable, 42) === 42);
  });

  it('preserves an explicit synchronous undefined', () => {
    const readable = {
      subscribe(cb) {
        cb(undefined);
        return () => {};
      },
    };
    assert(getCurrentValue(readable, 1) === void 0);
  });

  it('unsubscribes immediately', () => {
    const stateful = makeStateful(1);
    getCurrentValue(stateful);
    assert(stateful.subscriberCount === 0);

    const cold = makeCold();
    getCurrentValue(cold, 0);
    assert(cold.subscriberCount === 0);
  });

  it('uses the last synchronous emission during subscribe', () => {
    const readable = {
      subscribe(cb) {
        cb(1);
        cb(2);
        return () => {};
      },
    };
    assert(getCurrentValue(readable) === 2);
  });
});

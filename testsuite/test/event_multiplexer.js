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

import { EventMultiplexer } from '../../src/utils/event_multiplexer.js';
import { assert, assertError } from './utils/helpers.js';
import { SilentError } from './utils/silent_error.js';

function makeCallback() {
  const cb = (...args) => {
    cb.calls.push(args);
  };

  cb.calls = [];
  return cb;
}

describe('EventMultiplexer', () => {
  it('activates on the first subscriber and deactivates on the last', () => {
    let active = 0;
    let deactivateCalls = 0;
    let notify = null;

    const mux = new EventMultiplexer((cb) => {
      active++;
      notify = cb;
      return () => {
        deactivateCalls++;
        notify = null;
      };
    });

    const a = makeCallback();
    const b = makeCallback();

    assert(active === 0);

    mux.add(a);
    assert(active === 1);
    assert(typeof notify === 'function');

    mux.add(b);
    assert(active === 1);

    notify(1, 2);
    assert(a.calls.length === 1);
    assert(b.calls.length === 1);
    assert(a.calls[0][0] === 1);
    assert(a.calls[0][1] === 2);

    mux.delete(a);
    assert(active === 1);
    assert(deactivateCalls === 0);

    mux.delete(b);
    assert(active === 1);
    assert(deactivateCalls === 1);
    assert(notify === null);
  });

  it('reactivates when a subscriber is added again after becoming empty', () => {
    let active = 0;

    const mux = new EventMultiplexer((cb) => {
      active++;
      return () => {};
    });

    const a = makeCallback();

    mux.add(a);
    mux.delete(a);
    mux.add(a);

    assert(active === 2);
  });

  it('rejects duplicate and unknown subscribers', () => {
    const mux = new EventMultiplexer(() => () => {});
    const a = makeCallback();

    mux.add(a);
    assertError(() => mux.add(a));
    assertError(() => mux.delete(makeCallback()));
    assertError(() => mux.add(null));
    assertError(() => mux.delete(null));
  });

  it('keeps calling remaining subscribers if one throws', () => {
    let notify = null;
    const mux = new EventMultiplexer((cb) => {
      notify = cb;
      return () => {
        notify = null;
      };
    });

    const a = makeCallback();
    const boom = () => {
      boom.calls++;
      throw new SilentError('boom');
    };
    const b = makeCallback();

    boom.calls = 0;

    mux.add(a);
    mux.add(boom);
    mux.add(b);

    notify(1);
    assert(a.calls.length === 1);
    assert(boom.calls === 1);
    assert(b.calls.length === 1);
  });
});

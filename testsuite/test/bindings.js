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

import { Widget, WidgetComponent } from '../src/index.js';
import {
  interceptOption,
  observeOption,
  observeUseraction,
  DebounceBinding,
} from '../src/utils/binding.js';

import { assert, assertError, sleep } from './helpers.js';

describe('Bindings', () => {
  it('observe_option', () => {
    const o = new Widget();

    let called = false;

    const unsubscribe = observeOption(o, 'disabled', (value) => {
      if (value) called = true;
    });

    o.set('disabled', true);
    o.set('disabled', false);
    assert(called);
    unsubscribe();

    called = false;
    o.set('disabled', true);
    o.set('disabled', false);
    assert(!called);

    // unsubscribe again, this should be ok
    unsubscribe();
  });

  it('observe_useraction', () => {
    const o = new Widget();

    let called = false;

    const unsubscribe = observeUseraction(o, 'disabled', (value) => {
      called = true;
    });

    o.set('disabled', true);
    assert(!called);
    o.set('disabled', false);
    assert(!called);
    o.userset('disabled', true);
    assert(called);
    called = false;
    unsubscribe();

    o.userset('disabled', false);
    assert(!called);

    // unsubscribe again, this should be ok
    unsubscribe();
  });

  it('intercept_option', () => {
    const o = new Widget();

    let called = false;

    const unsubscribe = interceptOption(o, 'disabled', (value) => {
      called = true;
    });

    o.set('disabled', true);
    assert(!called);
    o.set('disabled', false);
    assert(!called);
    o.userset('disabled', true);
    assert(called);
    called = false;
    assert(!o.get('disabled'));
    unsubscribe();

    o.userset('disabled', true);
    assert(!called);
    assert(o.get('disabled'));

    // unsubscribe again, this should be ok
    unsubscribe();
  });
});
describe('DebounceBinding', () => {
  it('delay', async () => {
    const o = new Widget();
    const d = new DebounceBinding(o, 'disabled', 50);

    d.set(true);
    assert(o.get('disabled'));

    // user sets value to false
    o.userset('disabled', false);
    assert(d.isLocked());
    assert(!o.get('disabled'));
    // backend sets it to true
    d.set(true);
    assert(!o.get('disabled'));
    await sleep(100);
    assert(!d.isLocked());
    assert(o.get('disabled'));
  });

  it('delay repeated', async () => {
    const o = new Widget();
    const d = new DebounceBinding(o, 'disabled', 50);

    d.set(true);
    assert(o.get('disabled'));

    // user sets value to false
    o.userset('disabled', false);
    assert(d.isLocked());
    assert(!o.get('disabled'));
    // backend sets it to true
    d.set(true);

    for (let i = 0; i < 10; i++) {
      assert(!o.get('disabled'));
      // this should restart the timer
      o.userset('disabled', true);
      o.userset('disabled', false);
      assert(!o.get('disabled'));
      await sleep(10);
      d.set(false);
      await sleep(5);
      d.set(true);
    }

    await sleep(100);
    assert(!d.isLocked());
    assert(o.get('disabled'));
  });

  it('interacting', async () => {
    const o = new Widget();
    const d = new DebounceBinding(o, 'disabled', 50);

    o.startInteracting();
    assert(d.isLocked());
    d.set(true);
    assert(!o.get('disabled'));
    o.stopInteracting();
    assert(o.get('disabled'));

    o.userset('disabled', false);
    assert(d.isLocked());
    d.set(true);
    assert(!o.get('disabled'));

    await sleep(25);
    assert(!o.get('disabled'));
    o.startInteracting();
    await sleep(40);
    assert(d.isLocked());
    assert(!o.get('disabled'));
    o.stopInteracting();
    assert(!d.isLocked());
    assert(o.get('disabled'));

    o.userset('disabled', false);
    d.set(true);
    d.destroy();
    await sleep(75);
    assert(!o.get('disabled'));
  });
});

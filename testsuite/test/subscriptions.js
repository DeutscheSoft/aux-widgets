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
 
import { Subscription, Subscriptions } from '../src/utils/subscriptions.js';
import { assert } from './helpers.js';

describe('Subscriptions', () => {
  it('basics', () => {
    {
      let called = 0;

      const subs = new Subscriptions();

      subs.add(() => called++);

      assert(!subs.closed);
      subs.unsubscribe();
      assert(subs.closed);
      subs.unsubscribe();

      assert(called === 1);
    }

    {
      let called = 0;
      const subs1 = new Subscriptions();

      subs1.add(() => called++);

      const subs2 = new Subscriptions(subs1);

      subs1.add(() => called++);

      subs2.unsubscribe();

      assert(called === 2);
    }

    {
      let called = 0;
      const subs1 = new Subscriptions();

      subs1.add(() => called++);

      const subs2 = new Subscriptions();

      subs2.add(subs1);

      subs1.add(() => called++);

      subs2.unsubscribe();

      assert(called === 2);
    }
  });
});

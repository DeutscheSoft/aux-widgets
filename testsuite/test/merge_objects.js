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

import { mergeObjects } from '../src/utils/merge_objects.js';
import { assert, assertEqual, assertError } from './helpers.js';

describe('merge_objects', () => {
  it('mergeObjects()', async () => {
    assertError(() => mergeObjects());
    assertEqual({}, mergeObjects({}));

    const foo = { foo: 1 };
    const bar = { bar: 2 };
    const foobar = { ...foo, ...bar };
    assert(mergeObjects(null, foo) === foo);
    assert(mergeObjects(null, foo, null) === foo);
    assertEqual(mergeObjects(null, foo, null, bar, null), foobar);
    assert(mergeObjects(foo, foo, foo, foo, null) === foo);
    // check that objects which are shadowed by later arguments are ignored
    assert(mergeObjects({ ...foo }, null, foo, null) === foo);
  });
});

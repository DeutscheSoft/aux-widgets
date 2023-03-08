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

import { arrayDiff, forEachArrayDiff } from '../src/utils/array_diff.js';
import { assert, assertEqual } from './helpers.js';

function forEachArrayDiffSim(a, b, removedCb, addedCb) {
  const [removed, added] = arrayDiff(a, b);

  removed.forEach(removedCb);
  added.forEach(addedCb);
}

function arrayDiffSym(forEachDiff, a, b) {
  const removed = [],
    added = [];

  forEachDiff(
    a,
    b,
    (item) => removed.push(item),
    (item) => added.push(item)
  );

  return [removed, added];
}

function testDiffResult(a, b, removedExpected, addedExpected) {
  function testDiff(arrayDiff) {
    const [removed, added] = arrayDiff(a, b);
    assertEqual(removed, removedExpected);
    assertEqual(added, addedExpected);
  }

  testDiff(arrayDiff);
  testDiff((a, b) => arrayDiffSym(forEachArrayDiffSim, a, b));
  testDiff((a, b) => arrayDiffSym(forEachArrayDiff, a, b));
}

describe('array_diff', () => {
  it('arrayDiff()', (done) => {
    testDiffResult(null, [1], [], [1]);
    testDiffResult([1], null, [1], []);
    testDiffResult([1], [1], [], []);
    testDiffResult([1, 2, 3], [1, 3, 4], [2], [4]);
    testDiffResult([1, 1, 2, 3], [1, 2, 3], [], []);
    done();
  });
});

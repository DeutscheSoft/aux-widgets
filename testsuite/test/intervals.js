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

import { intersectIntervals } from '../../src/utils/intervals.js';
import {
  emptyIntervals,
  addInterval,
  copyIntervals,
  invertIntervals,
  diffIntervals,
} from '../src/utils/intervals.js';
import { assert, assertEqual } from './helpers.js';

const permutations = (arr) => {
  switch (arr.length) {
    case 0:
      return [];
    case 1:
      return [arr];
    case 2:
      return [arr, [arr[1], arr[0]]];
  }
  return arr.reduce(
    (acc, item, i) =>
      acc.concat(
        permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((val) => [
          item,
          ...val,
        ])
      ),
    []
  );
};

function testAddInterval(intervalsToAdd, expectedResult) {
  const addAll = (intervalsToAdd) => {
    const intervals = emptyIntervals();
    for (const [lhs, rhs] of intervalsToAdd) {
      addInterval(intervals, lhs, rhs);
    }
    return intervals;
  };

  permutations(intervalsToAdd).forEach((intervalsToAdd) => {
    const intervals = emptyIntervals();
    for (const [lhs, rhs] of intervalsToAdd) {
      addInterval(intervals, lhs, rhs);
    }
    assertEqual(intervals, expectedResult);
    {
      // Take all partitions of these two subsets and
      // calculate the union using diffIntervals
      for (let i = 0; i < intervalsToAdd.length; i++) {
        const a = addAll(intervalsToAdd.slice(0, i));
        const b = addAll(intervalsToAdd.slice(i));
        const union = copyIntervals(a);
        diffIntervals(
          a,
          b,
          (lhs, rhs) => {
            addInterval(union, lhs, rhs);
          },
          (lhs, rhs) => {}
        );
        assertEqual(union, expectedResult);
      }
    }
  });
}

function testDiffInterval(a, b, expectedUnion, expectedIntersection) {
  const union = copyIntervals(a);
  const intersection = intersectIntervals(a, b);

  assertEqual(intersection, expectedIntersection);
  diffIntervals(
    a,
    b,
    (lhs, rhs) => {
      addInterval(union, lhs, rhs);
    },
    (lhs, rhs) => {}
  );

  assertEqual(union, expectedUnion);
}

function testInvertInterval(intervalsToInvert, expectedResult, min, max) {
  {
    const tmp = copyIntervals(intervalsToInvert);
    invertIntervals(tmp, min, max);
    assertEqual(tmp, expectedResult);
  }

  {
    const tmp = copyIntervals(expectedResult);
    invertIntervals(tmp, min, max);
    assertEqual(tmp, intervalsToInvert);
  }

  {
    const tmp = copyIntervals(intervalsToInvert);
    invertIntervals(tmp, min, max);
    invertIntervals(tmp, min, max);
    assertEqual(tmp, intervalsToInvert);
  }
}

describe('intervals', () => {
  it('addInterval()', (done) => {
    assertEqual(emptyIntervals(), []);
    testAddInterval([[3, 4]], [3, 4]);
    testAddInterval(
      [
        [0, 5],
        [10, 20],
      ],
      [0, 5, 10, 20]
    );

    testAddInterval(
      [
        [0, 5],
        [1, 5],
        [40, 50],
      ],
      [0, 5, 40, 50]
    );

    // touching intervals are merged
    testAddInterval(
      [
        [0, 5],
        [5, 10],
        [10, 15],
      ],
      [0, 15]
    );

    // touching intervals are merged
    // aborbed
    testAddInterval(
      [
        [0, 5],
        [5, 10],
        [10, 15],
        [0, 14],
      ],
      [0, 15]
    );

    testAddInterval(
      [
        [1, 11],
        [2, 12],
        [3, 13],
        [4, 14],
      ],
      [1, 14]
    );

    done();
  });

  it('invertIntervals()', (done) => {
    testInvertInterval(emptyIntervals(), [0, 10], 0, 10);
    testInvertInterval([1, 5], [0, 0, 6, 10], 0, 10);
    testInvertInterval([1, 4, 6, 7], [0, 0, 5, 5, 8, 10], 0, 10);
    done();
  });

  it('diffIntervals()', (done) => {
    testDiffInterval(
      emptyIntervals(),
      emptyIntervals(),
      emptyIntervals(),
      emptyIntervals()
    );
    testDiffInterval([1, 2], emptyIntervals(), [1, 2], emptyIntervals());
    testDiffInterval([1, 2], [2, 3], [1, 3], [2, 2]);
    testDiffInterval([1, 12], [2, 3, 10, 14], [1, 14], [2, 3, 10, 12]);
    testDiffInterval(
      [1, 100],
      [2, 3, 10, 14, 20, 30],
      [1, 100],
      [2, 3, 10, 14, 20, 30]
    );
    done();
  });
});

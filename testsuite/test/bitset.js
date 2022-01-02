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
  createBitset, testBit, setBit, clearBit, createBitList, testBitList, setBitList,
  getFirstBit, getBitIndex, getLimbMask
} from '../src/scheduler/bitset.js';
import { assert, assertError, compare } from './helpers.js';

describe('bitset', () => {
  it('set, test and clear', () => {
    const N = 44;
    const set = createBitset(N); 

    for (let i = 0; i < N; i++) {
      assert(!testBit(set, i));
    }

    for (let i = 0; i < N; i++) {
      setBit(set, i);

      for (let j = 0; j < N; j++) {
        assert(testBit(set, j) === (i === j));
      }

      clearBit(set, i);
      assert(!testBit(set, i));
    }
  });
  it('createBitList', () => {
    const indices = [ 3, 5, 6, 7, 24, 33, 67 ];
    const list = createBitList(indices);
    const N = 71;

    const set = createBitset(N);

    assert(!testBitList(set, list));

    for (let i = 0; i < N; i++) {
      setBit(set, i); 
      assert(testBitList(set, list) === indices.includes(i));
      clearBit(set, i); 
    }

    setBitList(set, list);

    for (let i = 0; i < N; i++) {
      assert(testBit(set, i) === indices.includes(i));
    }

    indices.forEach((bit) => clearBit(set, bit));

    for (let i = 0; i < N; i++) {
      assert(!testBit(set, i));
    }
  });
  it('getFirstBit', () => {
    const N = 71;
    const set = createBitset(N);

    const indices = [ 3, 5, 6, 7, 24, 33, 67 ];
    const result = [];

    indices.forEach((bit) => setBit(set, bit));

    set.forEach((limb, index) => {
      while (limb !== 0) {
        const bit = getFirstBit(limb); 

        result.push(getBitIndex(index, bit));

        limb &= ~getLimbMask(bit);
      }
    });

    assert(compare(indices, result)); 
  });
});

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

/*
 * Bitset handling
 */
export const getFirstBit = Math.clz32;

export function getLimbMask(bit) {
  return 1 << (31 - (bit & 31));
}

export function getBitIndex(limbNumber, bit) {
  return (limbNumber << 5) + bit;
}

export function setBit(set, n) {
  const index = n >> 5;
  const mask = 1 << (31 - (n & 31));
  const tmp = set[index] | 0;
  set[index] = tmp | mask;
  return set;
}

export function createBitset(length) {
  length = (length + 31) >> 5;
  return new Array(length).fill(0);
}

export function testBit(set, n) {
  const index = n >> 5;
  const mask = 1 << (31 - (n & 31));
  const tmp = set[index] | 0;

  return (tmp & mask) !== 0;
}

export function clearBit(set, n) {
  const index = n >> 5;
  const mask = 1 << (31 - (n & 31));
  const tmp = set[index] | 0;
  set[index] = tmp & ~mask;
  return set;
}

export function createBitList(indices) {
  const set = [];
  for (let i = 0; i < indices.length; i++) {
    setBit(set, indices[i]);
  }

  const list = [];

  for (let i = 0; i < set.length; i++) {
    if (set[i]) list.push(i, set[i]);
  }

  return list;
}

export function testBitList(set, list) {
  for (let i = 0; i < list.length; i += 2) {
    const index = list[i];
    const mask = list[i + 1];

    if (set[index] & mask) return true;
  }

  return false;
}

export function setBitList(set, list) {
  for (let i = 0; i < list.length; i += 2) {
    const index = list[i];
    const mask = list[i + 1];

    set[index] = set[index] | mask;
  }
}

export function printBitMask(set) {
  return set.map((entry) => entry | 0).join(',');
}

import { arrayDiff } from '../../src/utils/array_diff.js';
import { suite } from '../suite.js';

function arrayDiffNaive(a, b) {
  return [
    (a || []).filter((item) => !b.includes(item)),
    (b || []).filter((item) => !a.includes(item)),
  ];
}

const a1 = new Array(10).fill(0).map((_, i) => i);
const a1_copy = a1.slice(0);

const b1 = a1.concat([21, 32, 42]);

export function define() {
  return [
    suite('arrayDiff#identical', {
      arrayDiff: () => {
        arrayDiff(a1, a1);
      },
      naive: () => {
        arrayDiffNaive(a1, a1);
      },
    }),
    suite('arrayDiff#same', {
      arrayDiff: () => {
        arrayDiff(a1, a1_copy);
      },
      naive: () => {
        arrayDiffNaive(a1, a1_copy);
      },
    }),
    suite('arrayDiff#append', {
      arrayDiff: () => {
        arrayDiff(a1, b1);
      },
      naive: () => {
        arrayDiffNaive(a1, b1);
      },
    }),
    suite('arrayDiff#removed', {
      arrayDiff: () => {
        arrayDiff(b1, a1);
      },
      naive: () => {
        arrayDiffNaive(b1, a1);
      },
    }),
    suite('arrayDiff#cleared', {
      arrayDiff: () => {
        arrayDiff(b1, []);
      },
      naive: () => {
        arrayDiffNaive(b1, []);
      },
    }),
    suite('arrayDiff#init', {
      arrayDiff: () => {
        arrayDiff([], b1);
      },
      naive: () => {
        arrayDiffNaive([], b1);
      },
    }),
  ];
}

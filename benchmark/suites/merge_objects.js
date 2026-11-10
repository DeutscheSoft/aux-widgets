import { mergeObjects } from '../../src/utils/merge_objects.js';
import { suite } from '../suite.js';

function mergeObjectsNaive(...args) {
  return Object.assign({}, ...args.filter((entry) => !!entry));
}

export function define() {
  const a = { a: 1, b: 2, c: 3, d: 4 };
  const same = { ...a };
  const empty = {};

  return [
    suite('mergeObjects#identical', {
      mergeObjects: () => {
        mergeObjects(a, a, a, null, a);
      },
      naive: () => {
        mergeObjectsNaive(a, a, a, null, a);
      },
    }),
    suite('mergeObjects#same', {
      mergeObjects: () => {
        mergeObjects(a, same);
      },
      naive: () => {
        mergeObjectsNaive(a, same);
      },
    }),
    suite('mergeObjects#appendEmpty', {
      mergeObjects: () => {
        mergeObjects(a, empty);
      },
      naive: () => {
        mergeObjectsNaive(a, empty);
      },
    }),
    suite('mergeObjects#appendToEmpty', {
      mergeObjects: () => {
        mergeObjects(empty, a);
      },
      naive: () => {
        mergeObjectsNaive(empty, a);
      },
    }),
  ];
}

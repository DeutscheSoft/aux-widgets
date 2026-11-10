import { compareObjects } from '../../src/utils/compare_objects.js';
import { suite } from '../suite.js';

function compareObjectsNaive(a, b) {
  return typeof a === 'object' && JSON.stringify(a) === JSON.stringify(b);
}

export function define() {
  const identical = { a: 1, b: 2, c: 3, d: 4 };
  const same = { ...identical };
  const empty = {};
  const different = { ...identical, b: 3 };

  return [
    suite('compareObjects#identical', {
      compareObjects: () => {
        compareObjects(identical, identical);
      },
      naive: () => {
        compareObjectsNaive(identical, identical);
      },
    }),
    suite('compareObjects#same', {
      compareObjects: () => {
        compareObjects(identical, same);
      },
      naive: () => {
        compareObjectsNaive(identical, same);
      },
    }),
    suite('compareObjects#with empty', {
      compareObjects: () => {
        compareObjects(identical, empty);
      },
      naive: () => {
        compareObjectsNaive(identical, empty);
      },
    }),
    suite('compareObjects#different', {
      compareObjects: () => {
        compareObjects(identical, different);
      },
      naive: () => {
        compareObjectsNaive(identical, different);
      },
    }),
  ];
}

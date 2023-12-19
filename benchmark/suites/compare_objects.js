import { compareObjects } from '../../src/utils/compare_objects.js';

function compareObjectsNaive(a, b) {
  return typeof a === 'object' && JSON.stringify(a) === JSON.stringify(b);
}

export function define(benchmark) {
  const suites = [];

  {
    const bench = benchmark.createSuite('compareObjects#identical');
    const a = { a: 1, b: 2, c: 3, d: 4 };

    bench.add('', () => {
      compareObjects(a, a);
    });
    bench.ref('ref', () => {
      compareObjectsNaive(a, a);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('compareObjects#same');
    const a = { a: 1, b: 2, c: 3, d: 4 };
    const b = { ...a };
    bench.add('', () => {
      compareObjects(a, b);
    });
    bench.ref('ref', () => {
      compareObjectsNaive(a, b);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('compareObjects#with empty');
    const a = { a: 1, b: 2, c: 3, d: 4 };
    const b = {};
    bench.add('', () => {
      compareObjects(a, b);
    });
    bench.ref('ref', () => {
      compareObjectsNaive(a, b);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('compareObjects#different');
    const a = { a: 1, b: 2, c: 3, d: 4 };
    const b = { ...a, b: 3 };
    bench.add('', () => {
      compareObjects(a, b);
    });
    bench.ref('ref', () => {
      compareObjectsNaive(a, b);
    });

    suites.push(bench);
  }

  return suites;
}

import { mergeObjects } from '../../src/utils/merge_objects.js';

function mergeObjectsNaive(...args) {
  return Object.assign({}, ...args.filter((entry) => !!entry));
}

export function define(benchmark) {
  const suites = [];

  {
    const bench = benchmark.createSuite('mergeObjects#identical');
    const a = { a: 1, b: 2, c: 3, d: 4 };

    bench.add('', () => {
      mergeObjects(a, a, a, null, a);
    });
    bench.ref('ref', () => {
      mergeObjectsNaive(a, a, a, null, a);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('mergeObjects#same');
    const a = { a: 1, b: 2, c: 3, d: 4 };
    const b = { ...a };
    bench.add('', () => {
      mergeObjects(a, b);
    });
    bench.ref('ref', () => {
      mergeObjectsNaive(a, b);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('mergeObjects#appendEmpty');
    const a = { a: 1, b: 2, c: 3, d: 4 };
    const b = {};
    bench.add('', () => {
      mergeObjects(a, b);
    });
    bench.ref('ref', () => {
      mergeObjectsNaive(a, b);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('mergeObjects#appendToEmpty');
    const a = { a: 1, b: 2, c: 3, d: 4 };
    const b = {};
    bench.add('', () => {
      mergeObjects(b, a);
    });
    bench.ref('ref', () => {
      mergeObjectsNaive(b, a);
    });

    suites.push(bench);
  }

  return suites;
}

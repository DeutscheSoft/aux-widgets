import { arrayDiff } from '../../src/utils/array_diff.js';

function arrayDiffNaive(a, b) {
  return [
    (a || []).filter((item) => !b.includes(item)),
    (b || []).filter((item) => !a.includes(item)),
  ];
}

const a1 = new Array(10).fill(0).map((_, i) => i);
const a1_copy = a1.slice(0);

const b1 = a1.concat([21, 32, 42]);

export function define(benchmark) {
  const suites = [];

  {
    const bench = benchmark.createSuite('arrayDiff#identical');

    bench.add('', () => {
      arrayDiff(a1, a1);
    });
    bench.ref('ref', () => {
      arrayDiffNaive(a1, a1);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('arrayDiff#same');
    bench.add('', () => {
      arrayDiff(a1, a1_copy);
    });
    bench.ref('ref', () => {
      arrayDiffNaive(a1, a1_copy);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('arrayDiff#append');
    bench.add('', () => {
      arrayDiff(a1, b1);
    });
    bench.ref('ref', () => {
      arrayDiffNaive(a1, b1);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('arrayDiff#removed');
    bench.add('', () => {
      arrayDiff(b1, a1);
    });
    bench.ref('ref', () => {
      arrayDiffNaive(b1, a1);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('arrayDiff#cleared');
    bench.add('', () => {
      arrayDiff(b1, []);
    });
    bench.ref('ref', () => {
      arrayDiffNaive(b1, []);
    });

    suites.push(bench);
  }

  {
    const bench = benchmark.createSuite('arrayDiff#init');
    bench.add('', () => {
      arrayDiff([], b1);
    });
    bench.ref('ref', () => {
      arrayDiffNaive([], b1);
    });

    suites.push(bench);
  }

  return suites;
}

import benchmarkify from 'benchmarkify';
import { arrayDiff } from '../src/utils/array_diff.js';

const fileNames = ['array_diff'];

async function run() {
  const suiteFactories = await Promise.all(
    fileNames.map(async (name) => {
      return (await import(`./suites/${name}.js`)).define;
    })
  );

  const benchmark = new benchmarkify('aux').printHeader();

  const suites = suiteFactories.map((define) => define(benchmark)).flat();

  await benchmark.run(suites);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

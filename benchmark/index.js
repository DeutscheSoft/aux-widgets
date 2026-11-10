const fileNames = ['array_diff', 'merge_objects', 'compare_objects'];

async function run() {
  const suiteFactories = await Promise.all(
    fileNames.map(async (name) => {
      return (await import(`./suites/${name}.js`)).define;
    })
  );

  const benches = suiteFactories.flatMap((define) => define());

  console.log(
    `aux  node ${process.version}  ${process.platform} ${process.arch}`
  );

  for (const bench of benches) {
    console.log(`\n${bench.name}`);
    bench.runSync();
    console.table(bench.table());
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { Bench } from 'tinybench';

export function suite(name, tasks) {
  const bench = new Bench({ name, time: 100, warmupTime: 25 });

  for (const [taskName, fn] of Object.entries(tasks)) bench.add(taskName, fn);

  return bench;
}

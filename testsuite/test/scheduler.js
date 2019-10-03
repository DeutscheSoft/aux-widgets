import { DOMScheduler } from '../src/index.js';

describe('DOMScheduler', () => {
  const S = new DOMScheduler();

  it('add()', (done) => {
    S.add(done);
  });
  it('remove()', (done) => {
    const cb = () => {
      done(new Error('should not run!'));
    };
    S.add(cb);
    S.remove(cb);
    S.add(done);
  });
});

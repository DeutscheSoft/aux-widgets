import { Timer } from '../src/index.js';

function expect_timeout(t, cb)
{
  return new Promise((resolve, reject) => {
    const now = performance.now();
    cb(() => {
       if (Math.abs(performance.now - now - t) > 5)
         reject(new Error("Bad Timeout"));
       resolve();
    });
  });
}

describe.only('Timers', () => {
  it('restart() with increasing time', () => {
     return expect_timeout(40, (cb) => {
       const t = new Timer(cb);
       t.restart(10);
       t.restart(20);
       t.restart(30);
       t.restart(40);
     });
  });
  it('restart() with decreasing time', () => {
     return expect_timeout(40, (cb) => {
       const t = new Timer(cb);
       t.restart(100);
       t.restart(80);
       t.restart(60);
       t.restart(40);
     });
  });
  it('restart() with both', () => {
     return expect_timeout(40, (cb) => {
       const t = new Timer(cb);
       t.restart(10);
       t.restart(20);
       t.restart(30);
       t.restart(40);
       t.restart(100);
       t.restart(80);
       t.restart(60);
       t.restart(40);
     });
  });
  it('stop()', (done) => {
     const t = new Timer(done);
     t.restart(40);
     setTimeout(() => {
        done();
        t.stop();
     }, 20);
  });
});

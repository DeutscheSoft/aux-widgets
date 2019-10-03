import { Base } from '../src/index.js';

describe('Events', () => {
  it('addEventListener()', (done) => {
    const o = new Base();
    o.addEventListener("foo", done);
    o.dispatchEvent("foo");
  });
  it('removeEventListener()', (done) => {
    const o = new Base();
    const cb = () => { done(new Error('fail.')); };
    o.addEventListener("foo", cb);
    o.removeEventListener("foo", cb);
    o.dispatchEvent("foo");
    done();
  });
  it('subscribe()', () => {
    const o = new Base();
    let called = false;
    const cb = () => {
      called = true;
    };
    const sub = o.subscribe("foo", cb);

    // check that subscription works
    o.dispatchEvent("foo");
    if (!called) throw new Error("not called");

    // check that unsubscribe works
    called = false;
    sub();
    o.dispatchEvent("foo");
    if (called) throw new Error("called");

    // check that unsubscribe can be called twice
    called = false;
    const sub2 = o.subscribe("foo", cb);
    sub();
    o.dispatchEvent("foo");
    if (!called) throw new Error("not called");
    sub2();
  });
  it('once()', () => {
    const o = new Base();
    let called = false;
    const cb = () => {
      called = true;
    };
    const sub = o.once("foo", cb);

    // check that subscription works
    o.dispatchEvent("foo");
    if (!called) throw new Error("not called");

    // check that unsubscribe works
    called = false;
    o.dispatchEvent("foo");
    if (called) throw new Error("called");

    // check that unsubscribe can be called twice
    called = false;
    const sub2 = o.once("foo", cb);
    sub2();
    o.dispatchEvent("foo");
    if (called) throw new Error("called");
  });
  it('reentrance', () => {
    {
      const o = new Base();
      let called = false;

      const cb = () => {
        called = true;
      };
      const cb2 = () => {
        o.off('foo', cb2);
      };

      o.on('foo', cb2);
      o.on('foo', cb);
      o.on('foo', cb2);

      o.emit('foo');

      if (!called) throw new Error('not called');
    }
    {
      const o = new Base();
      let called = false;

      const cb = () => {
        called = true;
      };
      const cb2 = () => {
        o.on('foo', cb);
      };

      o.on('foo', cb2);
      o.on('foo', cb2);

      o.emit('foo');

      if (called) throw new Error('called');
    }
  });
});


import { Base, Widget, WidgetComponent } from '../src/index.js';

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
});

describe('Options', () => {
  it('set()', (done) => {
    const o = new Widget();
    o.set("disabled", true);
    if (o.options.disabled !== true)
      throw new Error('fail.');
    if (!o.invalid.disabled)
      throw new Error('fail.');
    done();
  });
});

describe('Components', () => {
  it('setAttribute()', (done) => {
    const o = document.createElement('aux-widget');
    o.setAttribute("disabled", true);
    const widget = o.widget;
    if (widget.options.disabled !== true)
      throw new Error('fail: ' + widget.options.disabled);
    if (!widget.invalid.disabled)
      throw new Error('fail.');
    done();
  });
  it('addEventListener', (done) => {
    const o = document.createElement('aux-widget');
    
    o.addEventListener('set_disabled', (ev) => {
      done();
    });
    o.widget.set('disabled', true);
  });
  it('removeEventListener', (done) => {
    const o = document.createElement('aux-widget');
    const cb = (ev) => { done(new Error('fail.')); };

    o.addEventListener('set_disabled', cb);
    o.removeEventListener('set_disabled', cb);
    o.widget.set('disabled', true);
    done();
  });
  it('addEventListener on setAttribute does not trigger', (done) => {
    const o = document.createElement('aux-widget');
    
    o.addEventListener('set_disabled', (ev) => {
      done(new Error('failed.'));
    });
    o.setAttribute('disabled', 'true');
    done();
  });
});

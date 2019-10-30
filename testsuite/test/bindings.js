import { Widget, WidgetComponent } from '../src/index.js';
import { observe_option, observe_useraction, Debounce } from '../src/utils/binding.js';

import { assert, assert_error, sleep } from './helpers.js';

describe('observe_option', () => {
  it('basics', (done) => {
    const o = new Widget();

    let called = false;

    const unsubscribe = observe_option(o, 'disabled', (value) => {
      if (value) called = true;
    });

    o.set('disabled', true);
    o.set('disabled', false);
    assert(called);
    unsubscribe();

    called = false;
    o.set('disabled', true);
    o.set('disabled', false);
    assert(!called);

    // unsubscribe again, this should be ok
    unsubscribe();

    done();
  });
});

describe('observe_useraction', () => {
  it('basics', (done) => {
    const o = new Widget();

    let called = false;

    const unsubscribe = observe_useraction(o, 'disabled', (value) => {
      called = true;
    });

    o.set('disabled', true);
    assert(!called);
    o.set('disabled', false);
    assert(!called);
    o.userset('disabled', true);
    assert(called); called = false;
    unsubscribe();

    o.userset('disabled', false);
    assert(!called);

    // unsubscribe again, this should be ok
    unsubscribe();

    done();
  });
});
describe('Debounce', () => {
  it('delay', async () => {
    const o = new Widget();
    const d = new Debounce(o, 'disabled', 50);

    d.set(true);
    assert(o.get('disabled'));

    // user sets value to false
    o.userset('disabled', false);
    assert(d.isLocked());
    assert(!o.get('disabled'));
    // backend sets it to true
    d.set(true);
    assert(!o.get('disabled'));
    await sleep(100);
    assert(!d.isLocked());
    assert(o.get('disabled'));
  });

  it('delay repeated', async () => {
    const o = new Widget();
    const d = new Debounce(o, 'disabled', 50);

    d.set(true);
    assert(o.get('disabled'));

    // user sets value to false
    o.userset('disabled', false);
    assert(d.isLocked());
    assert(!o.get('disabled'));
    // backend sets it to true
    d.set(true);

    for (let i = 0; i < 10; i++)
    {
      assert(!o.get('disabled'));
      // this should restart the timer
      o.userset('disabled', true);
      o.userset('disabled', false);
      assert(!o.get('disabled'));
      await sleep(10);
      d.set(false);
      await sleep(5);
      d.set(true);
    }

    await sleep(100);
    assert(!d.isLocked());
    assert(o.get('disabled'));
  });

  it('interacting', async () => {
    const o = new Widget();
    const d = new Debounce(o, 'disabled', 50);

    o.startInteracting();
    assert(d.isLocked());
    d.set(true);
    assert(!o.get('disabled'));
    o.stopInteracting();
    assert(o.get('disabled'));

    o.userset('disabled', false);
    assert(d.isLocked());
    d.set(true);
    assert(!o.get('disabled'));

    await sleep(25);
    assert(!o.get('disabled'));
    o.startInteracting();
    await sleep(40);
    assert(d.isLocked());
    assert(!o.get('disabled'));
    o.stopInteracting();
    assert(!d.isLocked());
    assert(o.get('disabled'));

    o.userset('disabled', false);
    d.set(true);
    d.destroy();
    await sleep(75);
    assert(!o.get('disabled'));
    
  });
});


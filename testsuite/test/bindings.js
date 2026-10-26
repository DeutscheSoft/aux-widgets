/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { Widget } from '../../src/index.js';
import {
  interceptOption,
  observeOption,
  observeUseraction,
  InteractionSuppress,
} from '../../src/utils/binding.js';

import { assert, assertError, sleep } from './utils/helpers.js';

function applyUpdate(widget, name) {
  return (value) => widget.update(name, value);
}

function makeSource(initial) {
  const subscribers = [];
  let value = initial;
  const sent = [];

  return {
    sent,
    get value() {
      return value;
    },
    subscribe(cb) {
      subscribers.push(cb);
      return () => {
        const i = subscribers.indexOf(cb);
        if (i !== -1) subscribers.splice(i, 1);
      };
    },
    set(v) {
      sent.push(v);
    },
    push(v) {
      value = v;
      subscribers.slice().forEach((cb) => cb(v));
    },
  };
}

describe('Bindings', () => {
  it('observe_option', () => {
    const o = new Widget();

    let called = false;

    const unsubscribe = observeOption(o, 'disabled', (value) => {
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
  });

  it('observe_option replay false', () => {
    const o = new Widget();
    const values = [];

    const unsubscribe = observeOption(
      o,
      'disabled',
      (value) => {
        values.push(value);
      },
      false
    );

    assert(values.length === 0);
    o.set('disabled', true);
    assert(values.length === 1);
    assert(values[0] === true);
    unsubscribe();
  });

  it('observe_option replay true by default', () => {
    const o = new Widget();
    o.set('disabled', true);
    const values = [];

    const unsubscribe = observeOption(o, 'disabled', (value) => {
      values.push(value);
    });

    assert(values.length === 1);
    assert(values[0] === true);
    unsubscribe();
  });

  it('observe_useraction', () => {
    const o = new Widget();

    let called = false;

    const unsubscribe = observeUseraction(o, 'disabled', (value) => {
      called = true;
    });

    o.set('disabled', true);
    assert(!called);
    o.set('disabled', false);
    assert(!called);
    o.userset('disabled', true);
    assert(called);
    called = false;
    unsubscribe();

    o.userset('disabled', false);
    assert(!called);

    // unsubscribe again, this should be ok
    unsubscribe();
  });

  it('intercept_option', () => {
    const o = new Widget();

    let called = false;

    const unsubscribe = interceptOption(o, 'disabled', (value) => {
      called = true;
    });

    o.set('disabled', true);
    assert(!called);
    o.set('disabled', false);
    assert(!called);
    o.userset('disabled', true);
    assert(called);
    called = false;
    assert(!o.get('disabled'));
    unsubscribe();

    o.userset('disabled', true);
    assert(!called);
    assert(o.get('disabled'));

    // unsubscribe again, this should be ok
    unsubscribe();
  });
});

describe('InteractionSuppress', () => {
  it('applies immediately when not interacting', () => {
    const o = new Widget();
    const d = new InteractionSuppress(o, applyUpdate(o, 'disabled'), 50);

    d.set(true);
    assert(o.get('disabled'));
    d.destroy();
  });

  it('suppresses while interacting and applies after grace', async () => {
    const o = new Widget();
    const d = new InteractionSuppress(o, applyUpdate(o, 'disabled'), 50);

    o.startInteracting();
    assert(d.isLocked());
    d.set(true);
    assert(!o.get('disabled'));

    o.stopInteracting();
    assert(d.isLocked());
    assert(!o.get('disabled'));

    await sleep(25);
    assert(!o.get('disabled'));
    assert(d.isLocked());

    await sleep(40);
    assert(!d.isLocked());
    assert(o.get('disabled'));
    d.destroy();
  });

  it('restarts grace when interaction resumes', async () => {
    const o = new Widget();
    const d = new InteractionSuppress(o, applyUpdate(o, 'disabled'), 50);

    o.startInteracting();
    d.set(true);
    o.stopInteracting();
    await sleep(25);
    assert(!o.get('disabled'));

    o.startInteracting();
    assert(d.isLocked());
    o.stopInteracting();
    await sleep(25);
    assert(!o.get('disabled'));
    await sleep(40);
    assert(o.get('disabled'));
    d.destroy();
  });

  it('calls apply with the pending value', () => {
    const o = new Widget();
    const values = [];
    const d = new InteractionSuppress(o, (v) => values.push(v), 0);

    d.set(true);
    assert(values.length === 1);
    assert(values[0] === true);
    d.destroy();
  });

  it('requires apply', () => {
    const o = new Widget();
    assertError(() => new InteractionSuppress(o));
  });

  it('destroy discards pending value', async () => {
    const o = new Widget();
    const d = new InteractionSuppress(o, applyUpdate(o, 'disabled'), 50);

    o.startInteracting();
    d.set(true);
    d.destroy();
    o.stopInteracting();
    await sleep(75);
    assert(!o.get('disabled'));
  });
});

describe('Base.bind', () => {
  it('receive from subscribe', () => {
    const o = new Widget();
    const src = makeSource();
    const unbind = o.bind('disabled', src, { send: false });

    src.push(true);
    assert(o.get('disabled') === true);
    unbind();
    src.push(false);
    assert(o.get('disabled') === true);
  });

  it('send on useraction by default', () => {
    const o = new Widget();
    const src = makeSource();
    const unbind = o.bind('disabled', { set: (v) => src.set(v) });

    o.set('disabled', true);
    assert(src.sent.length === 0);
    o.userset('disabled', false);
    assert(src.sent.length === 1);
    assert(src.sent[0] === false);
    unbind();
  });

  it('send on set event', () => {
    const o = new Widget();
    const src = makeSource();
    const unbind = o.bind(
      'disabled',
      { set: (v) => src.set(v) },
      { event: 'set' }
    );

    o.set('disabled', true);
    assert(src.sent.length === 1);
    assert(src.sent[0] === true);
    unbind();
  });

  it('event set does not replay current value on install', () => {
    const o = new Widget();
    o.set('disabled', true);
    const src = makeSource();
    const unbind = o.bind(
      'disabled',
      { set: (v) => src.set(v) },
      { event: 'set' }
    );

    assert(src.sent.length === 0);
    unbind();
  });

  it('send on userset intercepts', () => {
    const o = new Widget();
    const src = makeSource();
    const unbind = o.bind(
      'disabled',
      { set: (v) => src.set(v) },
      { event: 'userset' }
    );

    o.userset('disabled', true);
    assert(src.sent.length === 1);
    assert(src.sent[0] === true);
    assert(o.get('disabled') === false);
    unbind();
  });

  it('receive false / send false', () => {
    const o = new Widget();
    const src = makeSource();

    const unbind1 = o.bind('disabled', src, { receive: false });
    src.push(true);
    assert(o.get('disabled') === false);
    o.userset('disabled', true);
    assert(src.sent.length === 1);
    unbind1();

    const src2 = makeSource();
    const unbind2 = o.bind('disabled', src2, { send: false });
    o.userset('disabled', false);
    assert(src2.sent.length === 0);
    src2.push(true);
    assert(o.get('disabled') === true);
    unbind2();
  });

  it('omit subscribe or set for one-way', () => {
    const o = new Widget();
    const sent = [];

    const unbind1 = o.bind('disabled', {
      set: (v) => sent.push(v),
    });
    o.userset('disabled', true);
    assert(sent[0] === true);
    unbind1();

    const unbind2 = o.bind('disabled', {
      subscribe: (cb) => {
        cb(false);
        return () => {};
      },
    });
    assert(o.get('disabled') === false);
    unbind2();
  });

  it('update true skips equal values', () => {
    const o = new Widget();
    let sets = 0;
    o.subscribe('set_disabled', () => {
      sets++;
    });

    const src = makeSource();
    const unbind = o.bind('disabled', src, { send: false });
    src.push(false);
    assert(sets === 0);
    src.push(true);
    assert(sets === 1);
    src.push(true);
    assert(sets === 1);
    unbind();
  });

  it('update false always sets', () => {
    const o = new Widget();
    let sets = 0;
    o.subscribe('set_disabled', () => {
      sets++;
    });

    const src = makeSource();
    const unbind = o.bind('disabled', src, { send: false, update: false });
    src.push(false);
    assert(sets === 1);
    unbind();
  });

  it('suppressWhileInteracting with timeout', async () => {
    const o = new Widget();
    const src = makeSource();
    const unbind = o.bind('disabled', src, {
      send: false,
      suppressWhileInteracting: true,
      suppressTimeout: 50,
    });

    o.startInteracting();
    src.push(true);
    assert(o.get('disabled') === false);
    o.stopInteracting();
    assert(o.get('disabled') === false);
    await sleep(25);
    assert(o.get('disabled') === false);
    await sleep(40);
    assert(o.get('disabled') === true);
    unbind();
  });

  it('suppressWhileInteracting ignored without interacting option', () => {
    // Base has no interacting; use a plain object that looks enough like Base
    // for bindOption's option check — Widget always has interacting, so strip it.
    const o = new Widget();
    const original = o.getOptionType.bind(o);
    o.getOptionType = (name) =>
      name === 'interacting' ? void 0 : original(name);

    const src = makeSource();
    const unbind = o.bind('disabled', src, {
      send: false,
      suppressWhileInteracting: true,
      suppressTimeout: 50,
    });

    o.startInteracting();
    src.push(true);
    // Applied immediately — suppress disabled
    assert(o.get('disabled') === true);
    unbind();
  });

  it('loop guard breaks full cycles (AWML connect style)', () => {
    const o = new Widget();
    const sent = [];
    const subscribers = [];
    const source = {
      subscribe(cb) {
        subscribers.push(cb);
        return () => {
          const i = subscribers.indexOf(cb);
          if (i !== -1) subscribers.splice(i, 1);
        };
      },
      set(v) {
        sent.push(v);
        // echo to subscribers (expected for local DynamicValue-like sources)
        subscribers.slice().forEach((cb) => cb(v));
      },
    };

    const unbind = o.bind('disabled', source, { event: 'set' });
    o.set('disabled', true);
    assert(sent.length === 1);
    assert(sent[0] === true);
    assert(o.get('disabled') === true);

    // receive → may hop once to source.set, but must not loop
    sent.length = 0;
    subscribers.slice().forEach((cb) => cb(false));
    assert(o.get('disabled') === false);
    assert(sent.length === 1);
    assert(sent[0] === false);
    unbind();
  });

  it('source set echo may apply (transformed) value', () => {
    const o = new Widget();
    const subscribers = [];
    const source = {
      subscribe(cb) {
        subscribers.push(cb);
        return () => {
          const i = subscribers.indexOf(cb);
          if (i !== -1) subscribers.splice(i, 1);
        };
      },
      set(v) {
        // echo a different value (e.g. quantized / transformed)
        subscribers.slice().forEach((cb) => cb(true));
        void v;
      },
    };

    const unbind = o.bind('disabled', source, {
      event: 'set',
      update: false,
    });
    o.set('disabled', false);
    // send false → source echoes true → apply allowed (one nested hop)
    assert(o.get('disabled') === true);
    unbind();
  });

  it('loop guard with suppressWhileInteracting', async () => {
    const o = new Widget();
    const sent = [];
    const subscribers = [];
    const source = {
      subscribe(cb) {
        subscribers.push(cb);
        return () => {
          const i = subscribers.indexOf(cb);
          if (i !== -1) subscribers.splice(i, 1);
        };
      },
      set(v) {
        sent.push(v);
        subscribers.slice().forEach((cb) => cb(v));
      },
    };

    const unbind = o.bind('disabled', source, {
      event: 'set',
      suppressWhileInteracting: true,
      suppressTimeout: 50,
    });

    o.startInteracting();
    subscribers.slice().forEach((cb) => cb(true));
    assert(o.get('disabled') === false);
    assert(sent.length === 0);

    o.stopInteracting();
    await sleep(75);
    assert(o.get('disabled') === true);
    // one hop to source.set is allowed; must not loop further
    assert(sent.length === 1);
    assert(sent[0] === true);
    unbind();
  });

  it('requires at least one direction', () => {
    const o = new Widget();
    assertError(() => {
      o.bind('disabled', {});
    });
    assertError(() => {
      o.bind('disabled', {
        subscribe: () => () => {},
        set: () => {},
      }, { receive: false, send: false });
    });
  });

  it('unbind is idempotent', () => {
    const o = new Widget();
    const src = makeSource();
    const unbind = o.bind('disabled', src);
    unbind();
    unbind();
    src.push(true);
    assert(o.get('disabled') === false);
  });
});

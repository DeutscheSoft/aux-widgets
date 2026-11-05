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
  WidgetBindings,
  compareBinding,
} from '../../src/utils/widget_bindings.js';
import { assert } from './utils/helpers.js';

function makeSource(initial) {
  const subscribers = [];
  let value = initial;

  return {
    get value() {
      return value;
    },
    subscribe(cb) {
      subscribers.push(cb);
      if (value !== void 0) cb(value);
      return () => {
        const i = subscribers.indexOf(cb);
        if (i !== -1) subscribers.splice(i, 1);
      };
    },
    set(v) {
      value = v;
      subscribers.slice().forEach((cb) => cb(v));
    },
    push(v) {
      value = v;
      subscribers.slice().forEach((cb) => cb(v));
    },
    get subscriberCount() {
      return subscribers.length;
    },
  };
}

describe('compareBinding', () => {
  it('compares name, source identity, and options', () => {
    const src = makeSource(1);
    const a = { name: 'disabled', source: src, send: false };
    assert(compareBinding(a, a));
    assert(compareBinding(a, { name: 'disabled', source: src, send: false }));
    assert(!compareBinding(a, { name: 'disabled', source: src, send: true }));
    assert(!compareBinding(a, { name: 'disabled', source: makeSource(1) }));
    assert(
      !compareBinding(a, { name: 'interacting', source: src, send: false })
    );
  });
});

describe('WidgetBindings', () => {
  it('installs object bindings', () => {
    const widget = new Widget();
    const src = makeSource(false);
    const bindings = new WidgetBindings(widget);

    bindings.update({ name: 'disabled', source: src, send: false });
    assert(widget.get('disabled') === false);

    src.push(true);
    assert(widget.get('disabled') === true);

    bindings.dispose();
    src.push(false);
    assert(widget.get('disabled') === true);
    assert(src.subscriberCount === 0);
  });

  it('keeps unchanged slots across update (React-style new objects)', () => {
    const widget = new Widget();
    const srcA = makeSource(false);
    const srcB = makeSource(false);
    const bindings = new WidgetBindings(widget);

    bindings.update([
      { name: 'disabled', source: srcA, send: false },
      { name: 'interacting', source: srcB, send: false },
    ]);
    assert(srcA.subscriberCount === 1);
    assert(srcB.subscriberCount === 1);

    bindings.update([
      { name: 'disabled', source: srcA, send: false },
      { name: 'interacting', source: srcB, send: false },
    ]);
    assert(srcA.subscriberCount === 1);
    assert(srcB.subscriberCount === 1);

    bindings.dispose();
  });

  it('replaces when source changes at an index', () => {
    const widget = new Widget();
    const srcA = makeSource(false);
    const srcB = makeSource(true);
    const bindings = new WidgetBindings(widget);

    bindings.update({ name: 'disabled', source: srcA, send: false });
    assert(widget.get('disabled') === false);
    assert(srcA.subscriberCount === 1);

    bindings.update({ name: 'disabled', source: srcB, send: false });
    assert(widget.get('disabled') === true);
    assert(srcA.subscriberCount === 0);
    assert(srcB.subscriberCount === 1);

    bindings.dispose();
  });

  it('replaces when options change at an index', () => {
    const widget = new Widget();
    const src = makeSource(false);
    const bindings = new WidgetBindings(widget);

    bindings.update({ name: 'disabled', source: src, send: false });
    assert(src.subscriberCount === 1);

    bindings.update({
      name: 'disabled',
      source: src,
      send: false,
      update: false,
    });
    assert(src.subscriberCount === 1);

    bindings.dispose();
    assert(src.subscriberCount === 0);
  });

  it('allows multiple bindings for the same name', () => {
    const widget = new Widget();
    const srcA = makeSource(false);
    const srcB = makeSource(true);
    const bindings = new WidgetBindings(widget);

    bindings.update([
      { name: 'disabled', source: srcA, send: false },
      { name: 'disabled', source: srcB, send: false },
    ]);

    assert(srcA.subscriberCount === 1);
    assert(srcB.subscriberCount === 1);
    // last receive wins on the widget option
    assert(widget.get('disabled') === true);

    bindings.update([
      { name: 'disabled', source: srcA, send: false },
      { name: 'disabled', source: srcB, send: false },
    ]);
    assert(srcA.subscriberCount === 1);
    assert(srcB.subscriberCount === 1);

    bindings.dispose();
    assert(srcA.subscriberCount === 0);
    assert(srcB.subscriberCount === 0);
  });

  it('shrinks and grows the list by index', () => {
    const widget = new Widget();
    const srcA = makeSource(false);
    const srcB = makeSource(false);
    const bindings = new WidgetBindings(widget);
    const a = { name: 'disabled', source: srcA, send: false };
    const b = { name: 'interacting', source: srcB, send: false };

    bindings.update([a, b]);
    bindings.update([a]);
    assert(srcA.subscriberCount === 1);
    assert(srcB.subscriberCount === 0);

    bindings.update([a, b]);
    assert(srcA.subscriberCount === 1);
    assert(srcB.subscriberCount === 1);

    bindings.dispose();
  });

  it('update(null) clears all', () => {
    const widget = new Widget();
    const src = makeSource(false);
    const bindings = new WidgetBindings(widget);

    bindings.update({ name: 'disabled', source: src, send: false });
    bindings.update(null);
    assert(src.subscriberCount === 0);
  });

  it('falsy source installs a no-op slot', () => {
    const widget = new Widget();
    const src = makeSource(true);
    const bindings = new WidgetBindings(widget);

    bindings.update({ name: 'disabled', source: null, send: false });
    assert(widget.get('disabled') === false);

    bindings.update({ name: 'disabled', source: src, send: false });
    assert(widget.get('disabled') === true);
    assert(src.subscriberCount === 1);

    bindings.update({ name: 'disabled', source: undefined, send: false });
    assert(src.subscriberCount === 0);

    bindings.dispose();
  });
});

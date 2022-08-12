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

import { Widget, WidgetComponent } from '../src/index.js';

import { assert, assertError } from './helpers.js';

describe('Options', () => {
  it('set()', (done) => {
    const o = new Widget();
    o.set('disabled', true);
    if (o.options.disabled !== true) throw new Error('fail.');
    done();
  });
});

describe('Components', () => {
  it('setAttribute()', () => {
    const o = document.createElement('aux-widget');
    o.setAttribute('disabled', true);
    const widget = o.auxWidget;
    if (widget.options.disabled !== true)
      throw new Error('fail: ' + widget.options.disabled);
  });
  it('removeAttribute()', () => {
    const o = document.createElement('aux-widget');
    const widget = o.auxWidget;

    o.setAttribute('disabled', true);
    assert(widget.get('disabled'));
    o.removeAttribute('disabled');
    assert(!widget.get('disabled'));
  });
  it('properties', () => {
    const o = document.createElement('aux-widget');
    assert(o.disabled === false);
    o.disabled = true;
    assert(o.disabled);
  });
  it('removeAttribute()', () => {
    const o = document.createElement('aux-widget');
    const widget = o.auxWidget;

    o.setAttribute('disabled', true);
    assert(widget.get('disabled'));
    o.removeAttribute('disabled');
    assert(!widget.get('disabled'));
  });
  it('addEventListener', (done) => {
    const o = document.createElement('aux-widget');
    o.addEventListener('set_disabled', (ev) => {
      done();
    });
    o.auxWidget.set('disabled', true);
  });
  it('removeEventListener', (done) => {
    const o = document.createElement('aux-widget');
    const cb = (ev) => {
      done(new Error('fail.'));
    };

    o.addEventListener('set_disabled', cb);
    o.removeEventListener('set_disabled', cb);
    o.auxWidget.set('disabled', true);
    done();
  });
  it('getOptionType()', () => {
    const o = new Widget();

    if (o.getOptionType('disabled') !== 'boolean')
      throw new Error('bad type for disabled');
  });
  it('getDefault()', () => {
    const o = new Widget();

    if (o.getDefault('disabled') !== false)
      throw new Error('bad default value for disabled');

    {
      let ok = false;
      try {
        o.getDefault('this_option_does_not_exist');
      } catch (e) {
        ok = true;
      }

      if (!ok) throw new Error('Expected error for unknown option');
    }
  });
  it('child handling', () => {
    {
      const w1 = new Widget();
      const w2 = new Widget();
      const c1 = new Widget();
      const c2 = new Widget();
      w1.addChild(c1);
      w2.addChild(c2);

      assert(w1.hasChild(c1), 'addChild failed.');

      w2.addChild(c1);

      assert(!w1.hasChild(c1), 'addChild failed.');
      assert(w2.hasChild(c1), 'addChild failed.');

      c1.setParent();

      assert(!w2.hasChild(c1), 'setParent failed.');

      assertError(() => w2.removeChild(c1));

      w1.destroy();
      w2.destroy();
      c1.destroy();
      c2.destroy();
    }

    {
      const w = new Widget({ element: document.createElement('div') });
      const c = new Widget({ element: document.createElement('div') });

      assert(w.isDrawn() === c.isDrawn());
      w.addChild(c);
      assert(w.isDrawn() === c.isDrawn());
      w.show();
      assert(w.isDrawn() && w.isDrawn() === c.isDrawn());
      w.forceHide();
      w.disableDraw();
      assert(!w.isDrawn() && w.isDrawn() === c.isDrawn());

      w.destroy();
      c.destroy();
    }

    {
      const w = new Widget({ element: document.createElement('div') });
      const c = new Widget({ element: document.createElement('div') });

      w.addChild(c);

      w.setParent(null);

      assert(w.isDrawn() === c.isDrawn());
      assert(w.isDrawn() !== document.hidden);

      w.destroy();
      c.destroy();
    }
  });
  it('dom event cleanup', () => {
      const w = new Widget({ element: document.createElement('div') });
      const element = w.element;

      w.on('click', (ev) => {});
      w.destroy();

      document.body.appendChild(element);

      // should not generate an error
      element.dispatchEvent(new CustomEvent('click'));
  });
});

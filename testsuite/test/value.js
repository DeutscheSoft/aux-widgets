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

import { Value } from '../../src/index.js';
import { assert, assertEqual, waitForDrawn } from './utils/helpers.js';

describe('Value', () => {
  it('parses numbers by default', () => {
    const widget = new Value();

    assertEqual(widget.get('mode'), 'number');
    assertEqual(widget.get('value'), 0);
    assertEqual(widget.options.set.call(widget, '3.5'), 3.5);
    assertEqual(widget.options.set.call(widget, 'foo'), 0);
    assertEqual(widget.options.format.call(widget, 2), '2');
    assertEqual(widget.options.format.call(widget, null), '0');
    assertEqual(widget.options.format.call(widget, undefined), '0');
  });

  it('keeps text in string mode', async () => {
    const widget = new Value({ mode: 'string', value: null });

    assertEqual(widget.get('value'), null);
    assertEqual(widget.options.set.call(widget, 'hello'), 'hello');
    assertEqual(widget.options.format.call(widget, null), '');
    assertEqual(widget.options.format.call(widget, undefined), '');
    assertEqual(widget.options.format.call(widget, 1), '1');

    await waitForDrawn(widget);
    assertEqual(widget._input.value, '');
  });

  it('leaves the initial value untouched in string mode', () => {
    const widget = new Value({ mode: 'string' });

    assertEqual(widget.get('value'), 0);
    assertEqual(widget.options.format.call(widget, widget.get('value')), '0');
  });

  it('keeps an explicit value in string mode', () => {
    const widget = new Value({ mode: 'string', value: 0 });

    assertEqual(widget.get('value'), 0);
    assertEqual(widget.options.format.call(widget, 0), '0');
  });

  it('does not replace format or set when mode changes', async () => {
    const format = (v) => v + ' dB';
    const set = (v) => v;
    const widget = new Value({ format, set, value: 1 });

    widget.set('mode', 'string');

    assert(widget.get('format') === format);
    assert(widget.get('set') === set);
    assertEqual(widget.get('value'), 1);
    assertEqual(widget.options.set.call(widget, 'x'), 'x');
    assertEqual(widget.options.format(1), '1 dB');

    await waitForDrawn(widget);
    assertEqual(widget._input.value, '1 dB');
  });

  it('switches the default parser when mode changes', () => {
    const widget = new Value({ value: 4 });
    const set = widget.get('set');
    const format = widget.get('format');

    widget.set('mode', 'string');

    assert(widget.get('set') === set);
    assert(widget.get('format') === format);
    assertEqual(widget.get('value'), 4);
    assertEqual(widget.options.set.call(widget, 'ab'), 'ab');
    assertEqual(widget.options.format.call(widget, 4), '4');
  });
});

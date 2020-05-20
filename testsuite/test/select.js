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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { SelectComponent, SelectEntryComponent, Select } from '../src/index.js';

import { assert, waitForEvent } from './helpers.js';

describe('Select', () => {
  function checkSelect(widget) {
    assert(widget.currentValue() === false);
    widget.set('selected', 0);
    assert(widget.currentValue() == 42);
    widget.set('selected', 1);
    assert(widget.currentValue() == 23);
    widget.addEntry({ value: 'foo', label: 'bar' });
    assert(widget.get('selected') === 1);
    assert(widget.currentValue() === 23);
  }

  it('appending entries', () => {
    const widget = new Select({
      entries: [
        {
          value: 42,
          label: 'the answer',
        },
      ],
    });

    // nothing selected
    assert(widget.currentValue() === false);

    widget.addEntry({ value: 23, label: 'the other answer' });

    checkSelect(widget);
  });

  function makeEntryComponent(value, label) {
    const entry_component = document.createElement('aux-select-entry');
    entry_component.value = value;
    entry_component.label = label;
    return entry_component;
  }

  it('append component children', async () => {
    const select = document.createElement('aux-select');
    const widget = select.auxWidget;

    const entry42 = makeEntryComponent(42, 'the answer');
    const entry23 = makeEntryComponent(23, 'the other answer');
    const entry0 = makeEntryComponent(0, 'hello');

    select.appendChild(entry42);

    document.body.appendChild(select);

    await waitForEvent(widget, 'redraw');

    assert(widget.currentValue() === false);

    select.appendChild(entry23);

    checkSelect(widget);

    select.insertBefore(entry0, select.firstChild);

    widget.set('selected', 0);
    assert(widget.currentValue() === 0);

    select.insertBefore(entry23, entry42);
    widget.set('selected', 1);
    assert(widget.currentValue() === 23);

    select.remove();
    widget.destroy();
  });
});

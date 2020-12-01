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

import { SelectComponent, SelectEntryComponent, Select } from '../src/index.js';

import { assert, waitForEvent } from './helpers.js';

describe('Select', () => {
  const checkSelected = function(widget, entry) {
    if (!entry) {
      assert(widget.currentValue() === undefined);
      assert(widget.currentIndex() === -1);
      assert(widget.current() === null);
    } else {
      assert(widget.currentValue() === entry.get('value'));
      assert(widget.currentIndex() === widget.indexByEntry(entry));
      assert(widget.current() === entry);
    }
  }

  const makeEntries = function(...values) {
    return values.map((v) => {
      return {
        value: v,
        label: v.toString(),
      };
    });
  }

  const makeSelect = function(...values) {
    return new Select({
      entries: makeEntries(...values),
    });
  };

  const checkSelect = function(widget) {
    assert(widget.currentValue() === undefined);
    widget.set('selected', 0);
    checkSelected(widget, widget.entryByIndex(0));
    widget.set('selected', 1);
    checkSelected(widget, widget.entryByIndex(1));
    const entry = widget.addEntry({ value: 'foo', label: 'bar' });
    checkSelected(widget, widget.entryByIndex(1));
    widget.removeEntry(entry);
  }

  it('appending entries', () => {
    const widget = makeSelect(42);

    // nothing selected
    checkSelected(widget, null);

    widget.addEntry({ value: 23, label: '23' });

    checkSelect(widget);
  });

  function makeEntryComponent(value, label) {
    const entry_component = document.createElement('aux-select-entry');
    entry_component.value = value;
    entry_component.label = label ? label : value.toString();
    return entry_component;
  }

  it('append component children', async () => {
    const select = document.createElement('aux-select');
    const widget = select.auxWidget;

    const entry42 = makeEntryComponent(42);
    const entry23 = makeEntryComponent(23);
    const entry0 = makeEntryComponent(0);

    select.appendChild(entry42);

    document.body.appendChild(select);

    await waitForEvent(widget, 'redraw');

    checkSelected(widget, null);

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

  it('remove selected entry', async () => {
    const widget = makeSelect(42, 23);
    checkSelected(widget, null);
    widget.select(0);
    checkSelected(widget, widget.entries[0]);
    widget.removeIndex(0);
    checkSelected(widget, null);
  });

  it('remove entry before', async () => {
    const widget = makeSelect(42, 23);
    checkSelected(widget, null);
    widget.select(1);
    checkSelected(widget, widget.entryByIndex(1));
    widget.removeIndex(0);
    checkSelected(widget, widget.entryByIndex(0));
  });

  it('remove entry after', async () => {
    const widget = makeSelect(42, 23);
    checkSelected(widget, null);
    widget.select(0);
    checkSelected(widget, widget.entryByIndex(0));
    widget.removeIndex(1);
    checkSelected(widget, widget.entryByIndex(0));
  });

  it('remove selected while unselected', async () => {
    const widget = makeSelect(42, 23);
    checkSelected(widget, null);
    widget.removeIndex(0);
    checkSelected(widget, null);
  });

  it('replace entries list', async () => {
    {
      const widget = makeSelect(42, 23);
      widget.select(1);
      checkSelected(widget, widget.entryByValue(23));
      widget.setEntries(makeEntries(23, 42));
      checkSelected(widget, widget.entryByValue(23));
    }

    {
      const widget = makeSelect(42, 23);
      widget.select(1);
      checkSelected(widget, widget.entryByValue(23));
      widget.setEntries(makeEntries());
      checkSelected(widget, null);
      widget.setEntries(makeEntries(23, 42));
      checkSelected(widget, null);
    }

    {
      const widget = makeSelect();
      widget.set('value', 23);
      widget.setEntries(makeEntries(23, 42));
      checkSelected(widget, widget.entryByValue(23));
    }
  });
});

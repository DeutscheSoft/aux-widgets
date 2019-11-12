import { SelectComponent, SelectEntryComponent, Select } from '../src/index.js';

import { assert, wait_for_event } from './helpers.js';

describe('Select', () => {

  function check_select(widget)
  {
    assert(widget.current_value() === false);
    widget.set('selected', 0);
    assert(widget.current_value() == 42);
    widget.set('selected', 1);
    assert(widget.current_value() == 23);
    widget.add_entry({ value: 'foo', label: 'bar' });
    assert(widget.get('selected') === 1);
    assert(widget.current_value() === 23);
  }

  it('appending entries', () => {
    const widget = new Select({
      entries: [
        {
          value: 42,
          label: 'the answer'
        }
      ],
    });

    // nothing selected
    assert(widget.current_value() === false);

    widget.add_entry({ value: 23, label: 'the other answer' });

    check_select(widget);
  });

  function make_entry_component(value, label)
  {
    const entry_component = document.createElement('aux-select-entry');
    entry_component.value = value;
    entry_component.label = label;
    return entry_component;
  }

  it('append component children', async () => {
    const select = document.createElement('aux-select'); 
    const widget = select.auxWidget;

    const entry42 = make_entry_component(42, 'the answer');
    const entry23 = make_entry_component(23, 'the other answer'); 
    const entry0 = make_entry_component(0, 'hello');

    select.appendChild(entry42);
    
    document.body.appendChild(select);

    await wait_for_event(widget, 'redraw');

    assert(widget.current_value() === false);

    select.appendChild(entry23);

    check_select(widget);

    select.insertBefore(entry0, select.firstChild);

    widget.set('selected', 0);
    assert(widget.current_value() === 0);

    select.insertBefore(entry23, entry42);
    widget.set('selected', 1);
    assert(widget.current_value() === 23);

    select.remove();
    widget.destroy();
  });
});

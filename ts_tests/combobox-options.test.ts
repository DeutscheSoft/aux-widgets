import { ComboBox, IComboBoxOptions } from '../src/widgets/combobox.js';

// Valid ComboBox options.
const combobox: IComboBoxOptions = {
  value: 'a',
  entries: ['A', 'B', 'C'],
  list_class: 'my-list',
  editmode: 'onenter',
};

new ComboBox(combobox);
new ComboBox({ value: null, entries: [{ label: 'One', value: 1 }] });

// Invalid editmode should be rejected.
const badEditmode: IComboBoxOptions = {
  value: 'x',
  entries: [],
  // @ts-expect-error editmode must be 'onenter' | 'immediate'
  editmode: 'onblur',
};

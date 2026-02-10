import { ComboBox, IComboBoxOptions } from '../src/widgets/combobox.js';

// Valid ComboBox options.
const combobox: IComboBoxOptions = {
  value: 'a',
  entries: ['A', 'B', 'C'],
  list_class: 'my-list',
  editmode: 'onenter',
};

const comboboxWidget = new ComboBox(combobox);
new ComboBox({ value: null, entries: [{ label: 'One', value: 1 }] });

// .set(key, value) API type-checking
comboboxWidget.set('value', 'b');
// @ts-expect-error value for 'editmode' must be 'onenter' | 'immediate'
comboboxWidget.set('editmode', 'onblur');

// Invalid editmode should be rejected.
const badEditmode: IComboBoxOptions = {
  value: 'x',
  entries: [],
  // @ts-expect-error editmode must be 'onenter' | 'immediate'
  editmode: 'onblur',
};

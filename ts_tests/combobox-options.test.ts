import { ComboBox, IComboBoxOptions } from '../src/widgets/combobox.js';

// Valid ComboBox options.
const combobox: Partial<IComboBoxOptions> = {
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

// .get(key) API type-checking
const _comboboxValue: string | number | null | undefined = comboboxWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
comboboxWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
comboboxWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
comboboxWidget.on('not_an_event', () => {});

// Invalid editmode should be rejected.
const badEditmode: Partial<IComboBoxOptions> = {
  value: 'x',
  entries: [],
  // @ts-expect-error editmode must be 'onenter' | 'immediate'
  editmode: 'onblur',
};

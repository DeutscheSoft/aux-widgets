import { Select, ISelectOptions } from '../src/widgets/select.js';

// Valid Select options.
const withEntries: ISelectOptions = {
  label: 'Choose',
  entries: ['A', 'B', 'C'],
  selected: 0,
  placeholder: 'Select...',
  auto_size: true,
  list_class: 'my-list',
};

const entryObjects: ISelectOptions = {
  entries: [
    { label: 'One', value: 1 },
    { label: 'Two', value: 2, icon: 'number' },
  ],
  value: 1,
};

const selectWidget = new Select(withEntries);
new Select({ entries: [], selected: -1, show_list: false });

// .set(key, value) API type-checking
selectWidget.set('selected', 1);
// @ts-expect-error value for 'selected' must be number
selectWidget.set('selected', '1');

// Invalid selected type should be rejected.
const badSelected: ISelectOptions = {
  entries: ['a'],
  // @ts-expect-error selected must be a number
  selected: '0',
};

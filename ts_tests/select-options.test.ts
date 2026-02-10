import { Select, ISelectOptions } from '../src/index.js';

// Valid Select options.
const withEntries: Partial<ISelectOptions> = {
  label: 'Choose',
  entries: ['A', 'B', 'C'],
  selected: 0,
  placeholder: 'Select...',
  auto_size: true,
  list_class: 'my-list',
};

const entryObjects: Partial<ISelectOptions> = {
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

// .get(key) API type-checking
const _selectSelected: number | undefined = selectWidget.get('selected');
// @ts-expect-error 'not_an_option_key' is not a valid option key
selectWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
selectWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
selectWidget.on('not_an_event', () => {});

// Invalid selected type should be rejected.
const badSelected: Partial<ISelectOptions> = {
  entries: ['a'],
  // @ts-expect-error selected must be a number
  selected: '0',
};

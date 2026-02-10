import { Buttons, IButtonsOptions } from '../src/widgets/buttons.js';

// Valid Buttons options (extends Container).
const horizontal: IButtonsOptions = {
  buttons: ['A', 'B', 'C'],
  direction: 'horizontal',
  select: 0,
  multi_select: 0,
  deselect: true,
};

const vertical: IButtonsOptions = {
  buttons: [{ label: 'One' }, { label: 'Two' }],
  direction: 'vertical',
  select: [0, 1],
  multi_select: 2,
};

const buttonsWidget = new Buttons(horizontal);
new Buttons({ buttons: ['X'], select: -1 });

// .set(key, value) API type-checking
buttonsWidget.set('direction', 'vertical');
// @ts-expect-error value for 'direction' must be 'horizontal' | 'vertical'
buttonsWidget.set('direction', 'grid');

// .get(key) API type-checking
const _buttonsDirection: 'horizontal' | 'vertical' | undefined = buttonsWidget.get('direction');
// @ts-expect-error 'not_an_option_key' is not a valid option key
buttonsWidget.get('not_an_option_key');

// Invalid direction should be rejected.
const badDirection: IButtonsOptions = {
  buttons: ['a'],
  // @ts-expect-error direction must be 'horizontal' | 'vertical'
  direction: 'grid',
};

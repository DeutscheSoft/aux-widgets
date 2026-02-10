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

new Buttons(horizontal);
new Buttons({ buttons: ['X'], select: -1 });

// Invalid direction should be rejected.
const badDirection: IButtonsOptions = {
  buttons: ['a'],
  // @ts-expect-error direction must be 'horizontal' | 'vertical'
  direction: 'grid',
};

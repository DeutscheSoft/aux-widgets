import { ValueButton, IValueButtonOptions } from '../src/widgets/valuebutton.js';

// Valid ValueButton options based on examples.
const horizontalValueButton: IValueButtonOptions = {
  min: 0,
  max: 100,
  value: 50,
  base: 50,
  label: 'MyValueButton',
  icon: 'gear',
  layout: 'horizontal',
};

const verticalValueButton: IValueButtonOptions = {
  min: 0,
  max: 100,
  value: 50,
  base: 50,
  label: 'MyValueButton',
  icon: 'gear',
  layout: 'vertical',
};

new ValueButton(horizontalValueButton);
new ValueButton({
  value: 10,
  min: 0,
  max: 20,
});

// Invalid value type should be rejected.
new ValueButton({
  min: 0,
  max: 100,
  // @ts-expect-error value must be a number
  value: 'not-a-number',
});

// Invalid drag direction should be rejected.
const badDirection: IValueButtonOptions = {
  // @ts-expect-error direction must be 'polar' | 'vertical' | 'horizontal'
  direction: 'diagonal',
};


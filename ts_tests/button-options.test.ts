import { Button, IButtonOptions } from '../src/widgets/button.js';

// Valid Button options based on examples.
const simpleButton: IButtonOptions = {
  label: 'Click me',
  icon: 'gear',
  layout: 'horizontal',
};

const statefulButton: IButtonOptions = {
  label: 'Click me',
  icon: 'gear',
  state: true,
  layout: 'horizontal',
};

const iconOnlyButton: IButtonOptions = {
  icon: 'gear',
};

// Constructor should accept partial options.
new Button({
  label: 'Click me',
  state: false,
});

// Invalid layout should be rejected.
const badLayoutButton: IButtonOptions = {
  // @ts-expect-error layout must be 'horizontal' | 'vertical'
  layout: 'diagonal',
};

// Invalid label type should be rejected (only string | false allowed).
const badLabelButton: IButtonOptions = {
  // @ts-expect-error label must be string | false
  label: 123,
};


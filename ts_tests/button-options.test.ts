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
const buttonWidget = new Button({
  label: 'Click me',
  state: false,
});

// .set(key, value) API type-checking
buttonWidget.set('label', 'OK');
// @ts-expect-error value for 'label' must be string | false
buttonWidget.set('label', 123);

// .get(key) API type-checking
const _buttonLabel: string | false | undefined = buttonWidget.get('label');
// @ts-expect-error 'not_an_option_key' is not a valid option key
buttonWidget.get('not_an_option_key');

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


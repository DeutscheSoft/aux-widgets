import { Label, ILabelOptions } from '../src/widgets/label.js';

// Valid Label options.
const simpleLabel: ILabelOptions = {
  label: 'Hello',
};

const withFormat: ILabelOptions = {
  label: 'Count',
  format: (s) => s.toUpperCase(),
};

const labelWidget = new Label(simpleLabel);
new Label({ label: 'x', format: false });

// .set(key, value) API type-checking
labelWidget.set('label', 'Updated');
// @ts-expect-error value for 'label' must be string | false
labelWidget.set('label', 123);

// .get(key) API type-checking
const _labelLabel: string | false | undefined = labelWidget.get('label');
// @ts-expect-error 'not_an_option_key' is not a valid option key
labelWidget.get('not_an_option_key');

// Invalid format type should be rejected.
const badFormat: ILabelOptions = {
  label: 'x',
  // @ts-expect-error format must be ((label: string) => string | number) | false
  format: 123,
};

import { Label, ILabelOptions } from '../src/widgets/label.js';

// Valid Label options.
const simpleLabel: ILabelOptions = {
  label: 'Hello',
};

const withFormat: ILabelOptions = {
  label: 'Count',
  format: (s) => s.toUpperCase(),
};

new Label(simpleLabel);
new Label({ label: 'x', format: false });

// Invalid format type should be rejected.
const badFormat: ILabelOptions = {
  label: 'x',
  // @ts-expect-error format must be ((label: string) => string | number) | false
  format: 123,
};

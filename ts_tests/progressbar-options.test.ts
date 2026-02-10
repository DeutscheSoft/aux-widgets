import { ProgressBar, IProgressBarOptions } from '../src/widgets/progressbar.js';

// Valid ProgressBar options (extends Meter).
const progressBar: IProgressBarOptions = {
  min: 0,
  max: 100,
  value: 45,
  layout: 'top',
  show_scale: false,
  format_value: (v) => `${v}%`,
};

new ProgressBar(progressBar);
new ProgressBar({ value: 75 });

// Invalid value type should be rejected.
const badValue: IProgressBarOptions = {
  min: 0,
  max: 100,
  // @ts-expect-error value must be a number
  value: '50',
};

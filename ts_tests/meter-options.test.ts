import { Meter, IMeterOptions } from '../src/widgets/meter.js';

// Valid Meter options.
const levelMeter: IMeterOptions = {
  min: -96,
  max: 24,
  value: 0,
  base: 0,
  layout: 'right',
  segment: 2,
  show_scale: true,
  show_label: true,
  label: 'Level',
  foreground: '#0f0',
  background: '#333',
  paint_mode: 'value',
};

const withGradient: IMeterOptions = {
  min: 0,
  max: 100,
  value: 50,
  layout: 'bottom',
  foreground: [
    { value: 0, color: 'green' },
    { value: 100, color: 'red' },
  ],
};

const meterWidget = new Meter(levelMeter);
new Meter({ min: 0, max: 1, value: 0.5, show_scale: false });

// .set(key, value) API type-checking
meterWidget.set('value', 0.5);
// @ts-expect-error value for 'layout' must be 'left' | 'right' | 'top' | 'bottom'
meterWidget.set('layout', 'center');

// .get(key) API type-checking
const _meterValue: number | undefined = meterWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
meterWidget.get('not_an_option_key');

// Invalid layout should be rejected.
const badLayout: IMeterOptions = {
  min: 0,
  max: 100,
  value: 50,
  // @ts-expect-error layout must be 'left' | 'right' | 'top' | 'bottom'
  layout: 'center',
};

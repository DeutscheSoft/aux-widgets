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

new Meter(levelMeter);
new Meter({ min: 0, max: 1, value: 0.5, show_scale: false });

// Invalid layout should be rejected.
const badLayout: IMeterOptions = {
  min: 0,
  max: 100,
  value: 50,
  // @ts-expect-error layout must be 'left' | 'right' | 'top' | 'bottom'
  layout: 'center',
};

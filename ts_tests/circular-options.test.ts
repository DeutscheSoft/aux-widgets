import { Circular, ICircularOptions } from '../src/widgets/circular.js';

// Valid Circular options (used by Knob/Gauge).
const circular: ICircularOptions = {
  min: 0,
  max: 100,
  value: 50,
  size: 100,
  thickness: 10,
  start: 135,
  angle: 270,
  show_hand: true,
  show_dots: true,
  dots: [0, 25, 50, 75, 100],
  markers: [{ from: 75, to: 100 }],
  labels: [0, 50, 100],
};

new Circular(circular);
new Circular({ value: 0, base: false });

// Invalid value type should be rejected.
const badValue: ICircularOptions = {
  min: 0,
  max: 100,
  // @ts-expect-error value must be a number
  value: '50',
};

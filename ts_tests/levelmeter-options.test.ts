import { LevelMeter, ILevelMeterOptions } from '../src/widgets/levelmeter.js';

// Valid LevelMeter options (extends Meter).
const levelMeter: ILevelMeterOptions = {
  min: -96,
  max: 24,
  value: 0,
  layout: 'right',
  show_clip: true,
  clipping: 0,
  auto_clip: 500,
  show_hold: true,
  hold_size: 2,
  auto_hold: 1000,
  falling: 12,
  falling_duration: 300,
};

new LevelMeter(levelMeter);
new LevelMeter({ value: -6, clip: true });

// Invalid clipping type should be rejected.
const badClipping: ILevelMeterOptions = {
  min: 0,
  max: 100,
  value: 50,
  // @ts-expect-error clipping must be a number
  clipping: '0',
};

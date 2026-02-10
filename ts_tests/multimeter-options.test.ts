import { MultiMeter, IMultiMeterOptions } from '../src/widgets/multimeter.js';

// Valid MultiMeter options (extends Container, levelmeter options as arrays/singles).
const multimeter: IMultiMeterOptions = {
  preset: 'stereo',
  layout: 'right',
};

new MultiMeter(multimeter);
new MultiMeter({ preset: 'mono' });

// Invalid preset should be rejected.
const badPreset: IMultiMeterOptions = {
  // @ts-expect-error preset must be a valid IMultiMeterPresetName
  preset: 'quad',
};

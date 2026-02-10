import { MultiMeter, IMultiMeterOptions } from '../src/widgets/multimeter.js';

// Valid MultiMeter options (extends Container, levelmeter options as arrays/singles).
const multimeter: IMultiMeterOptions = {
  preset: 'stereo',
  layout: 'right',
};

const multimeterWidget = new MultiMeter(multimeter);
new MultiMeter({ preset: 'mono' });

// .set(key, value) API type-checking
multimeterWidget.set('preset', 'mono');
// @ts-expect-error value for 'preset' must be IMultiMeterPresetName
multimeterWidget.set('preset', 'quad');

// Invalid preset should be rejected.
const badPreset: IMultiMeterOptions = {
  // @ts-expect-error preset must be a valid IMultiMeterPresetName
  preset: 'quad',
};

import { Scale, IScaleOptions } from '../src/widgets/scale.js';

// Valid Scale options.
const verticalScale: IScaleOptions = {
  min: 0,
  max: 100,
  layout: 'right',
  division: 10,
  show_labels: true,
  pointer: 50,
  bar: 25,
};

const horizontalScale: IScaleOptions = {
  min: -96,
  max: 24,
  base: 0,
  layout: 'bottom',
  fixed_dots: [0, 25, 50, 75, 100],
  fixed_labels: [{ value: 0, label: '0' }, { value: 100, label: '100' }],
};

const scaleWidget = new Scale(verticalScale);
new Scale({ min: 0, max: 1, layout: 'top', pointer: false });

// .set(key, value) API type-checking
scaleWidget.set('pointer', 75);
// @ts-expect-error value for 'layout' must be 'left' | 'right' | 'top' | 'bottom'
scaleWidget.set('layout', 'center');

// .get(key) API type-checking
const _scalePointer: number | false | undefined = scaleWidget.get('pointer');
// @ts-expect-error 'not_an_option_key' is not a valid option key
scaleWidget.get('not_an_option_key');

// Invalid layout should be rejected.
const badLayout: IScaleOptions = {
  min: 0,
  max: 100,
  // @ts-expect-error layout must be 'left' | 'right' | 'top' | 'bottom'
  layout: 'center',
};

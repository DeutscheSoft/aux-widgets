import { Slider, ISliderOptions } from '../src/widgets/slider.js';

// A fully specified, valid Slider options object should typecheck.
const sliderOptions: ISliderOptions = {
  value: 0,
  frames: 16,
  alignment: 'horizontal',
  image: 'slider-frames.png',
  direction: 'vertical',
  rotation: 45,
  blind_angle: 10,
  basis: 120,
  reset: 0,
  min: 0,
  max: 100,
};

const slider = new Slider(sliderOptions);

// .set(key, value) API type-checking
slider.set('value', 50);
// @ts-expect-error value for 'value' must be number
slider.set('value', '50');

// .get(key) API type-checking
const _sliderValue: number | undefined = slider.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
slider.get('not_an_option_key');

// Partial options must also be accepted by the constructor.
new Slider({
  value: 50,
  image: false,
});

// Invalid value type should be rejected.
new Slider({
  // @ts-expect-error value must be a number
  value: 'not-a-number',
});

// Invalid alignment option should be rejected.
const badAlignment: ISliderOptions = {
  // @ts-expect-error alignment must be 'horizontal' | 'vertical'
  alignment: 'diagonal',
};


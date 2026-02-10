import { Knob, IKnobOptions } from '../src/widgets/knob.js';

// Valid Knob options should typecheck.
const knobOptions: IKnobOptions = {
  reset: 0,
  bind_dblclick: true,
  step: 0.1,
  basis: 150,
  blind_angle: 20,
  shift_up: 4,
  shift_down: 0.25,
  direction: 'polar',
  rotation: 45,
  preset: 'medium',
  presets: {
    small: { basis: 100 },
    custom: { rotation: 90 },
  },
};

const knob = new Knob(knobOptions);

// .set(key, value) API type-checking
knob.set('value', 0.5);
// @ts-expect-error value for 'direction' must be 'polar' | 'vertical' | 'horizontal'
knob.set('direction', 'diagonal');

// Partial options via constructor are allowed.
new Knob({
  value: 0.5,
  direction: 'horizontal',
});

// Invalid preset type should be rejected.
const badPreset: IKnobOptions = {
  // @ts-expect-error preset must be a string
  preset: 123,
};

// Invalid direction should be rejected.
new Knob({
  // @ts-expect-error direction must be 'polar' | 'vertical' | 'horizontal'
  direction: 'diagonal',
});


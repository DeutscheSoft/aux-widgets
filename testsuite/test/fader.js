import { Fader } from '../src/index.js';
import { assertEqual } from './helpers.js';

describe('Fader', () => {
  it('set() does not clamp', () => {
    const fader = new Fader({
      min: -2,
      max: 2,
      value: 10,
    });

    assertEqual(fader.get('value'), 10);
    fader.set('value', 7);
    assertEqual(fader.get('value'), 7);
  });
});

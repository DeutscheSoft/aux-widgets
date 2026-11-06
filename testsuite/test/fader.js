import { Fader } from '../../src/index.js';
import { assertEqual } from './utils/helpers.js';

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

  it('value userset keeps the fader value key', () => {
    const fader = new Fader({ show_value: true, value: 0 });
    const keys = [];

    fader.on('userset', (key) => {
      keys.push(key);
    });
    fader.value.userset('value', 0.25);

    assertEqual(keys, ['value']);
    assertEqual(fader.get('value'), 0.25);
  });
});

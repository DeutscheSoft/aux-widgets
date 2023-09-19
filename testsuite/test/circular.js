import { Circular } from '../src/index.js';
import { assertEqual } from './helpers.js';

describe('Circular', () => {
  it('set() does not clamp', () => {
    const circ = new Circular({
      min: -2,
      max: 2,
      value: 10,
    });
    assertEqual(circ.get('value'), 10);
    circ.set('value', 7);
    assertEqual(circ.get('value'), 7);
  });
});

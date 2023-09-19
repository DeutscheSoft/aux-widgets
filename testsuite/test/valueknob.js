import { ValueKnob } from '../src/index.js';
import { assertEqual } from './helpers.js';

describe('ValueKnob', () => {
  it('set() does not clamp', () => {
    const widget = new ValueKnob({
      min: -2,
      max: 2,
      value: 10,
    });

    assertEqual(widget.get('value'), 10);
    assertEqual(widget.value.get('value'), 10);
    widget.set('value', 7);
    assertEqual(widget.get('value'), 7);
    assertEqual(widget.value.get('value'), 7);
  });
});

import { assert, assertError } from './helpers.js';
import { Range } from '../src/index.js';

describe('Range', () => {
  it('basics', () => {
    const range = new Range({
      min: 0,
      max: 1,
      type: 'linear',
      basis: 1,
    });

    assert(range.valueToPixel(-1) === -1);
    assert(range.valueToPixel(0) === 0);
    assert(range.valueToPixel(0.5) === 0.5);
    assert(range.valueToPixel(1) === 1);
    assert(range.valueToPixel(2) === 2);

    assert(range.snap(-1) === 0);
    assert(range.snap(2) === 1);
  });
  it('clip', () => {
    const range = new Range({
      min: 0,
      max: 1,
      type: 'linear',
      basis: 1,
      clip: false,
    });

    assert(range.valueToPixel(-1) === -1);
    assert(range.valueToPixel(0) === 0);
    assert(range.valueToPixel(0.5) === 0.5);
    assert(range.valueToPixel(1) === 1);
    assert(range.valueToPixel(2) === 2);

    assert(range.snap(-1) === -1);
    assert(range.snap(2) === 2);
  });
});

import {
  Equalizer,
  EqBand,
} from '../src/index.js';

import { waitForDrawn, assert, compare, compareOptions } from './helpers.js';

describe('Equalizer', () => {
  it('setting \'bands\' property', () => {
    const eq = new Equalizer();

    const bands = [
      new EqBand(),
      new EqBand(),
      new EqBand(),
    ];

    eq.set('bands', bands);

    assert(bands[0].parent === eq);
    assert(bands[1].parent === eq);
    assert(bands[2].parent === eq);

    eq.set('bands', bands.slice(1));
    assert(bands[0].parent === void 0);
    assert(bands[1].parent === eq);
    assert(bands[2].parent === eq);
    eq.set('bands', bands.slice(1, 2));
    assert(bands[0].parent === void 0);
    assert(bands[1].parent === eq);
    assert(bands[2].parent === void 0);
    eq.set('bands', bands);
    assert(bands[0].parent === eq);
    assert(bands[1].parent === eq);
    assert(bands[2].parent === eq);
    eq.set('bands', []);
    assert(bands[0].parent === void 0);
    assert(bands[1].parent === void 0);
    assert(bands[2].parent === void 0);
  });
});

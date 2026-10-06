import { FrequencyResponse, Equalizer } from '../src/index.js';

import { assert, compare } from './helpers.js';

describe('FrequencyResponse', () => {
  it('generates grid_y from db_grid by default', () => {
    const fr = new FrequencyResponse({ db_grid: 12 });
    const grid_y = fr.get('grid_y');

    assert(grid_y.length > 0);
    assert(grid_y.some((line) => line.pos === 0));
  });

  it('keeps custom grid_y when db_grid is false', () => {
    const custom = [
      { pos: -12, label: '-12dB' },
      { pos: 0, label: '0dB', class: 'aux-highlight' },
      { pos: 12, label: '12dB' },
    ];
    const fr = new FrequencyResponse({
      db_grid: false,
      grid_y: custom,
    });

    assert(compare(fr.get('grid_y'), custom));

    fr.set('range_y', { min: -48, max: 48 });
    assert(compare(fr.get('grid_y'), custom));

    fr.set('db_grid', false);
    assert(compare(fr.get('grid_y'), custom));
  });

  it('regenerates grid_y when db_grid is set to a number again', () => {
    const custom = [{ pos: 0, label: '0dB' }];
    const fr = new FrequencyResponse({
      db_grid: false,
      grid_y: custom,
    });

    assert(compare(fr.get('grid_y'), custom));

    fr.set('db_grid', 6);
    const grid_y = fr.get('grid_y');
    assert(grid_y.length > 1);
    assert(!compare(grid_y, custom));
  });

  it('Equalizer inherits custom grid_y with db_grid false', () => {
    const custom = [
      { pos: -6, label: '-6dB' },
      { pos: 0, label: '0dB' },
      { pos: 6, label: '6dB' },
    ];
    const eq = new Equalizer({
      db_grid: false,
      grid_y: custom,
    });

    assert(compare(eq.get('grid_y'), custom));
  });
});

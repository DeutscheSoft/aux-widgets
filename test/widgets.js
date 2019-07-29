import { ResponseHandle } from '../src/modules/responsehandle.mjs';
import { EqBand } from '../src/modules/eqband.mjs';
import { Chart } from '../src/widgets/chart.mjs';
import { ResponseHandler } from '../src/widgets/responsehandler.mjs';
import { Equalizer } from '../src/widgets/equalizer.mjs';
import { Value } from '../src/widgets/value.mjs';
import { Knob } from '../src/widgets/knob.mjs';

import { compare, object_minus } from './helpers.mjs';

describe('Widgets', () => {
    it('create', (done) => {
       new ResponseHandle();
       new EqBand();
       new Chart();
       new ResponseHandler();
       new Equalizer();
       new Value();
       new Knob();

       done();
    });
});
describe('Equalizer', () => {
  it('creating bands', (done) => {
    const eq = new Equalizer();

    const b1 = eq.add_band({});
    const b2 = eq.add_band(new EqBand());

    const o1 = object_minus(b1.options, [ "id" ]);
    const o2 = object_minus(b2.options, [ "id" ]);

    if (!compare(o1, o2))
    {
      console.error(b1.options, b2.options);
      throw new Error('Options mismatch.');
    }

    done();
  });
});

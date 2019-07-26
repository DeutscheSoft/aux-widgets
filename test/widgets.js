import { ResponseHandle } from '../src/modules/responsehandle.mjs';
import { EqBand } from '../src/modules/eqband.mjs';
import { Chart } from '../src/widgets/chart.mjs';
import { ResponseHandler } from '../src/widgets/responsehandler.mjs';
import { Equalizer } from '../src/widgets/equalizer.mjs';

describe('Widgets', () => {
    it('create', (done) => {
       new ResponseHandle();
       new EqBand();
       new Chart();
       new ResponseHandler();
       new Equalizer();

       done();
    });
});

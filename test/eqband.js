import { ResponseHandle } from '../src/modules/responsehandle.mjs';
import { EqBand } from '../src/modules/eqband.mjs';

describe('EqBand', () => {
    it('create', (done) => {
       new ResponseHandle();
       new EqBand();

       done();
    });
});

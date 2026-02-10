import { Bitstring, IBitstringOptions } from '../src/index.js';

// Valid Bitstring options (extends Buttons).
const bitstring: Partial<IBitstringOptions> = {
  length: 8,
  bitstring: 0,
  direction: 'horizontal',
};

const bitstringWidget = new Bitstring(bitstring);
new Bitstring({ length: 16, bitstring: [true, false, true] });

// .set(key, value) API type-checking
bitstringWidget.set('length', 8);
// @ts-expect-error value for 'length' must be number | false
bitstringWidget.set('length', '8');

// .get(key) API type-checking
const _bitstringLength: number | false | undefined = bitstringWidget.get('length');
// @ts-expect-error 'not_an_option_key' is not a valid option key
bitstringWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
bitstringWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
bitstringWidget.on('not_an_event', () => {});

// Invalid length type should be rejected.
const badLength: Partial<IBitstringOptions> = {
  // @ts-expect-error length must be number | false
  length: '8',
};

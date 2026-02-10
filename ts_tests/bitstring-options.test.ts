import { Bitstring, IBitstringOptions } from '../src/widgets/bitstring.js';

// Valid Bitstring options (extends Buttons).
const bitstring: IBitstringOptions = {
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

// Invalid length type should be rejected.
const badLength: IBitstringOptions = {
  // @ts-expect-error length must be number | false
  length: '8',
};

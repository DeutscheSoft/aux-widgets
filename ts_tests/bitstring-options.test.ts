import { Bitstring, IBitstringOptions } from '../src/widgets/bitstring.js';

// Valid Bitstring options (extends Buttons).
const bitstring: IBitstringOptions = {
  length: 8,
  bitstring: 0,
  direction: 'horizontal',
};

new Bitstring(bitstring);
new Bitstring({ length: 16, bitstring: [true, false, true] });

// Invalid length type should be rejected.
const badLength: IBitstringOptions = {
  // @ts-expect-error length must be number | false
  length: '8',
};

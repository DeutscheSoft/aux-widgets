import { Assert, Eq } from './helpers.js';

type Opts = {
  value: number;
  label: string;
};

type OptionKV<T> = {
  [K in keyof T]-?: [key: K & string, value: T[K]];
}[keyof T];

type Userset = (...args: OptionKV<Opts>) => void;

// Rest-tuple: after narrowing key, value should be number
const rest: Userset = (...args) => {
  if (args[0] === 'value') {
    type V = typeof args[1];
    type _Ok = Assert<Eq<V, number>>;
  }
};

// Destructured once: same as rest if args stays correlated
const destructure: Userset = (...args) => {
  const [key, value] = args;
  if (key === 'value') {
    type _Ok = Assert<Eq<typeof value, number>>;
  }
};

// Two-parameter form written as Userset — check inferred param types
type Params = Parameters<Userset>;
type _ParamsAreUnionTuple = Assert<Eq<Params, OptionKV<Opts>>>;

// What are the types of key/value when binding a two-arg arrow to Userset?
const twoArg: Userset = (key, value) => {
  type K = typeof key;
  type V = typeof value;
  // If correlation is lost, K is 'value' | 'label' and V is number | string
  type _KeyUnion = Assert<Eq<K, 'value' | 'label'>>;
  type _ValueUnion = Assert<Eq<V, number | string>>;
  if (key === 'value') {
    // Does control-flow narrow value?
    type _Narrowed = Assert<Eq<typeof value, number>>;
  }
};

void rest;
void destructure;
void twoArg;

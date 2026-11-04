import { Assert, Eq, Extends } from './helpers.js';

type IFaderOptions = {
  value: number;
  label: string | false;
  layout: 'left' | 'right';
  reset?: number;
};

/** Union of [key, value] tuples for each option. */
type OptionKV<T> = {
  [K in keyof T]-?: [key: K & string, value: T[K]];
}[keyof T];

type FaderKV = OptionKV<IFaderOptions>;

type _HasValue = Assert<Extends<[key: 'value', value: number], FaderKV>>;
type _HasLabel = Assert<
  Extends<[key: 'label', value: string | false], FaderKV>
>;
type _RejectsBad = Assert<
  Eq<Extends<[key: 'value', value: string], FaderKV>, false>
>;

type Userset = (...args: OptionKV<IFaderOptions>) => void | false;

const ok: Userset = (...args) => {
  const [key, value] = args;
  if (key === 'value') {
    const n: number = value;
    void n;
  } else if (key === 'label') {
    const l: string | false = value;
    void l;
  } else if (key === 'layout') {
    const lay: 'left' | 'right' = value;
    void lay;
  } else if (key === 'reset') {
    const r: number | undefined = value;
    void r;
  }
  void args;
};

// Separate parameters: correlation is usually lost
const separate: Userset = (key, value) => {
  if (key === 'value') {
    // Ideal: number. Actual may be the full value union.
    const _probe: typeof value = value;
    type ValueWhenKeyIsValue = typeof key extends 'value'
      ? typeof value
      : never;
    void _probe;
  }
  void key;
  void value;
};

// Emit / call site
const emit = (h: Userset) => {
  h('value', 1);
  h('label', 'x');
  h('layout', 'left');
  h('reset', 0);
  // @ts-expect-error wrong value type for key
  h('value', 'nope');
  // @ts-expect-error unknown key
  h('nope', 1);
};

void ok;
void separate;
void emit;

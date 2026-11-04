/**
 * Type-level tests for property bindings (`Base.bind`, `bindOption`, observers).
 */
import {
  Fader,
  Widget,
  BindingSource,
  BindingOptions,
  bindOption,
  observeOption,
  observeUseraction,
  interceptOption,
  InteractionSuppress,
} from '../src/index.js';
import { cast, assertAssignable } from './helpers.js';

const fader = cast<Fader>();
const widget = cast<Widget>();

// --- BindingOptions ---

const opts: BindingOptions = {
  event: 'useraction',
  receive: true,
  send: true,
  update: true,
  suppressWhileInteracting: true,
  suppressTimeout: 500,
};

const _optsEventSet: BindingOptions = { event: 'set' };
const _optsEventUserset: BindingOptions = { event: 'userset' };

const _badEvent: BindingOptions = {
  // @ts-expect-error event must be 'useraction' | 'set' | 'userset'
  event: 'click',
};

void opts;
void _optsEventSet;
void _optsEventUserset;
void _badEvent;

// --- BindingSource value typing ---

const numberSource: BindingSource<number> = {
  subscribe: (cb) => {
    cb(1);
    return () => {};
  },
  set: (value) => {
    const _n: number = value;
    void _n;
  },
};

// @ts-expect-error BindingSource<number> rejects string in set
numberSource.set?.('nope');

numberSource.subscribe?.((value) => {
  const _n: number = value;
  void _n;
});

// --- Base.bind ---

const unbind = fader.bind('value', numberSource);
const _unsubType: () => void = unbind;
unbind();

fader.bind('value', numberSource, {
  event: 'set',
  update: false,
  suppressWhileInteracting: true,
  suppressTimeout: 100,
});

fader.bind(
  'value',
  { set: (v) => {
    const _n: number = v;
    void _n;
  } },
  { send: true, receive: false }
);

fader.bind(
  'value',
  {
    subscribe: (cb) => {
      cb(0.5);
      return () => {};
    },
  },
  { receive: true, send: false }
);

// Underscore option names are allowed; value type is unknown.
fader.bind('_custom', {
  set: (v) => {
    const _u: unknown = v;
    void _u;
  },
});

// @ts-expect-error 'not_an_option' is not a valid Fader option
fader.bind('not_an_option', numberSource);

fader.bind('value', {
  // @ts-expect-error source.set must accept number for 'value'
  set: (v: string) => {
    void v;
  },
});

fader.bind('value', {
  // @ts-expect-error subscribe callback value is number, not string
  subscribe: (cb: (value: string) => void) => {
    void cb;
    return () => {};
  },
});

// boolean option on Widget
widget.bind('disabled', {
  set: (v) => {
    const _b: boolean = v;
    void _b;
  },
});

// @ts-expect-error disabled is boolean, not number
widget.bind('disabled', numberSource);

// --- bindOption ---

const unbind2 = bindOption(fader, 'value', numberSource, { event: 'userset' });
assertAssignable<() => void, typeof unbind2>();

// @ts-expect-error wrong option name
bindOption(fader, 'nope', numberSource);

// --- observeOption / observeUseraction / interceptOption ---

observeOption(fader, 'value', (value) => {
  const _n: number = value;
  void _n;
});

observeOption(
  fader,
  'value',
  (value) => {
    void value;
  },
  false
);

// @ts-expect-error callback value must be number
observeOption(fader, 'value', (value: string) => {
  void value;
});

observeUseraction(fader, 'value', (value) => {
  const _n: number = value;
  void _n;
});

interceptOption(fader, 'value', (value) => {
  const _n: number = value;
  void _n;
  if (value < 0) return false;
});

// @ts-expect-error unknown option
observeOption(fader, 'not_real', () => {});

// --- InteractionSuppress ---

const gate = new InteractionSuppress<number>(fader, (value) => {
  const _n: number = value;
  void _n;
}, 500);

gate.set(1);
// @ts-expect-error set expects number
gate.set('x');

const _locked: boolean = gate.isLocked();
void _locked;
gate.destroy();

/**
 * Type-level tests for property bindings (`Base.bind`, `bindOption`, observers).
 */
import {
  Fader,
  Widget,
  ReadableValue,
  WritableValue,
  ReadwriteValue,
  SubjectLike,
  BindingOptions,
  ReceiveOnlyBindingOptions,
  SendOnlyBindingOptions,
  BindingOptionsForValue,
  ValueForBindingOptions,
  bindOption,
  observeOption,
  observeUseraction,
  interceptOption,
  InteractionSuppress,
  fromSubject,
} from '../src/index.js';
import {
  cast,
  assertAssignable,
  assertMutualAssignable,
} from './helpers.js';

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
  debug: true,
};

const _optsDebugFn: BindingOptions = {
  debug: (_message?: unknown, ..._rest: unknown[]) => {},
};

const _optsEventSet: BindingOptions = { event: 'set' };
const _optsEventUserset: BindingOptions = { event: 'userset' };

const _badEvent: BindingOptions = {
  // @ts-expect-error event must be 'useraction' | 'set' | 'userset'
  event: 'click',
};

void opts;
void _optsDebugFn;
void _optsEventSet;
void _optsEventUserset;
void _badEvent;

// --- ReadableValue / WritableValue / ReadwriteValue ---

const numberSource: ReadwriteValue<number> = {
  subscribe: (cb) => {
    cb(1);
    return () => {};
  },
  set: (value) => {
    const _n: number = value;
    void _n;
  },
};

const _readableOnly: ReadableValue<number> = {
  subscribe: (cb) => {
    cb(1);
    return () => {};
  },
};

const _writableOnly: WritableValue<number> = {
  set: (value) => {
    const _n: number = value;
    void _n;
  },
};

const _subjectLike: SubjectLike<number> = {
  subscribe: (cb) => {
    cb(1);
    return { unsubscribe() {} };
  },
  next: (value) => {
    const _n: number = value;
    void _n;
  },
};

const _fromSubject: ReadwriteValue<number> = fromSubject(_subjectLike);
_fromSubject.set(2);

// @ts-expect-error fromSubject requires next
fromSubject(_readableOnly);

// @ts-expect-error ReadwriteValue<number> rejects string in set
numberSource.set('nope');

void _fromSubject;

numberSource.subscribe((value) => {
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

// Readable-only: cannot disable receive or enable send / event
// @ts-expect-error receive: false leaves no active direction on a readable source
fader.bind('value', _readableOnly, { receive: false });

// @ts-expect-error send is not allowed on a readable-only source
fader.bind('value', _readableOnly, { send: true });

// @ts-expect-error event requires a writable source
fader.bind('value', _readableOnly, { event: 'useraction' });

// Writable-only: cannot disable send or enable receive / suppress
// @ts-expect-error send: false leaves no active direction on a writable source
fader.bind('value', _writableOnly, { send: false });

// @ts-expect-error receive is not allowed on a writable-only source
fader.bind('value', _writableOnly, { receive: true });

// @ts-expect-error suppressWhileInteracting is receive-side only
fader.bind('value', _writableOnly, { suppressWhileInteracting: true });

// Readwrite: both directions off is not allowed
// @ts-expect-error receive and send cannot both be false
fader.bind('value', numberSource, { receive: false, send: false });

// Duplex may disable one direction
fader.bind('value', numberSource, { send: false, update: true });
fader.bind('value', numberSource, { receive: false, event: 'set' });

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

// --- BindingOptionsForValue / ValueForBindingOptions ---

assertMutualAssignable<
  BindingOptionsForValue<ReadwriteValue<number>>,
  BindingOptions
>();
assertMutualAssignable<
  BindingOptionsForValue<ReadableValue<number>>,
  ReceiveOnlyBindingOptions
>();
assertMutualAssignable<
  BindingOptionsForValue<WritableValue<number>>,
  SendOnlyBindingOptions
>();

assertMutualAssignable<
  ValueForBindingOptions<{}, number>,
  ReadwriteValue<number>
>();
assertMutualAssignable<
  ValueForBindingOptions<{ event: 'set' }, number>,
  ReadwriteValue<number>
>();
assertMutualAssignable<
  ValueForBindingOptions<{ send: false }, number>,
  ReadableValue<number>
>();
assertMutualAssignable<
  ValueForBindingOptions<{ receive: false }, number>,
  WritableValue<number>
>();
assertMutualAssignable<
  ValueForBindingOptions<{ send: false; update: true }, number>,
  ReadableValue<number>
>();

// both directions off → never
assertAssignable<ValueForBindingOptions<{ receive: false; send: false }>, never>();

// Options-first API: inferred source requirement
function acceptSourceForOptions<O extends BindingOptions, T>(
  _options: O,
  _source: ValueForBindingOptions<O, T>
): void {}

acceptSourceForOptions({}, numberSource);
acceptSourceForOptions({ send: false }, _readableOnly);
acceptSourceForOptions({ receive: false }, _writableOnly);

// @ts-expect-error duplex defaults require ReadwriteValue, not readable-only
acceptSourceForOptions({}, _readableOnly);

// @ts-expect-error duplex defaults require ReadwriteValue, not writable-only
acceptSourceForOptions({ event: 'useraction' }, _writableOnly);

// @ts-expect-error send:false requires ReadableValue
acceptSourceForOptions({ send: false }, _writableOnly);

// @ts-expect-error receive:false requires WritableValue
acceptSourceForOptions({ receive: false }, _readableOnly);

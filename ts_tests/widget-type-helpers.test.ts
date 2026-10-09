import {
  Widget,
  WidgetOptionsOf,
  WidgetEventsOf,
  WidgetDeclaredEventsOf,
  EffectiveEvents,
  OptionKV,
  IWidgetOptions,
  IWidgetEvents,
} from '../src/index.js';
import { Fader, IFaderOptions, IFaderEvents } from '../src/index.js';
import { Button, IButtonEvents } from '../src/index.js';
import {
  Assert,
  Eq,
  HasKey,
  LacksKey,
  IsNever,
  cast,
  assertMutualAssignable,
} from './helpers.js';
import type {
  FaderInteractiveOptions,
  WidgetInteractiveOptions,
  WidgetInteractiveOptionsOf,
} from '../src/index.js';

// --- WidgetOptionsOf<T> ---

assertMutualAssignable<WidgetOptionsOf<Fader>, IFaderOptions>();
assertMutualAssignable<WidgetOptionsOf<Widget>, IWidgetOptions>();

type _NeverOptions = Assert<IsNever<WidgetOptionsOf<string>>>;
type _NeverOptionsNum = Assert<IsNever<WidgetOptionsOf<number>>>;
type _NeverOptionsObj = Assert<
  IsNever<WidgetOptionsOf<Record<string, unknown>>>
>;

// --- WidgetEventsOf<T> ---

type FaderEffectiveEvents = EffectiveEvents<
  IFaderOptions,
  IFaderEvents,
  FaderInteractiveOptions
>;
assertMutualAssignable<WidgetEventsOf<Fader>, FaderEffectiveEvents>();

type BaseEffectiveEvents = EffectiveEvents<
  IWidgetOptions,
  IWidgetEvents,
  WidgetInteractiveOptions
>;
assertMutualAssignable<WidgetEventsOf<Widget>, BaseEffectiveEvents>();

type _NeverEvents = Assert<IsNever<WidgetEventsOf<string>>>;
type _NeverEventsNum = Assert<IsNever<WidgetEventsOf<boolean>>>;

type _FaderEffHasScalechanged = Assert<
  HasKey<WidgetEventsOf<Fader>, 'scalechanged'>
>;
type _FaderEffHasSetValue = Assert<HasKey<WidgetEventsOf<Fader>, 'set_value'>>;
type _FaderEffHasClick = Assert<HasKey<WidgetEventsOf<Fader>, 'click'>>;

// userset / useraction narrowed to interactive options
type FaderUserset = WidgetEventsOf<Fader>['userset'];
type FaderUseraction = WidgetEventsOf<Fader>['useraction'];
assertMutualAssignable<
  Parameters<FaderUserset>,
  OptionKV<FaderInteractiveOptions>
>();
assertMutualAssignable<
  Parameters<FaderUseraction>,
  OptionKV<FaderInteractiveOptions>
>();

const _usersetOk: FaderUserset = (key, value) => {
  if (key === 'value') {
    const n: number = value;
    void n;
  }
};
// @ts-expect-error unknown interactive key
const _usersetBadKey: FaderUserset = (key: 'layout', value: unknown) => {
  void key;
  void value;
};
void _usersetOk;
void _usersetBadKey;

declare const fader: Fader;
fader.on('userset', (key, value) => {
  if (key === 'value') {
    const n: number = value;
    void n;
  }
});
fader.on('useraction', (...args) => {
  if (args[0] === 'value') {
    const n: number = args[1];
    void n;
  }
});
const _callUserset: FaderUserset = (..._args) => false;
_callUserset('value', 1);
// @ts-expect-error wrong value type for interactive key
_callUserset('value', 'nope');
// @ts-expect-error non-interactive option
_callUserset('layout', 'left');

// --- WidgetDeclaredEventsOf<T> ---

type FaderDeclared = WidgetDeclaredEventsOf<Fader>;
type ButtonDeclared = WidgetDeclaredEventsOf<Button>;

type _FaderDeclHasScalechanged = Assert<HasKey<FaderDeclared, 'scalechanged'>>;
type _FaderDeclLacksSetValue = Assert<LacksKey<FaderDeclared, 'set_value'>>;
type _FaderDeclHasClick = Assert<HasKey<FaderDeclared, 'click'>>;
type _FaderDeclLacksUseraction = Assert<LacksKey<FaderDeclared, 'useraction'>>;
type _FaderDeclLacksUserset = Assert<LacksKey<FaderDeclared, 'userset'>>;
type _FaderDeclLacksSet = Assert<LacksKey<FaderDeclared, 'set'>>;
type _FaderEffHasSet = Assert<HasKey<WidgetEventsOf<Fader>, 'set'>>;
type _FaderEffHasUserset = Assert<HasKey<WidgetEventsOf<Fader>, 'userset'>>;

type _ButtonDeclHasPressStart = Assert<HasKey<ButtonDeclared, 'press_start'>>;
type _ButtonDeclLacksSetLabel = Assert<LacksKey<ButtonDeclared, 'set_label'>>;

assertMutualAssignable<FaderDeclared, IFaderEvents>();
assertMutualAssignable<ButtonDeclared, IButtonEvents>();
assertMutualAssignable<WidgetDeclaredEventsOf<Widget>, IWidgetEvents>();

type _NeverDeclared = Assert<IsNever<WidgetDeclaredEventsOf<string>>>;

// --- WidgetInteractiveOptionsOf<T> ---

assertMutualAssignable<
  WidgetInteractiveOptionsOf<Fader>,
  FaderInteractiveOptions
>();
assertMutualAssignable<
  WidgetInteractiveOptionsOf<Widget>,
  WidgetInteractiveOptions
>();
type _FaderInteractiveExtendsWidget = Assert<
  FaderInteractiveOptions extends WidgetInteractiveOptions ? true : false
>;
type _FaderInteractiveHasValue = Assert<
  HasKey<WidgetInteractiveOptionsOf<Fader>, 'value'>
>;
type _FaderInteractiveLacksLayout = Assert<
  LacksKey<WidgetInteractiveOptionsOf<Fader>, 'layout'>
>;

// Value-level smoke (keeps cast() exercised)
const _faderOptions: WidgetOptionsOf<Fader> = cast<IFaderOptions>();
void _faderOptions;

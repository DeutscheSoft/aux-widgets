import {
  Widget,
  WidgetOptionsOf,
  WidgetEventsOf,
  WidgetDeclaredEventsOf,
  EffectiveEvents,
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

type FaderEffectiveEvents = EffectiveEvents<IFaderOptions, IFaderEvents>;
assertMutualAssignable<WidgetEventsOf<Fader>, FaderEffectiveEvents>();

type BaseEffectiveEvents = EffectiveEvents<IWidgetOptions, IWidgetEvents>;
assertMutualAssignable<WidgetEventsOf<Widget>, BaseEffectiveEvents>();

type _NeverEvents = Assert<IsNever<WidgetEventsOf<string>>>;
type _NeverEventsNum = Assert<IsNever<WidgetEventsOf<boolean>>>;

type _FaderEffHasScalechanged = Assert<
  HasKey<WidgetEventsOf<Fader>, 'scalechanged'>
>;
type _FaderEffHasSetValue = Assert<HasKey<WidgetEventsOf<Fader>, 'set_value'>>;
type _FaderEffHasClick = Assert<HasKey<WidgetEventsOf<Fader>, 'click'>>;

// --- WidgetDeclaredEventsOf<T> ---

type FaderDeclared = WidgetDeclaredEventsOf<Fader>;
type ButtonDeclared = WidgetDeclaredEventsOf<Button>;

type _FaderDeclHasScalechanged = Assert<HasKey<FaderDeclared, 'scalechanged'>>;
type _FaderDeclLacksSetValue = Assert<LacksKey<FaderDeclared, 'set_value'>>;
type _FaderDeclHasClick = Assert<HasKey<FaderDeclared, 'click'>>;
type _FaderDeclHasUseraction = Assert<HasKey<FaderDeclared, 'useraction'>>;

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

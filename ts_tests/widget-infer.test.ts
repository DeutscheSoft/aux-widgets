/**
 * Regression checks that widget type parameters infer without collapsing
 * to `any` / overly wide unions when using the public helpers.
 */
import type {
  Fader,
  Button,
  Widget,
  Base,
  IFaderOptions,
  IFaderEvents,
  IWidgetEvents,
  IButtonEvents,
  EffectiveEvents,
  FaderInteractiveOptions,
  WidgetOptionsOf,
  WidgetEventsOf,
  WidgetDeclaredEventsOf,
} from '../src/index.js';
import {
  Assert,
  Eq,
  HasKey,
  LacksKey,
  IsAny,
  Not,
  assertMutualAssignable,
} from './helpers.js';

type InfBaseE<T> = T extends Base<any, infer E> ? E : never;
type InfWidgetE<T> = T extends Widget<any, infer E> ? E : never;

type _Options = Assert<Eq<WidgetOptionsOf<Fader>, IFaderOptions>>;
type _Declared = Assert<Eq<WidgetDeclaredEventsOf<Fader>, IFaderEvents>>;
type _DeclaredBtn = Assert<Eq<WidgetDeclaredEventsOf<Button>, IButtonEvents>>;
type _DeclaredBase = Assert<Eq<WidgetDeclaredEventsOf<Widget>, IWidgetEvents>>;
type _Eff = Assert<
  Eq<
    WidgetEventsOf<Fader>,
    EffectiveEvents<IFaderOptions, IFaderEvents, FaderInteractiveOptions>
  >
>;
type _EffNotAny = Assert<Not<IsAny<WidgetEventsOf<Fader>>>>;
type _EffHasSet = Assert<HasKey<WidgetEventsOf<Fader>, 'set_value'>>;
type _DeclLacksSet = Assert<
  LacksKey<WidgetDeclaredEventsOf<Fader>, 'set_value'>
>;

type _BaseE = Assert<Eq<InfBaseE<Fader>, IFaderEvents>>;
type _WidgetE = Assert<Eq<InfWidgetE<Fader>, IFaderEvents>>;

// Two-parameter `extends Widget<infer O, infer E>` still resolves with the
// defaulted InteractiveOptions type parameter.
type FaderParams = Fader extends Widget<infer O, infer Evt> ? [O, Evt] : never;
assertMutualAssignable<FaderParams[0], IFaderOptions>();
assertMutualAssignable<FaderParams[1], IFaderEvents>();

type Expected = EffectiveEvents<
  IFaderOptions,
  IFaderEvents,
  FaderInteractiveOptions
>;
type Explicit = WidgetEventsOf<Fader<IFaderOptions, IFaderEvents>>;
assertMutualAssignable<Explicit, Expected>();
assertMutualAssignable<WidgetEventsOf<Fader>, Expected>();

type SetValueParams = Parameters<WidgetEventsOf<Fader>['set_value']>;
const setValueArgs: SetValueParams = [1, 'value', 0];
void setValueArgs;

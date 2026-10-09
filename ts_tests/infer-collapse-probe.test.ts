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
import { Assert, Eq, HasKey, LacksKey, IsAny, Not } from './helpers.js';

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

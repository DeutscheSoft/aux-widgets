import {
  Widget,
  WidgetOptionsOf,
  WidgetEventsOf,
  EffectiveEvents,
  IWidgetOptions,
  IWidgetEvents,
} from '../src/index.js';
import { Fader, IFaderOptions, IFaderEvents } from '../src/index.js';

// --- WidgetOptionsOf<T> ---

// For a Widget subclass, WidgetOptionsOf infers its TOptions.
const _faderOptions: WidgetOptionsOf<Fader> = (undefined as unknown) as IFaderOptions;
const _toFaderOptions: IFaderOptions = (undefined as unknown) as WidgetOptionsOf<
  Fader
>;

// For base Widget (no type args), options are IWidgetOptions.
const _baseOptions: WidgetOptionsOf<Widget> = (undefined as unknown) as IWidgetOptions;
const _toBaseOptions: IWidgetOptions = (undefined as unknown) as WidgetOptionsOf<
  Widget
>;

// When T does not extend Widget<>, result is never.
const _neverOptions: never = (undefined as unknown) as WidgetOptionsOf<string>;
const _neverOptionsNum: never = (undefined as unknown) as WidgetOptionsOf<
  number
>;
const _neverOptionsObj: never = (undefined as unknown) as WidgetOptionsOf<
  Record<string, unknown>
>;

// --- WidgetEventsOf<T> ---

// For a Widget subclass, WidgetEventsOf infers its TEffectiveEvents.
type FaderEffectiveEvents = EffectiveEvents<IFaderOptions, IFaderEvents>;
const _faderEvents: WidgetEventsOf<Fader> = (undefined as unknown) as FaderEffectiveEvents;
const _toFaderEvents: FaderEffectiveEvents = (undefined as unknown) as WidgetEventsOf<
  Fader
>;

// For base Widget, effective events match EffectiveEvents<IWidgetOptions, IWidgetEvents>.
type BaseEffectiveEvents = EffectiveEvents<IWidgetOptions, IWidgetEvents>;
const _baseEvents: WidgetEventsOf<Widget> = (undefined as unknown) as BaseEffectiveEvents;
const _toBaseEvents: BaseEffectiveEvents = (undefined as unknown) as WidgetEventsOf<
  Widget
>;

// When T does not extend Widget<>, result is never.
const _neverEvents: never = (undefined as unknown) as WidgetEventsOf<string>;
const _neverEventsNum: never = (undefined as unknown) as WidgetEventsOf<
  boolean
>;

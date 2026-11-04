/**
 * Simulates deriving React component props from widget types
 * (`componentFromWidget` in use-aux-widgets).
 */
import type {
  Fader,
  Button,
  WidgetOptionsOf,
  WidgetEventsOf,
  WidgetDeclaredEventsOf,
  IFaderOptions,
  IFaderEvents,
} from '../src/index.js';
import {
  Assert,
  Eq,
  HasKey,
  LacksKey,
  assertMutualAssignable,
} from './helpers.js';

type EventHandlerProps<E> = {
  [K in keyof E as K extends string ? `on${Capitalize<K>}` : never]?: E[K];
};

type PartialOptions<W> = Partial<WidgetOptionsOf<W>>;

type FaderProps = PartialOptions<Fader> &
  EventHandlerProps<WidgetEventsOf<Fader>> & {
    className?: string;
    style?: Record<string, string>;
    widgetRef?: (w: Fader | null) => void;
  };

const p1: FaderProps = { value: 1, label: 'x', min: -96 };
const p2: FaderProps = {
  onUseraction: (key, value) => {
    const _k: 'value' = key;
    const _v: number = value;
    void _k;
    void _v;
  },
};
const p3: FaderProps = {
  onSet_value: (value, key, prev) => {
    const _v: number = value;
    const _k: 'value' = key;
    const _p: number = prev;
    void _v;
    void _k;
    void _p;
  },
};
const p4: FaderProps = { onClick: (_ev) => {} };
void p1;
void p2;
void p3;
void p4;

type FromCtor = WidgetOptionsOf<InstanceType<typeof Fader>>;
assertMutualAssignable<WidgetOptionsOf<Fader>, FromCtor>();

type UsersetHandler = NonNullable<FaderProps['onUserset']>;
type UsersetParams = Parameters<UsersetHandler>;
type _UsersetKeyIsValue = Assert<Eq<UsersetParams[0], 'value'>>;
type _UsersetValueIsNumber = Assert<Eq<UsersetParams[1], number>>;

type _HasOnClick = Assert<HasKey<FaderProps, 'onClick'>>;
type _HasOnSetValue = Assert<HasKey<FaderProps, 'onSet_value'>>;
type _HasOnUserset = Assert<HasKey<FaderProps, 'onUserset'>>;
type _HasOnUseraction = Assert<HasKey<FaderProps, 'onUseraction'>>;
type _HasOnPressStart = Assert<
  HasKey<EventHandlerProps<WidgetEventsOf<Button>>, 'onPress_start'>
>;

// Host / internal keys are still on WidgetOptionsOf until React omits them.
type _HasInternal = Assert<HasKey<FaderProps, '_value'>>;
type _HasContainer = Assert<HasKey<FaderProps, 'container'>>;
type _HasElement = Assert<HasKey<FaderProps, 'element'>>;

type DeclaredOnly = EventHandlerProps<IFaderEvents>;
type DeclaredFromHelper = EventHandlerProps<WidgetDeclaredEventsOf<Fader>>;
type Effective = EventHandlerProps<WidgetEventsOf<Fader>>;

type _DeclaredLacksUseraction = Assert<LacksKey<DeclaredOnly, 'onUseraction'>>;
type _DeclaredLacksSetValue = Assert<LacksKey<DeclaredOnly, 'onSet_value'>>;
type _HelperLacksSetValue = Assert<LacksKey<DeclaredFromHelper, 'onSet_value'>>;
type _HelperHasScalechanged = Assert<
  HasKey<DeclaredFromHelper, 'onScalechanged'>
>;
type _HelperHasPressStart = Assert<
  HasKey<EventHandlerProps<WidgetDeclaredEventsOf<Button>>, 'onPress_start'>
>;
type _EffectiveHasSetValue = Assert<HasKey<Effective, 'onSet_value'>>;
type _EffectiveHasUseraction = Assert<HasKey<Effective, 'onUseraction'>>;
type _EffectiveHasSet = Assert<HasKey<Effective, 'onSet'>>;
type _DeclaredHasClick = Assert<HasKey<DeclaredOnly, 'onClick'>>;
type _EffectiveHasClick = Assert<HasKey<Effective, 'onClick'>>;

// Leading `_` filter alone is not enough for all non-public Fader options.
type PublicOptions<O> = {
  [K in keyof O as K extends `_${string}` ? never : K]: O[K];
};
type FaderPublic = PublicOptions<IFaderOptions>;
type _NoUnderscore = Assert<LacksKey<FaderPublic, '_value'>>;
type _StillHasDivision = Assert<HasKey<FaderPublic, 'division'>>;

type _OptsEq = Assert<Eq<WidgetOptionsOf<Fader>, IFaderOptions>>;

import {
  Assert,
  Not,
  Extends,
  Eq,
  IsAny,
  IsNever,
  IsUnknown,
  HasKey,
  LacksKey,
  cast,
  assertAssignable,
  assertMutualAssignable,
} from './helpers.js';

// --- Assert / Not ---

type _AssertTrue = Assert<true>;
// @ts-expect-error Assert rejects false
type _AssertFalse = Assert<false>;

type _NotTrue = Assert<Eq<Not<true>, false>>;
type _NotFalse = Assert<Eq<Not<false>, true>>;

// --- Extends ---

type _ExtendsSelf = Assert<Extends<number, number>>;
type _ExtendsWiden = Assert<Extends<'a', string>>;
type _ExtendsNarrow = Assert<Not<Extends<string, 'a'>>>;
type _ExtendsNever = Assert<Extends<never, string>>;
type _ExtendsUnion = Assert<Extends<'a' | 'b', string>>;

// Bare `A extends B` distributes over unions; Extends treats the union as one unit.
type _ExtendsUnionAsUnit = Assert<Not<Extends<'a' | 'b', 'a'>>>;

// --- Eq ---

type _EqIdentical = Assert<Eq<string, string>>;
type _EqLiterals = Assert<Eq<'x', 'x'>>;
type _EqNotWiden = Assert<Not<Eq<'a', string>>>;
type _EqNotNarrow = Assert<Not<Eq<string, 'a'>>>;
type _EqMutualAliases = Assert<Eq<{ a: number }, { a: number }>>;
type _EqOrderIndependentProps = Assert<Eq<{ a: 1; b: 2 }, { b: 2; a: 1 }>>;

// --- IsAny ---

type _IsAnyAny = Assert<IsAny<any>>;
type _IsAnyNumber = Assert<Not<IsAny<number>>>;
type _IsAnyString = Assert<Not<IsAny<string>>>;
type _IsAnyUnknown = Assert<Not<IsAny<unknown>>>;
type _IsAnyNever = Assert<Not<IsAny<never>>>;
type _IsAnyObject = Assert<Not<IsAny<object>>>;
type _IsAnyUnion = Assert<Not<IsAny<string | number>>>;

// --- IsNever ---

type _IsNeverNever = Assert<IsNever<never>>;
type _IsNeverNumber = Assert<Not<IsNever<number>>>;
type _IsNeverAny = Assert<Not<IsNever<any>>>;
type _IsNeverUnknown = Assert<Not<IsNever<unknown>>>;
type _IsNeverEmptyUnion = Assert<IsNever<string & number>>;

// --- IsUnknown ---

type _IsUnknownUnknown = Assert<IsUnknown<unknown>>;
type _IsUnknownAny = Assert<Not<IsUnknown<any>>>;
type _IsUnknownNumber = Assert<Not<IsUnknown<number>>>;
type _IsUnknownNever = Assert<Not<IsUnknown<never>>>;
type _IsUnknownObject = Assert<Not<IsUnknown<object>>>;

// --- HasKey / LacksKey ---

type Sample = { a: number; b?: string };

type _HasA = Assert<HasKey<Sample, 'a'>>;
type _HasB = Assert<HasKey<Sample, 'b'>>;
type _LacksC = Assert<LacksKey<Sample, 'c'>>;
type _LacksA = Assert<Not<LacksKey<Sample, 'a'>>>;

// Union keys distribute: result is `true | false` (= `boolean`), not a single flag.
type _HasKeyUnionIsBoolean = Assert<Eq<HasKey<Sample, 'a' | 'z'>, boolean>>;

// --- cast / assertAssignable / assertMutualAssignable ---

const n: number = cast<number>();
const s: string = cast<'hello'>();
void n;
void s;

assertAssignable<1, number>();
assertAssignable<'a', string>();
assertAssignable<never, string>();
assertMutualAssignable<string, string>();
assertMutualAssignable<{ x: number }, { x: number }>();

type WidgetOpts = { value: number; label: string };
assertMutualAssignable<WidgetOpts, { value: number; label: string }>();

// @ts-expect-error number is not assignable to string
assertAssignable<number, string>();

// @ts-expect-error string is not mutually assignable with number
assertMutualAssignable<string, number>();

// @ts-expect-error extra required property on one side
assertMutualAssignable<{ a: 1 }, { a: 1; b: 2 }>();

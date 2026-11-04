/**
 * Shared type-level helpers for the TypeScript test suite.
 *
 * These are compile-time only: a failing assertion is a type error from `tsc`.
 */

/** Fails typechecking unless `T` is exactly `true`. */
export type Assert<T extends true> = T;

/** Boolean negation for `true` / `false` type-level flags. */
export type Not<T extends boolean> = T extends true ? false : true;

/**
 * `true` if `A` is assignable to `B`, otherwise `false`.
 * Tuple wrappers avoid distributive conditional behavior.
 */
export type Extends<A, B> = [A] extends [B] ? true : false;

/**
 * `true` if `A` and `B` are mutually assignable, otherwise `false`.
 */
export type Eq<A, B> = Extends<A, B> extends true
  ? Extends<B, A> extends true
    ? true
    : false
  : false;

/** `true` if `T` is `any`. */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/** `true` if `T` is `never`. */
export type IsNever<T> = [T] extends [never] ? true : false;

/** `true` if `T` is `unknown` (and not `any`). */
export type IsUnknown<T> = IsAny<T> extends true
  ? false
  : unknown extends T
  ? true
  : false;

/** `true` if `K` is a key of `T`. Prefer a single key; unions distribute. */
export type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

/** `true` if `K` is not a key of `T`. Prefer a single key; unions distribute. */
export type LacksKey<T, K extends PropertyKey> = Not<HasKey<T, K>>;

/**
 * Produce a value of type `T` without a real runtime value.
 * Useful for assignability checks: `const x: A = cast<B>()`.
 */
export function cast<T>(): T {
  return (undefined as unknown) as T;
}

/**
 * One-way assignability at the call site: `Source` must extend `Target`.
 *
 * @example
 * assertAssignable<1, number>();
 * // @ts-expect-error
 * assertAssignable<number, string>();
 */
export function assertAssignable<Source extends Target, Target>(): void {}

/**
 * Bidirectional assignability at the call site.
 * Fails with a tuple-parameter error when `A` and `B` are not mutually assignable.
 *
 * @example
 * assertMutualAssignable<string, string>();
 * // @ts-expect-error
 * assertMutualAssignable<string, number>();
 */
export function assertMutualAssignable<A, B>(
  ..._args: Eq<A, B> extends true
    ? []
    : [error: 'Types are not mutually assignable']
): void {}

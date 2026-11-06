import type { Events } from '../../events.js';

/**
 * Open property bag on matrix model objects. Application-specific keys are
 * always allowed alongside any known fields from a tighter `P`.
 */
export type MatrixDatumProperties = Record<string, unknown>;

/**
 * Init object for a {@link Datum}: known fields from `P`, plus any extra
 * keys from {@link MatrixDatumProperties}.
 *
 * Known property interfaces (e.g. {@link TreeNodeProperties}) intentionally do
 * **not** extend {@link MatrixDatumProperties}: intersecting an index signature
 * into `P` would widen `keyof P` to `string` and erase typed `get`/`set` for
 * known keys. Extras are layered here (and via undeclared string keys on
 * {@link Datum.set} / {@link Datum.get}) instead.
 */
export type DatumInit<P extends object> = Partial<P> & MatrixDatumProperties;

/**
 * Base class for data model objects.
 *
 * `P` describes known property names/types. Subclasses tighten `P` (and may
 * add accessors). Additional undeclared properties are always allowed via
 * {@link Datum.set} / {@link Datum.get} (typed as `unknown`) so applications
 * can carry their own data on model objects.
 */
export declare class Datum<
  P extends object = MatrixDatumProperties
> extends Events {
  constructor(o?: DatumInit<P> | null);

  /**
   * Set a property. Known keys from `P` are typed; any other string key
   * accepts `unknown` (application payload).
   */
  set<K extends string>(
    name: K,
    value: K extends keyof P ? P[K] : unknown
  ): K extends keyof P ? P[K] : unknown;

  /**
   * Get a property. Known keys from `P` are typed; other keys are `unknown`.
   */
  get<K extends string>(name: K): K extends keyof P ? P[K] : unknown;

  /**
   * Observe a property. The callback is called immediately with the current
   * value and whenever the property changes.
   */
  observe<K extends string>(
    name: K,
    callback: (value: K extends keyof P ? P[K] : unknown) => void
  ): () => void;
}

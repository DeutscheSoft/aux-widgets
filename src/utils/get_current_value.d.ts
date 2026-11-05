import type { ReadableValue } from '../values.interface.js';

/**
 * Returns the value delivered synchronously during `subscribe`, or
 * `initialValue` if the source did not emit before `subscribe` returned.
 */
export function getCurrentValue<T>(
  readable: ReadableValue<T>,
  initialValue: T
): T;

export function getCurrentValue<T>(readable: ReadableValue<T>): T | undefined;

export function getCurrentValue<T>(
  readable: ReadableValue<T>,
  initialValue?: T
): T | undefined;

/**
 * This file exists in both `@deutschesoft/aux-widgets` and `@deutschesoft/awml`
 * (`src/utils/get_current_value.d.ts`) and must be kept in sync.
 */

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

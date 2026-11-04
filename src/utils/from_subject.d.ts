import type { ReadwriteValue, SubjectLike } from '../values.interface.js';

/**
 * Wraps a {@link SubjectLike} as a {@link ReadwriteValue} by mapping
 * `set(value)` to `subject.next(value)`. `subscribe` is forwarded unchanged.
 */
export function fromSubject<T>(subject: SubjectLike<T>): ReadwriteValue<T>;

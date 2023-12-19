import { objectShadows } from './compare_objects.js';

function isNonEmptyObject(o) {
  if (o && typeof o === 'object')
    for (const key in o) if (Object.hasOwn(o, key)) return true;

  return false;
}

function filterNullOrEmpty(args) {
  for (let i = 0; i < args.length; i++) {
    const o = args[i];

    if (o) {
      if (typeof o !== 'object')
        throw new TypeError('Bad argument to mergeObjects.');

      if (isNonEmptyObject(o)) continue;
    }

    return args.filter((entry) => isNonEmptyObject(entry));
  }

  return args;
}

const emptyObject = {};

export function mergeObjects(...args) {
  if (!args.length) throw new Error('Too few arguments to mergeObjects().');

  const nonEmptyArgs = filterNullOrEmpty(args);
  const length = nonEmptyArgs.length;

  if (!length) return emptyObject;

  let first = 0;
  let last = length - 1;

  while (
    first < last &&
    objectShadows(nonEmptyArgs[last - 1], nonEmptyArgs[last])
  ) {
    nonEmptyArgs[last - 1] = nonEmptyArgs[last];
    last--;
  }

  while (
    first + 1 < last &&
    objectShadows(nonEmptyArgs[first], nonEmptyArgs[last])
  )
    first++;

  if (last === first) return nonEmptyArgs[first];

  return Object.assign({}, ...nonEmptyArgs.slice(first, last + 1));
}

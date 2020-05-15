function typecheck(v, typename) {
  if (typeof v !== typename) throw new TypeError('expected ' + typename + '.');
}

export function typecheck_function(v) {
  typecheck(v, 'function');
}

export function typecheck_number(v) {
  typecheck(v, 'number');
}

export function typecheck_object(v) {
  typecheck(v, 'object');
}

export function typecheck_string(v) {
  typecheck(v, 'string');
}

export function typecheck_instance(v, cl) {
  if (typeof v !== 'object' || !(v instanceof cl))
    throw new TypeError('expected instance of ' + cl.name);
}

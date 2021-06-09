/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

// NOTE: IE9 will throw errors when console is used without debugging tools. In general, it
// is better for log/warn to silently fail in case of error. This unfortunately means that
// warnings might be lost, but probably better than having diagnostics and debugging code
// break an application

/**
 * @module utils/log
 */

/* jshint -W117 */

/**
 * Generates an error to the JavaScript console. This is virtually identical to console.error, however
 * it can safely be used in browsers which do not support it.
 *
 * @param {...*} args
 * @function error
 */

/* jshint -W117 */

export function error() {
  try {
    console.error.apply(console, arguments);
  } catch (e) { /* empty */ }
}

/**
 * Generates a warning to the JavaScript console. This is virtually identical to console.warn, however
 * it can safely be used in browsers which do not support it.
 *
 * @param {...*} args
 * @function warn
 */
export function warn() {
  try {
    console.warn.apply(console, arguments);
  } catch (e) { /* empty */ }
}
/**
 * Generates a log message to the JavaScript console. This is virtually identical to console.log, however
 * it can safely be used in browsers which do not support it.
 *
 * @param {...*} args
 * @function log
 */
export function log() {
  if (!console) return;
  try {
    console.log.apply(console, arguments);
  } catch (e) { /* empty */ }
}

/* jshint +W117 */

export function printWidgetTree(w, depth) {
  if (!depth) depth = 0;

  const print = function (fmt) {
    const extra = Array.prototype.slice.call(arguments, 1);
    if (depth) fmt = nchars(depth, ' ') + fmt;
    const args = [fmt];
    log.apply(this, args.concat(extra));
  };

  var nchars = function (n, c) {
    const ret = new Array(n);

    for (let i = 0; i < n; i++) ret[i] = c;

    return ret.join('');
  };

  const C = w.children;
  const nchildren = C ? C.length : 0;

  const state = [];

  state.push(w._drawn ? 'show' : 'hide');

  if (w.needs_redraw) state.push('redraw');
  if (w.needs_resize) state.push('resize');

  print('%s (%s, children: %o)', w._class, state.join(' '), nchildren);

  if (C) {
    for (let i = 0; i < C.length; i++) printWidgetTree(C[i], depth + 1);
  }
}

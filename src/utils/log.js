// NOTE: IE9 will throw errors when console is used without debugging tools. In general, it
// is better for log/warn to silently fail in case of error. This unfortunately means that
// warnings might be lost, but probably better than having diagnostics and debugging code
// break an application

/**
 * @module utils/log
 */

/**
 * Generates an error to the JavaScript console. This is virtually identical to console.error, however
 * it can safely be used in browsers which do not support it.
 *
 * @param {...*} args
 * @function error
 */
export function error() {
    try {
        console.error.apply(console, arguments);
    } catch(e) {}
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
    } catch(e) {}
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
    } catch(e) {}
}

export function print_widget_tree(w, depth) {
  if (!depth) depth = 0;

  var print = function(fmt) {
    var extra = Array.prototype.slice.call(arguments, 1);
    if (depth) fmt = nchars(depth, " ") + fmt;
    var args = [ fmt ];
    log.apply(this, args.concat(extra));
  };

  var nchars = function(n, c) {
    var ret = new Array(n);

    for (var i = 0; i < n; i++) ret[i] = c;

    return ret.join("");
  };

  var C = w.children;
  var nchildren = C ? C.length : 0;

  var state = [ ];

  state.push(w._drawn ? "show" : "hide");

  if (w.needs_redraw) state.push("redraw");
  if (w.needs_resize) state.push("resize");


  print("%s (%s, children: %o)", w._class, state.join(" "), nchildren);

  if (C) {
    for (var i = 0; i < C.length; i++) print_widget_tree(C[i], depth+1);
  }
}


/* Detection and handling for passive event handler support.
 * The chrome team has threatened to make passive event handlers
 * the default in a future version. To make sure that this does
 * not break our code, we explicitly register 'active' event handlers
 * for most cases.
 */

/* generic code, supports node arrays */
export function add_event_listener(e, type, cb, options) {
    if (Array.isArray(e)) {
        for (var i = 0; i < e.length; i++)
            e[i].addEventListener(type, cb, options);
    } else e.addEventListener(type, cb, options);
}
export function remove_event_listener(e, type, cb, options) {
    if (Array.isArray(e)) {
        for (var i = 0; i < e.length; i++)
            e[i].removeEventListener(type, cb, options);
    } else e.removeEventListener(type, cb, options);
}

/* Detect if the 'passive' option is supported.
 * This code has been borrowed from mdn */
var passiveSupported = false;

try {
  var options = Object.defineProperty({}, "passive", {
    get: function() {
      passiveSupported = true;
      return true;
    }
  });

  window.addEventListener("test", null, options);
  window.removeEventListener("test", null);
} catch(err) {}

var active_options, passive_options;

if (passiveSupported) {
  active_options = { passive: false };
  passive_options = { passive: true };
} else {
  active_options = false;
  passive_options = false;
}

export function add_active_event_listener(e, type, cb) {
  add_event_listener(e, type, cb, active_options);
}
export function remove_active_event_listener(e, type, cb) {
  remove_event_listener(e, type, cb, active_options);
}
export function add_passive_event_listener(e, type, cb) {
  add_event_listener(e, type, cb, passive_options);
}
export function remove_passive_event_listener(e, type, cb) {
  remove_event_listener(e, type, cb, passive_options);
}


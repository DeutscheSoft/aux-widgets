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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { define_class, add_static_event } from './widget_helpers.js';
import { add_class, remove_class } from './utils/dom.js';
import { warn } from './utils/log.js';
import { Widget } from './widgets/widget.js';

function get_child_options(parent, name, options, config) {
  var ret = {};
  var pref = name + '.';

  var inherit_options = !!config.inherit_options;
  var blacklist_options = config.blacklist_options || [];

  let default_options = config.default_options;

  if (default_options) {
    if (typeof default_options === 'function')
      default_options = default_options.call(parent);

    ret = Object.assign(ret, default_options);
  }

  for (let key in options) {
    if (key.startsWith(pref)) {
      ret[key.substr(pref.length)] = options[key];
    } else if (inherit_options && blacklist_options.indexOf(key) < 0) {
      if (
        key in config.create.prototype._options &&
        !(key in Widget.prototype._options)
      ) {
        ret[key] = options[key];
      }
    }
  }

  const map_options = config.map_options;

  if (map_options) {
    for (let key in map_options) {
      if (key in options) {
        if (key in ret && options[key] === parent.get_default(key)) {
          continue;
        }

        ret[map_options[key]] = options[key];
      }
    }
  }

  return ret;
}

export function inherit_child_options(dst, child_name, src, blacklist) {
  if (!blacklist) blacklist = [];

  const set_cb = function (value, key) {
    const C = this[child_name];

    if (C) C.set(key, value);
  };

  for (let tmp in src.prototype._options) {
    if (tmp in dst.prototype._options) continue;
    if (blacklist.indexOf(tmp) > -1) continue;
    add_static_event(dst, 'set_' + tmp, set_cb);
    if (!dst.prototype._options[tmp])
      dst.prototype._options[tmp] = src.prototype._options[tmp];
    if (!dst.prototype.options[tmp])
      dst.prototype.options[tmp] = src.prototype.options[tmp];
  }
}

export function define_child_widget(widget, name, config) {
  /**
   * @function define_child_widget
   *
   * @description Defines a {@link Widget} as a child for another widget. This function
   * is used internally to simplify widget definitions. E.g. the {@link Icon} of a
   * {@link Button} is defined as a child widget. Child widgets
   * are created/added after the initialization of the parent widget.
   * If not configured explicitly, all options of the child widget can
   * be accessed via <code>Widget.options[config.name + "." + option]</code>
   * on the parent widget.
   *
   * @param {Widget} widget - The {@link Widget} to add the ChildWidget to.
   * @param {string} name - The identifier of the element inside the parent element, <code>Widget[config.name]</code>.
   * @param {object} config - The configuration of the child element.
   *
   * @param {Widget} config.create - A Widget class derivate to be used as child widget.
   * @param {boolean} [config.fixed] - A fixed child widget cannot be removed after initialization.
   * @param {boolean} [config.show=false] - Show/hide a non-fixed child widget on initialization.
   * @param {string} [config.option="show_"+config.name] - A custom option of the parent widget
   *     to determine the visibility of the child element. If this is
   *     <code>null</code>, <code>Widget.options["show_"+  config.name]</code>
   *     is used to toggle its visibility. The child element is visible, if
   *     this options is <code>!== false</code>.
   * @param {function} [config.append] - A function overriding the generic
   *     append mechanism. If not <code>null</code>, this function is
   *     supposed to take care of adding the child widget to the parent
   *     widget's DOM. Otherwise the element of the child widget is added
   *     to the element of the parent widget.
   * @param {boolean} [config.inherit_options=false] - Defines if both widgets share the
   *     same set of options. If <code>true</code>, Setting an option on the
   *     parent widget also sets the same option on the child widget. If <code>false</code>,
   *     the options of the child widget can be accessed via <code>options[config.name + "." + option]</code>
   *     in the parent widget.
   * @param {array} [config.map_options=[]] - An array containing option names to be
   *     mapped between parent and child widget. If one of these options is set
   *     on the parent widget, it also gets set on the child widget. This is
   *     a fine-grained version of <code>config.inherit-options</code>.
   * @param {boolean} [config.userset_ignore=false] - Do not care about the <code>userset</code>
   *     event of the parent widget, only keep track of <code>set</code>.
   * @param {boolean} [config.userset_delegate=false] - Delegates all user interaction from
   *     the child to the parent element. If the user triggers an event on
   *     the child widget, the <code>userset</code> function of the parent
   *     element is called.
   * @param {array} [config.static_events=[]] - An array of static events to be
   *     added to the parent widget. Each entry is a mapping between
   *     the name of the event and the callback function.
   * @param {boolean} [config.toggle_class=false] - Defines if the parent widget
   *     receives the class <code>.aux-has-[name]</code> as soon as
   *     the child element is shown.
   * @param {array<string>} [config.blacklist_options] - Array containing options names
   *     which are skipped on `inherit_options`.
   * @param {boolean} [config.map_interacting=true] - If true, the interacting
   *     property will be true if it is true in the child.
   */

  var p = widget.prototype;
  var key = config.option || 'show_' + name;
  var tmp, m;
  var static_events = {};
  var map_interacting = config.map_interacting !== false;

  if (!config.userset_ignore)
    static_events.userset =
      config.inherit_options || config.userset_delegate
        ? function (key, value) {
            this.parent.userset(key, value);
            return false;
          }
        : function (key, value) {
            this.parent.userset(name + '.' + key, value);
            return false;
          };

  if ((m = config.static_events)) Object.assign(static_events, m);

  if (config.create === void 0) {
    warn("'create' is undefined. Skipping child widget ", name);
    return;
  }

  if (map_interacting) {
    static_events.set_interacting = function (value) {
      var self = this.parent;

      if (value) self.startInteracting();
      else self.stopInteracting();
    };
  }

  const ChildWidget = define_class({
    Extends: config.create,
    static_events: static_events,
  });

  /* trigger child widget creation after initialization */
  add_static_event(widget, 'initialize', function () {
    /* we do not want to trash the class cache */
    this[name] = null;
  });
  add_static_event(widget, 'initialize_children', function () {
    /* we do not want to trash the class cache */
    if (!this[name]) {
      this.set(key, this.options[key]);
    }
  });

  /* clean up on destroy */
  add_static_event(widget, 'destroy', function () {
    const child = this[name];

    if (child) {
      child.destroy();
      this[name] = null;
    }
  });

  var fixed = config.fixed;
  var append = config.append;

  if (append === void 0) append = true;

  /* child widget creation */
  add_static_event(widget, 'set_' + key, function (val) {
    var C = this[name];
    var show = fixed || val !== false;
    if (show && !C) {
      var O = get_child_options(this, name, this.options, config);
      var w = new ChildWidget(O);
      this.add_child(w);
      this[name] = w;
    } else if (!show && C) {
      if (map_interacting && C.get('interacting')) {
        this.stopInteracting();
      }
      this[name] = null;
      if (config.toggle_class) remove_class(this.element, 'aux-has-' + name);
      C.destroy();
    }
    this.trigger_resize();
  });
  add_static_event(widget, 'redraw', function () {
    const show = fixed || this.options[key];
    let C = this[name];

    if (show && C && !C.element.parentNode) {
      const E = this.element;

      if (config.toggle_class) add_class(E, 'aux-has-' + name);

      if (append === true) {
        E.appendChild(C.element);
      } else if (typeof append === 'function') {
        append.call(this);
      }

      this.trigger_resize();
    }
  });
  var set_cb = function (val, key) {
    if (this[name]) this[name].set(key.substr(name.length + 1), val);
  };

  for (tmp in ChildWidget.prototype._options) {
    add_static_event(widget, 'set_' + name + '.' + tmp, set_cb);
    p._options[name + '.' + tmp] = ChildWidget.prototype._options[tmp];
  }

  /* direct option inherit */
  var blacklist_options = config.blacklist_options || [];
  if (config.inherit_options) {
    set_cb = function (val, key) {
      if (this[name]) this[name].set(key, val);
    };
    for (tmp in ChildWidget.prototype._options) {
      if (tmp in Widget.prototype._options) continue;
      if (blacklist_options.indexOf(tmp) > -1) continue;
      add_static_event(widget, 'set_' + tmp, set_cb);
      if (!p._options[tmp])
        p._options[tmp] = ChildWidget.prototype._options[tmp];
    }
  }
  set_cb = function (key) {
    return function (val) {
      if (this[name]) this[name].set(key, val);
    };
  };

  const map_options = config.map_options;

  if (map_options) {
    for (let parent_key in map_options) {
      const child_key = map_options[parent_key];

      if (!(parent_key in p._options)) {
        p._options[parent_key] = ChildWidget.prototype._options[child_key];
        p.options[parent_key] = ChildWidget.prototype.options[child_key];
      }
      add_static_event(widget, 'set_' + parent_key, set_cb(child_key));
    }
  }
  if (!config.options) {
    if (!p._options[key]) {
      p._options[key] = 'boolean';
      p.options[key] = fixed || !!config.show;
    }
  }
}

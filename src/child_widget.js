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

import { addClass, removeClass } from './utils/dom.js';
import { warn } from './utils/log.js';
import { Widget } from './widgets/widget.js';
import { defineRender } from './renderer.js';

function getChildOptions(parent, name, options, config) {
  let ret = {};
  const pref = name + '.';

  const inherit_options = !!config.inherit_options;
  const blacklist_options = config.blacklist_options || [];

  let default_options = config.default_options;

  if (default_options) {
    if (typeof default_options === 'function')
      default_options = default_options.call(parent);

    ret = Object.assign(ret, default_options);
  }

  for (const key in options) {
    if (key.startsWith(pref)) {
      ret[key.substr(pref.length)] = options[key];
    } else if (inherit_options && blacklist_options.indexOf(key) < 0) {
      if (Object.prototype.hasOwnProperty.call(options, pref + key)) continue;
      if (config.create.hasOption(key) && !Widget.hasOption(key)) {
        ret[key] = options[key];
      }
    }
  }

  const map_options = config.map_options;

  if (map_options) {
    for (const key in map_options) {
      if (key in options) {
        if (key in ret && options[key] === parent.getDefault(key)) {
          continue;
        }

        ret[map_options[key]] = options[key];
      }
    }
  }

  return ret;
}

export function inheritChildOptions(dst, child_name, src, blacklist) {
  if (!blacklist) blacklist = [];

  const setCallback = function (value, key) {
    const C = this[child_name];

    if (C) C.set(key, value);
  };

  for (const tmp in src.getOptionTypes()) {
    if (dst.hasOption(tmp)) continue;
    if (blacklist.indexOf(tmp) > -1) continue;
    dst.addStaticEvent('set_' + tmp, setCallback);
    if (!dst.hasOption(tmp))
      dst.defineOption(tmp, src.getOptionType(tmp), src.getDefault(tmp));
  }
}

export function defineChildWidget(widget, name, config) {
  /**
   * @function defineChildWidget
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
   * @param {boolean} [config.no_resize=false] - If true, no `triggerResize` is called on the parent
   *     as soon as a child is added or removed.
   */

  const key = config.option || 'show_' + name;
  let tmp, m;
  const static_events = {};
  const map_interacting = config.map_interacting !== false;

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
      const self = this.parent;

      if (value) self.startInteracting();
      else self.stopInteracting();
    };
  }

  class ChildWidget extends config.create {
    static get _options() {
      return config.create.getOptionTypes();
    }

    static get static_events() {
      return static_events;
    }
  }

  /* trigger child widget creation after initialization */
  widget.addStaticEvent('initialize', function () {
    /* we do not want to trash the class cache */
    this[name] = null;
  });
  widget.addStaticEvent('initialize_children', function () {
    /* we do not want to trash the class cache */
    if (!this[name]) {
      this.set(key, this.options[key]);
    }
  });

  /* clean up on destroy */
  widget.addStaticEvent('destroy', function () {
    const child = this[name];

    if (child) {
      child.destroy();
      this[name] = null;
    }
  });

  const fixed = config.fixed;
  let append = config.append;

  if (append === void 0) append = true;

  /* child widget creation */
  widget.addStaticEvent('set_' + key, function (val) {
    const C = this[name];
    const show = fixed || val !== false;
    if (show && !C) {
      const O = getChildOptions(this, name, this.options, config);
      const w = new ChildWidget(O);
      this.addChild(w);
      this[name] = w;
    } else if (!show && C) {
      if (map_interacting && C.get('interacting')) {
        this.stopInteracting();
      }
      this[name] = null;
      if (config.toggle_class) removeClass(this.element, 'aux-has-' + name);
      C.destroy();
    }
    if (!config.no_resize) this.triggerResize();
  });
  widget.addTask(defineRender(fixed ? [] : [ key ], function (show) {
    if (fixed) show = true;
    const C = this[name];

    if (show && C && !C.element.parentNode) {
      const E = this.element;

      if (config.toggle_class) addClass(E, 'aux-has-' + name);

      if (append === true) {
        E.appendChild(C.element);
      } else if (typeof append === 'function') {
        append.call(this);
      }
      if (!config.no_resize) this.triggerResize();
    }
  }));
  let setCallback = function (val, key) {
    if (this[name]) this[name].set(key.substr(name.length + 1), val);
  };

  for (tmp in ChildWidget.getOptionTypes()) {
    widget.addStaticEvent('set_' + name + '.' + tmp, setCallback);
    widget.defineOption(name + '.' + tmp, ChildWidget.getOptionType(tmp));
  }

  /* direct option inherit */
  const blacklist_options = config.blacklist_options || [];
  if (config.inherit_options) {
    setCallback = function (val, key) {
      if (this[name]) this[name].set(key, val);
    };
    for (tmp in ChildWidget.getOptionTypes()) {
      if (Widget.hasOption(tmp)) continue;
      if (blacklist_options.indexOf(tmp) > -1) continue;
      widget.addStaticEvent('set_' + tmp, setCallback);
      if (!widget.hasOption(tmp))
        widget.defineOption(tmp, ChildWidget.getOptionType(tmp));
    }
  }
  setCallback = function (key) {
    return function (val) {
      if (this[name]) this[name].set(key, val);
    };
  };

  const map_options = config.map_options;

  if (map_options) {
    for (const parent_key in map_options) {
      const child_key = map_options[parent_key];

      if (!widget.hasOption(parent_key)) {
        widget.defineOption(
          parent_key,
          ChildWidget.getOptionType(child_key),
          ChildWidget.getDefault(child_key)
        );
      }
      widget.addStaticEvent('set_' + parent_key, setCallback(child_key));
    }
  }
  if (!config.options && !widget.hasOption(key)) {
    widget.defineOption(key, 'boolean', fixed || !!config.show);
  }
}

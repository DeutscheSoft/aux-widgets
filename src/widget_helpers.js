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

import { toggleClass, element } from './utils/dom.js';

export function addEvent(to, event, fun) {
  const tmp = to[event];

  if (!tmp) {
    to[event] = fun;
  } else if (Array.isArray(tmp)) {
    to[event] = tmp.concat([fun]);
  } else {
    to[event] = [tmp, fun];
  }
}

export function removeEvent(from, event, fun) {
  const tmp = from[event];
  if (!tmp) return;
  if (Array.isArray(tmp)) {
    from[event] = tmp.filter((f) => f !== fun);
    if (tmp.length === 1) from[event] = tmp[0];
    else if (tmp.length === 0) delete from[event];
  } else if (tmp === fun) {
    delete from[event];
  }
}

export function addStaticEvent(w, event, fun) {
  const p = w.prototype;
  let e;
  if (!Object.prototype.hasOwnProperty.call(p, 'static_events')) {
    if (p.static_events) {
      p.static_events = e = Object.assign({}, p.static_events);
    } else {
      p.static_events = e = {};
    }
  } else e = p.static_events;
  addEvent(e, event, fun);
}

export function defineChildElement(widget, name, config) {
  /**
   * @function defineChildElement
   *
   * @description Creates a HTMLElement as a child for a widget. Is used to simplify
   * widget definitions. E.g. the tiny marker used to display the back-end
   * value is a simple DIV added using child element. The generic element
   * is a DIV added to Widget.element with the class
   * <code>.aux-[name]</code>. Default creating and adding can be
   * overwritten with custom callback functions.
   *
   * @param {Widget} widget - The {@link Widget} to add the child element to.
   * @param {string} name - The identifier of the element. It will be prefixed
   *     by an underscore <code>Widget["_" + config.name]</code>.
   * @param {object} config - The configuration of the child element.
   *
   * @param {boolean} [config.show=false] - Show/hide the child element on initialization.
   * @param {string} [config.option="show_"+config.name] - A custom option of the parent widget
   *     to determine the visibility of the child element. If this is
   *     <code>null</code>, <code>Widget.options["show_"+  config.name]</code>
   *     is used to toggle its visibility. The child element is visible, if
   *     this options is <code>!== false</code>.
   * @param {function} [config.display_check] - A function overriding the
   *     generic <code>show_option</code> behavior. If set, this function
   *     is called with the value of <code>show_option</code> as argument
   *     as soon as it gets set and is supposed to return a boolean
   *     defining the visibility of the element.
   * @param {function} [config.append] - A function overriding the generic
   *     append mechanism. If not <code>null</code>, this function is
   *     supposed to take care of adding the child element to the parent
   *     widget's DOM.
   * @param {function} [config.create] - A function overriding the generic
   *     creation mechanism. If not <code>null</code>, this function is
   *     supposed to create and return a DOM element to be added to the
   *     parent widget.
   * @param {boolean} [config.toggle_class=false] - Defines if the parent widget
   *     receives the class <code>.aux-has-[name]</code> as soon as
   *     the child element is shown.
   * @param {array} [config.draw_options] - A list of options of the parent
   *     widget which are supposed to trigger a check if the element has to
   *     be added or removed.
   * @param {function} [config.draw] - A function to be called on redraw.
   *
   */
  const p = widget.prototype;
  const show_option = config.option || 'show_' + name;
  const index = '_' + name;

  const display_check = config.display_check;

  /* This is done to make sure that the object property is created
   * inside of the constructor. Otherwise, if we add the widget later
   * might be turned into a generic mapping.
   */
  addStaticEvent(widget, 'initialize', function () {
    this[index] = null;
  });

  /* trigger child element creation after initialization */
  addStaticEvent(widget, 'initialize_children', function () {
    this.set(show_option, this.options[show_option]);
  });

  /* clean up on destroy */
  addStaticEvent(widget, 'destroy', function () {
    if (this[index]) {
      this[index].remove();
      this[index] = null;
    }
  });

  let append = config.append;
  let create = config.create;

  if (create === void 0)
    create = function () {
      return element('div', 'aux-' + name);
    };
  if (append === void 0)
    append = function () {
      this.element.appendChild(this[index]);
    };

  addStaticEvent(widget, 'set_' + show_option, function (value) {
    let C = this[index];
    const show = display_check ? display_check(value) : value !== false;
    if (show === !!C) return;
    if (show && !C) {
      C = create.call(this);
      this[index] = C;
      append.call(this, this.options);
    } else if (C && !show) {
      this[index] = null;
      C.remove();
    }
    if (config.toggle_class) toggleClass(this.element, 'aux-has-' + name, show);
    this.triggerResize();
  });

  if (config.draw) {
    let m = config.draw_options;

    if (!m) m = [show_option];
    else m.push(show_option);

    for (let i = 0; i < m.length; i++) {
      addStaticEvent(widget, 'set_' + m[i], function () {
        const value = this.options[show_option];
        const show = display_check ? display_check(value) : value !== false;

        if (show) this.drawOnce(config.draw);
      });
    }
  }

  if (p._options[show_option] === void 0) {
    p._options[show_option] = 'boolean';
    p.options[show_option] = !!config.show;
  }
}

function arrayify(x) {
  if (!Array.isArray(x)) x = [x];
  return x;
}

function mergeStaticEvents(a, b) {
  let event;
  if (!a) return b;
  if (!b) return Object.assign({}, a);
  for (event in a) {
    const tmp = a[event];
    if (Object.prototype.hasOwnProperty.call(b, event)) {
      b[event] = arrayify(tmp).concat(arrayify(b[event]));
    } else {
      b[event] = Array.isArray(tmp) ? tmp.slice(0) : tmp;
    }
  }
  return Object.assign({}, a, b);
}

export function defineClass(o) {
  let methods;

  if (!o.options) o.options = {};

  const Extends = o.Extends;

  if (Extends) {
    const tmp = Extends.prototype;
    o.options = Object.assign({}, tmp.options, o.options);
    if (o.static_events)
      o.static_events = mergeStaticEvents(tmp.static_events, o.static_events);
    methods = Object.assign(Object.create(tmp), o);
  } else {
    methods = o;
  }

  const constructor = Object.prototype.hasOwnProperty.call(o, 'constructor')
    ? methods.constructor
    : Extends
    ? function (...args) {
        Extends.call(this, ...args);
      }
    : function () {};

  constructor.prototype = methods;
  methods.constructor = constructor;
  return constructor;
}

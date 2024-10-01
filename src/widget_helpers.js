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
import { defineRender } from './renderer.js';

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

function arrayify(x) {
  if (!Array.isArray(x)) x = [x];
  return x;
}

export function mergeStaticEvents(a, b, ...rest) {
  if (!a || !b) return Object.assign({}, a || b || {});

  const result = Object.assign({}, a, b);

  for (const event in a) {
    if (!(event in b)) continue;

    result[event] = arrayify(a[event]).concat(arrayify(b[event]));
  }

  if (rest.length) {
    return mergeStaticEvents(result, ...rest);
  }

  return result;
}

export function addStaticEvent(w, event, fun) {
  w.addStaticEvent(event, fun);
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
  const show_option = config.option || 'show_' + name;
  const index = '_' + name;

  const display_check = config.display_check;

  /* This is done to make sure that the object property is created
   * inside of the constructor. Otherwise, if we add the widget later
   * might be turned into a generic mapping.
   */
  widget.addStaticEvent('initialize', function () {
    this[index] = null;
  });

  /* trigger child element creation after initialization */
  widget.addStaticEvent('initialize_children', function () {
    this.set(show_option, this.options[show_option]);
  });

  /* clean up on destroy */
  widget.addStaticEvent('destroy', function () {
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

  const dependency = config.dependency;

  widget.addStaticEvent('set_' + show_option, function (value) {
    let C = this[index];
    const show = display_check ? display_check(value) : value !== false;
    if (!show || show === !!C) return;
    if (show && !C) {
      C = create.call(this);
      this[index] = C;
    }
  });
  widget.addTask(
    defineRender([show_option], function (value) {
      const childElement = this[index];

      const show = display_check ? display_check(value) : value !== false;

      if (show) {
        if (!childElement.parentNode) append.call(this, this.options);
      } else if (childElement !== null) {
        this[index] = null;
        childElement.remove();
      }
      if (config.toggle_class)
        toggleClass(this.element, 'aux-has-' + name, show);
      this.triggerResize();
      if (dependency) this.invalidate(dependency);
    })
  );

  if (config.draw) {
    let draw_options = config.draw_options;

    if (!draw_options) draw_options = [show_option];
    else draw_options = [show_option, ...draw_options];

    // filter out options which are not unique
    draw_options = draw_options.filter((name, i, a) => i === a.indexOf(name));

    widget.addTask(
      defineRender(draw_options, function (value) {
        const show = display_check ? display_check(value) : value !== false;

        if (show) config.draw.call(this, this.options);
      })
    );
  }

  if (!widget.hasOption(show_option)) {
    widget.defineOption(show_option, 'boolean', !!config.show);
  }
}

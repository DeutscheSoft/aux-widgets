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

import { element, addClass, isCSSVariableName, isClassName, removeClass } from './../utils/dom.js';
import { defineClass } from './../widget_helpers.js';
import { Widget } from './widget.js';

export const Icon = defineClass({
  /**
   * Icon represents a <code>&lt;DIV></code> element showing either
   * icons from the AUX font or dedicated image files as CSS background.
   *
   * @class Icon
   *
   * @extends Widget
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {String} [options.icon] - The icon to show. It can either be
   *   a string which is interpreted as class name (if <code>[A-Za-z0-9_\-]</code>),
   *   a CSS custom property name (if it start with `--`) or else
   *   as a file location. If it is a custom property name or a file location,
   *   it is used to set the `background-image` property.
   */
  Extends: Widget,
  _options: Object.assign(Object.create(Widget.prototype._options), {
    icon: 'string',
  }),
  options: {
    icon: false,
  },
  initialize: function (options) {
    if (!options.element) options.element = element('div');
    Widget.prototype.initialize.call(this, options);
    /**
     * @member {HTMLDivElement} Icon#element - The main DIV element. Has class <code>.aux-icon</code>
     */
    this._icon_old = null;
  },
  draw: function (O, element) {
    addClass(element, 'aux-icon');

    Widget.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    var O = this.options;
    var I = this.invalid;
    var E = this.element;

    Widget.prototype.redraw.call(this);

    if (I.icon) {
      I.icon = false;
      var old = this._icon_old;
      const icon = O.icon;

      if (old !== null) {
        if (isCSSVariableName(old) || !isClassName(old)) {
          E.style['background-image'] = null;
        } else {
          removeClass(E, old);
        }
        this._icon_old = null;
      }

      if (icon) {
        if (isCSSVariableName(icon)) {
          E.style['background-image'] = 'var(' + icon + ')';
        } else if (isClassName(icon)) {
          addClass(E, icon);
        } else {
          E.style['background-image'] = 'url("' + icon + '")';
        }
        this._icon_old = icon;
      }
    }
  },
});

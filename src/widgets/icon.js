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

import { element, addClass, isClassName, removeClass } from './../utils/dom.js';
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
   *   a string which is interpreted as class name (if <code>[A-Za-z0-9_\-]</code>) or as URI.
   */
  Extends: Widget,
  _options: Object.assign({}, Widget.prototype._options, {
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
    this._icon_old = [];
  },
  draw: function (O, element) {
    addClass(element, 'aux-icon');

    Widget.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    const O = this.options;
    const I = this.invalid;
    const E = this.element;

    Widget.prototype.redraw.call(this);

    if (I.icon) {
      I.icon = false;
      const old = this._icon_old;
      for (let i = 0; i < old.length; i++) {
        if (old[i] && isClassName(old[i])) {
          removeClass(E, old[i]);
        }
      }
      this._icon_old = [];
      if (isClassName(O.icon)) {
        E.style['background-image'] = null;
        if (O.icon) addClass(E, O.icon);
      } else if (O.icon) {
        E.style['background-image'] = 'url("' + O.icon + '")';
      }
    }
  },
  set: function (key, val) {
    if (key === 'icon') {
      this._icon_old.push(this.options.icon);
    }
    return Widget.prototype.set.call(this, key, val);
  },
});

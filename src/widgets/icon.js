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

import {
  element,
  addClass,
  isCSSVariableName,
  isClassName,
  removeClass,
} from './../utils/dom.js';
import { Widget } from './widget.js';
import { defineRender } from '../renderer.js';

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
export class Icon extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), {
      icon: 'string',
    });
  }

  static get options() {
    return {
      icon: false,
      role: 'img',
    };
  }

  static get renderers() {
    return [
      defineRender('icon', function (icon) {
        const E = this.element;
        const old = this._icon_old;

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
            E.style['background-image'] = 'url(' + JSON.stringify(icon) + ')';
          }
          this._icon_old = icon;
        }
      }),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    /**
     * @member {HTMLDivElement} Icon#element - The main DIV element. Has class <code>.aux-icon</code>
     */
    this._icon_old = null;
  }

  draw(O, element) {
    addClass(element, 'aux-icon');

    super.draw(O, element);
  }
}

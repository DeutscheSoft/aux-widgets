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

import { element, addClass, setText } from './../utils/dom.js';
import { Widget } from './widget.js';
import { defineRender } from '../renderer.js';

/**
 * Label is a simple text field displaying strings.
 *
 * @class Label
 *
 * @extends Widget
 *
 * @property {Mixed} [options.label=""] - The content of the label. Can be formatted via `options.format`.
 * @property {Function|Boolean} [options.format=false] - Optional format function.
 */
export class Label extends Widget {
  static get _options() {
    return {
      label: 'string',
      format: 'function|boolean',
    };
  }

  static get options() {
    return {
      label: '',
      format: false,
    };
  }

  static get renderers() {
    return [
      defineRender(['label', 'format'], function (label, format) {
        setText(this._text, format ? format(label) : label);
      }),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    /** @member {HTMLDivElement} Label#element - The main DIV container.
     * Has class <code>.aux-label</code>.
     */
    this._text = document.createTextNode('');
  }

  draw(O, element) {
    addClass(element, 'aux-label');
    element.appendChild(this._text);

    super.draw(O, element);
  }

  destroy() {
    super.destroy();
    this._text.remove();
  }
}

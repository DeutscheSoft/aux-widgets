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

/* jshint -W018 */

import { Widget } from './widget.js';
import { element, addClass, toggleClass } from '../utils/dom.js';
import { defineRender } from '../renderer.js';

/**
 * The State widget is a multi-functional adaption of a traditional LED. It
 * is able to show different colors as well as on/off states. The
 * "brightness" can be set seamlessly. Classes can be used to display
 * different styles. State extends {@link Widget}.
 *
 * The LED effect is implemented as a DIV element, which is overlayed by
 * a DIV element with class <code>.aux-mask</code>. `options.state`
 * changes the opacity of the mask element.
 *
 * @class State
 *
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.state=0] - The state. To toggle between `on|off` set to `1|0`.
 *   Set to fractions of `1` to change "brightness", e.g. `0.5`. Values > 0 trigger setting
 *   the class .aux-state-on`, while a state of `0` results in class .aux-state-off`.
 * @property {String|Boolean} [options.color=false] - A CSS color string for the state LED or
 *   `false` to set the background via external CSS.
 */
export class State extends Widget {
  static get _options() {
    return {
      state: 'number|boolean',
      color: 'string|boolean',
    };
  }

  static get options() {
    return {
      state: 0, // the initial state (0 ... 1)
      color: false, // the base color
    };
  }

  static get renderers() {
    return [
      defineRender('color', function (color) {
        if (color) this.element.style['background-color'] = color;
        else this.element.style.removeProperty('background-color');
      }),
      defineRender('state', function (state) {
        const E = this.element;
        toggleClass(E, 'aux-state-on', state);
        toggleClass(E, 'aux-state-off', !state);

        if (!(state >= 0)) state = 0;
        if (!(state <= 1)) state = 1;

        this._mask.style.opacity = '' + (1 - state);
      }),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);

    /**
     * @member {HTMLDivElement} State#element - The main DIV container.
     *   Has class <code>.aux-state</code>.
     */

    /**
     * @member {HTMLDivElement} State#_mask - A DIV for masking the background.
     *   Has class <code>.aux-mask</code>.
     */
    this._mask = element('div', 'aux-mask');
  }

  destroy() {
    this._mask.remove();
    super.destroy();
  }

  draw(O, element) {
    addClass(element, 'aux-state');
    element.appendChild(this._mask);

    super.draw(O, element);
  }
}

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

import { addClass } from './../utils/dom.js';
import { Button } from './button.js';

/**
 * Is fired when the user didn't confirm in time or clicked anywhere
 * else.
 *
 * @event ConfirmButton#canceled
 */

function reset(e) {
  if (!this.options.state) return;
  if (e) {
    let t = e.target;
    while (t) {
      if (t == this.element) return;
      t = t.parentElement;
    }
  }
  this.emit('canceled');
  stateReset.call(this);
}

function stateSet() {
  const T = this.__temp;
  const O = this.options;
  if (O.label_confirm || O.label_confirm === false) {
    T.label = O.label;
    this.set('label', O.label_confirm);
  }

  if (O.icon_confirm || O.icon_confirm === false) {
    T.icon = O.icon;
    this.set('icon', O.icon_confirm);
  }

  T.reset = reset.bind(this);
  document.addEventListener('click', T.reset, true);

  if (O.timeout) T.timeout = setTimeout(T.reset, O.timeout);

  T.click = Date.now();

  this.set('state', true);
}

function stateReset() {
  if (this.isDestructed()) return;
  const T = this.__temp;

  this.set('label', T.label);
  this.set('icon', T.icon);

  if (T.timeout >= 0) window.clearTimeout(T.timeout);

  if (T.reset) document.removeEventListener('click', T.reset, true);

  T.reset = null;
  T.timeout = -1;
  T.label = undefined;
  T.icon = undefined;
  T.click = 0;

  this.set('state', false);
}

/**
 * ConfirmButton is a {@link Button} firing the `confirmed` event
 * after it was hit a second time. While waiting for the confirmation, a
 * dedicated label and icon can be displayed. The button is reset to
 * default if no second click appears. A click outside of the button
 * resets it, too. It receives class .aux-active` while waiting for
 * the confirmation.
 *
 * @class ConfirmButton
 *
 * @extends Button
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Boolean} [options.confirm=true] - Defines if the button acts as <code>ConfirmButton</code> or normal <code>Button</code>.
 * @property {Number} [options.timeout=2000] - Defines a time in milliseconds after the button resets to defaults if no second click happens.
 * @property {Number} [options.interrupt=0] - Defines a duration in milliseconds within further clicks are ignored. Set to avoid double-clicks being recognized as confirmation.
 * @property {String|Boolean} [options.label_confirm] - The label to be used while in active state.
 * @property {String|Boolean} [options.icon_confirm] - The icon to be used while in active state.
 */
export class ConfirmButton extends Button {
  static get _options() {
    return Object.assign({}, Button.getOptionTypes(), {
      confirm: 'boolean',
      timeout: 'number',
      interrupt: 'number',
      label_confirm: 'string',
      icon_confirm: 'string',
    });
  }

  static get options() {
    return {
      confirm: true,
      timeout: 2000,
      interrupt: 0,
      label_confirm: undefined,
      icon_confirm: undefined,
    };
  }

  static get static_events() {
    return {
      click: function () {
        const T = this.__temp;
        const O = this.options;
        /**
         * Is fired when the button was hit two times with at least
         *   <code>interrupt</code> milliseconds between both clicks.
         *
         * @event ConfirmButton#confirmed
         */
        if (!O.confirm) {
          this.emit('confirmed');
        } else if (O.state && Date.now() > T.click + O.interrupt) {
          this.emit('confirmed');
          stateReset.call(this);
        } else if (!O.state) {
          stateSet.call(this);
        }
      },
    };
  }

  initialize(options) {
    super.initialize(options);
    this.__temp = {
      label: undefined,
      icon: undefined,
      timeout: -1,
      reset: null,
      click: 0,
    };
  }

  draw(O, element) {
    addClass(element, 'aux-confirmbutton');

    super.draw(O, element);
  }

  set(key, value) {
    if (key == 'confirm' && value == false) {
      this.set('state', false);
    }
    return super.set(key, value);
  }

  destroy() {
    stateReset.call(this);
    super.destroy();
  }
}

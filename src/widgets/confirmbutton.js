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
import { defineClass } from './../widget_helpers.js';
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
    var t = e.target;
    while (t) {
      if (t == this.element) return;
      t = t.parentElement;
    }
  }
  this.emit('canceled');
  stateReset.call(this);
}

function stateSet() {
  var T = this.__temp;
  var O = this.options;
  if (O.label_confirm) {
    T.label = O.label;
    this.set('label', O.label_confirm);
  }

  if (O.icon_confirm) {
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
  var T = this.__temp;
  if (T.label) this.set('label', T.label);

  if (T.icon) this.set('icon', T.icon);

  if (T.timeout >= 0) window.clearTimeout(T.timeout);

  if (T.reset) document.removeEventListener('click', T.reset, true);

  T.reset = null;
  T.timeout = -1;
  T.label = '';
  T.icon = '';
  T.click = 0;

  this.set('state', false);
}

/**
 * Is fired when the button was hit two times with at least
 *   <code>interrupt</code> milliseconds between both clicks.
 *
 * @event ConfirmButton#confirmed
 */

function clicked() {
  var T = this.__temp;
  var O = this.options;
  if (!O.confirm) {
    this.emit('confirmed');
  } else if (O.state && Date.now() > T.click + O.interrupt) {
    this.emit('confirmed');
    stateReset.call(this);
  } else if (!O.state) {
    stateSet.call(this);
  }
}

export const ConfirmButton = defineClass({
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
   * @property {String} [options.label_confirm] - The label to be used while in active state.
   * @property {String} [options.icon_confirm] - The icon to be used while in active state.
   */
  Extends: Button,

  _options: Object.assign(Object.create(Button.prototype._options), {
    confirm: 'boolean',
    timeout: 'number',
    interrupt: 'number',
    label_confirm: 'string',
    icon_confirm: 'string',
  }),
  options: {
    confirm: true,
    timeout: 2000,
    interrupt: 0,
    label_confirm: '',
    icon_confirm: '',
  },

  initialize: function (options) {
    Button.prototype.initialize.call(this, options);
    this.on('click', clicked.bind(this));
    this.__temp = {
      label: '',
      icon: '',
      timeout: -1,
      reset: null,
      click: 0,
    };
  },

  draw: function (O, element) {
    addClass(element, 'aux-confirmbutton');

    Button.prototype.draw.call(this, O, element);
  },

  set: function (key, value) {
    if (key == 'confirm' && value == false) {
      this.set('state', false);
    }
    Button.prototype.set.call(this, key, value);
  },
});

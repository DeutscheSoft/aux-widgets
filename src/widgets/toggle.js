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

function toggle(O) {
  if (this.userset('state', !O.state) === false) return;
  this.emit('toggled', O.state);
}
function pressStart(e) {
  const O = this.options;
  if (O.press || O.delay) toggle.call(this, O);
}
function pressEnd(e) {
  const O = this.options;
  if (
    (O.press && e.timeStamp > this.__time_stamp + O.press) ||
    (!O.press && !O.delay)
  )
    toggle.call(this, O);
}
function pressCancel(e) {
  const O = this.options;
  if (O.press) toggle.call(this, O);
}

/**
 * A toggle button. The toggle button can either be pressed (which means that it will
 * switch its state as long as it is pressed) or toggled permanently. Its behavior is
 * controlled by the two options <code>press</code> and <code>toggle</code>.
 *
 * @class Toggle
 *
 * @extends Button
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Boolean} [options.toggle=true] - If true, the button is toggled on click.
 * @property {Integer} [options.press=0] - Controls press behavior. If <code>options.toggle</code>
 *   is <code>false</code> and this option is <code>0</code>, the toggle button will toggle until
 *   released. If <code>options.toggle</code> is true and this option is a positive integer, it is
 *   interpreted as a milliseconds timeout. When pressing a button longer than this timeout, it will
 *   be toggled until released, otherwise it will be toggled permanently.
 * @property {Integer} [options.delay=0] - Delay all actions for n milliseconds. While actions are
 *   delayed, the widget has class <code>.aux-delayed</code>. Use to force users to press the button
 *   for a certain amount of time before it actually gets toggled.
 * @property {String|Boolean} [options.icon_active=false] - An optional icon which is only displayed
 *   when the button toggle state is <code>true</code>. Please note that this option only works if `icon` is also set.
 * @property {String|Boolean} [options.label_active=false] - An optional label which is only displayed
 *   when the button toggle state is <code>true</code>. Please note that this option only works if `label` is also set.
 */
export class Toggle extends Button {
  static get _options() {
    return Object.assign({}, Button.getOptionTypes(), {
      label_active: 'string',
      icon_active: 'string',
      press: 'int',
      toggle: 'boolean',
    });
  }

  static get options() {
    return {
      label_active: false,
      icon_active: false,
      icon_inactive: false,
      press: 0,
      toggle: true,
    };
  }

  static get static_events() {
    return {
      press_start: pressStart,
      press_end: pressEnd,
      press_cancel: pressCancel,
    };
  }

  draw(O, element) {
    addClass(element, 'aux-toggle');
    super.draw(O, element);
  }

  redraw() {
    const O = this.options;
    const I = this.invalid;
    if (I.state) {
      let tmp = (O.state && O.label_active) || O.label;
      if (tmp) this.label.set('label', tmp || '');
      tmp = (O.state && O.icon_active) || O.icon;
      if (tmp) this.icon.set('icon', tmp || '');
    }
    super.redraw();
  }

  /**
   * Toggle the button state.
   *
   * @method Toggle#toggle
   *
   * @emits Toggle#toggled
   */
  toggle() {
    toggle.call(this, this.options);
    /**
     * Is fired when the button was toggled.
     *
     * @event Toggle#toggled
     *
     * @param {boolean} state - The state of the {@link Toggle}.
     */
  }
}

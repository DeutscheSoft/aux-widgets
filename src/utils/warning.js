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

import { defineRecalculation, defineRender } from '../renderer.js';
import { toggleClass } from './dom.js';
import {
  createTimer,
  startTimer,
  destroyTimer,
  cancelTimer,
} from './timers.js';

const timeouts = new Map();

function removeClass() {
  this.classList.remove('aux-warn');
  timeouts.delete(this);
}

export function warning(element, timeout) {
  /**
   * Adds the class "aux-warn" on <code>this.element</code> for a certain
   * period of time. It is used e.g. in {@link ChartHandle} or {@link Knob} when the value
   * exceeds the range.
   *
   * @function warning
   * @param {HTMLElement} element - The element to apply the class 'aux-warn' to.
   * @param {Integer} timeout - The timer in milliseconds the warning should be active.
   */
  if (!timeout) timeout = 250;

  if (timeouts.has(element)) {
    window.clearTimeout(timeouts.get(element));
    timeouts.delete(element);
  } else {
    element.classList.add('aux-warn');
  }
  timeouts.set(element, window.setTimeout(removeClass.bind(element), timeout));
}

export const warningOptionsTypes = {
  show_warning: 'boolean',
};

export const warningOptionsDefaults = {
  show_warning: true,
};

export const warningEvents = {
  initialize: function () {
    this._warning_timer = createTimer(() => {
      this.update('_warning_state', false);
    });
  },
  set_value: function () {
    this.update('_value_time', performance.now());
  },
  destroy: function () {
    this._warning_timer = destroyTimer(this._warning_timer);
  },
};

export const warningRenderers = [
  defineRecalculation(
    ['min', 'max', 'value', 'show_warning', '_value_time'],
    function (min, max, value, show_warning, _value_time) {
      let state = false;

      if (show_warning) {
        if (!(min <= value && max >= value)) {
          const warningDuration = 250 - (performance.now() - _value_time);
          if (warningDuration > 0) {
            this._warning_timer = startTimer(
              this._warning_timer,
              warningDuration
            );
            state = true;
          }
        }
      }

      if (!state) this._warning_timer = cancelTimer(this._warning_timer);

      this.update('_warning_state', state);
    }
  ),
  defineRender('_warning_state', function (_warning_state) {
    toggleClass(this.element, 'aux-warn', _warning_state);
  }),
];

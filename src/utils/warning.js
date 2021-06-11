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

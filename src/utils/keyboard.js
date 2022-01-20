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

/* Detection and handling for passive event handler support.
 * The chrome team has threatened to make passive event handlers
 * the default in a future version. To make sure that this does
 * not break our code, we explicitly register 'active' event handlers
 * for most cases.
 */

/**
 * Default handler for controlling values via keyboard. It sets an option
 *   depending on `step`, `shgift_up`, `shift_down`, `min` and `max`.
 *
 * @param {string} The name of the option to set.
 *
 * @returns A Function receiving an object defining the movement. This object
 *   has two members,
 *   `speed` and `direction`. `speed` is either `slow`, `normal`, `fast` or `full`,
 *   `direction` is one out of `up`, `left`, `right`, `down`.
 *
 * @function focusMoveDefault
 */
export function focusMoveDefault(v) {
  const valName = v || 'value';
  return function (o) {
    const O = this.options;
    const value = this.get(valName);
    const direction = o.direction == 'left' || o.direction == 'down' ? -1 : 1;
    let step = (O.step || 1) * direction;
    let newval;
    if (o.speed == 'slow') {
      newval = Math.min(O.max, Math.max(O.min, value + step * O.shift_down));
    } else if (o.speed == 'fast') {
      newval = Math.min(O.max, Math.max(O.min, value + step * O.shift_up));
    } else if (o.speed == 'full') {
      newval = direction < 0 ? O.min : O.max;
    } else {
      newval = Math.min(O.max, Math.max(O.min, value + step));
    }
    this.userset(valName, newval);
  };
}

/**
 * Adds all possible keyboard commands used in `focus_move` to aria-keyshortcuts
 * on all `getFocusTargets()` elements. Call this function in the
 * context of an actual widget.
 *
 * @function announceFocusMoveKeys
 */
export function announceFocusMoveKeys() {
  this.getFocusTargets().forEach((v) =>
    v.setAttribute(
      'aria-keyshortcuts',
      'ArrowLeft ArrowRight ArrowUp ArrowDown Home End PageUp PageDown ' +
        'Control+ArrowLeft Control+ArrowRight Control+ArrowUp Control+ArrowDown ' +
        'Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown'
    )
  );
}

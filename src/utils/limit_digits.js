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

export function limitDigits(limit, add = '', base) {
  /** Returns a formatting function for numerical values for reducing
   *  the amount of digits displayed by adding SI prefixes.
   *  @function limitDigits
   *  @param {Integer} limit - the amount of digits to display, excluding the SI prefix.
   *  @param {String} add - a possible additional string to add ad the end (e.g. 'B' for bytes)
   *  @param {Integer} base - the base for calculations, defaults to 1000
   */
  return function (value) {
    base = base ? base : 1000;
    value = parseFloat(value);
    let digits = parseInt(Math.abs(value)).toString().length;
    let si = '';
    let I = 0;
    let L = limit;
    if (value < 0)
      L -= 1;
    if (digits > L) {
      L -= 1;
      I = Math.floor(Math.log(Math.abs(value)) / Math.log(base));
      si = ['', 'k','M','G','T','P'][I];
      if (I)
        value /= I * base;
      digits -= I * 3;
    }
    return value.toFixed(Math.max(0, L - digits)) + si + add;
  }
}

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

export function checkVisibility(widget) {
  let drawn = widget.isDrawn();

  if (drawn)
    while (widget) {
      let element = widget.element;

      if (element.classList.contains('aux-hide')) {
        throw new Error('found aux-hide on element while drawn.');
      }
      widget = widget.parent;
    }
  else {
    let element = widget.element;

    if (element.classList.contains('aux-show')) {
      throw new Error('found aux-show on element while !drawn.');
    }
  }
}

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

/**
 * Tracks resizes of the given list of elements using a ResizeObserver.
 * The callback will be called whenever the resize observer triggers.
 * Returns an unsubscription callback which can be used to stop the
 * observation.
 */
export function observeResize(elements, callback) {
  if (typeof ResizeObserver === 'undefined') return null;

  const observer = new ResizeObserver((entries) => {
    callback();
  });

  for (const element of elements) {
    observer.observe(element);
  }

  return () => observer.disconnect();
}

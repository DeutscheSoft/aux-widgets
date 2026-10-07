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
 * Creates an IntersectionObserver, or a compatible stand-in when the
 * API is unavailable (e.g. jsdom).
 *
 * The stand-in reports every observed element as intersecting, so
 * callers can treat "no IntersectionObserver" as "everything visible"
 * without special-casing observe/unobserve/disconnect.
 *
 * @param {IntersectionObserverCallback} callback
 * @param {IntersectionObserverInit} [options]
 * @returns {IntersectionObserver|{
 *   observe: (element: Element) => void,
 *   unobserve: (element: Element) => void,
 *   disconnect: () => void,
 * }}
 */
export function createIntersectionObserver(callback, options) {
  if (typeof IntersectionObserver === 'undefined') {
    return {
      observe(element) {
        callback([{ target: element, isIntersecting: true }], this);
      },
      unobserve() {},
      disconnect() {},
    };
  }

  return new IntersectionObserver(callback, options);
}

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

import { addClass, removeClass } from './dom.js';

export function setGlobalCursor (cursor) {
/**
 * setGlobalCursor adds global cursor classes to ensure
 * one of the <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">standard cursors</a>
 * is shown in the overall application.
 *
 * @param {string} cursor - one of the standard cursor strings.
 * @function setGlobalCursor
 */
  addClass(document.body, 'aux-cursor-' + cursor);
}

export function unsetGlobalCursor (cursor) {
/**
 * unsetGlobalCursor removes a cursor from the body.
 * See <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">standard cursors</a>
 * for a list of cursors.
 *
 * @param {string} cursor - one of the standard cursor strings.
 * @function unsetGlobalCursor
 */
  removeClass(document.body, 'aux-cursor-' + cursor);
}

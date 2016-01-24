 /* toolkit provides different widgets, implements and modules for 
 * building audio based applications in webbrowsers.
 * 
 * Invented 2013 by Markus Schmidt <schmidt@boomshop.net>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
 * Boston, MA  02110-1301  USA
 */
"use strict";
(function(w){ 
w.TK.Anchor = w.Anchor = $class({
    /**
     * TK.Anchor provides a single function translate_anchor
     * which returns real x and y values from a relative positioning.
     * For example positioning a {@link TK.Window} with anchor "center"
     * needs to subtract half of its width from y and half of its height
     * from x to appear at the correct position.
     *
     * @mixin TK.Anchor
     */
    translate_anchor: function (anchor, x, y, width, height) {
        /**
         * Returns real x and y values from a relative positioning.
         * @method TK.Anchor#translate_anchor
         * @param {integer} [anchor="top-left"] - Position of the anchor
         * @param {number} x - X position to translate
         * @param {number} y - Y position to translate
         * @param {number} width - Width of the element
         * @param {number} height - Height of the element
         * @returns {Object} Object with members x and y as numbers
         */
        switch (anchor) {
            case "top-left":
                break;
            case "top":
                x += width / 2;
                break;
            case "top-right":
                x += width;
                break;
            case "left":
                y += height / 2;
                break;
            case "center":
                x += width / 2;
                y += height / 2;
                break;
            case "right":
                x += width;
                y += height / 2;
                break;
            case "bottom-left":
                y += height;
                break;
            case "bottom":
                x += width / 2;
                y += height;
                break;
            case "bottom-right":
                x += width;
                y += height;
                break;
            default:
                throw new Error("Unsupported anchor position");
        }
        return {x: Math.round(x), y: Math.round(y)};
    }
});
})(this);

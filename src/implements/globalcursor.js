/*
 * This file is part of Toolkit.
 *
 * Toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */
import { define_class } from './../widget_helpers.js';
import { add_class, remove_class } from '../utils/dom.js';

/**
 * GlobalCursor adds global cursor classes to ensure
 * one of the <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">standard cursors</a>
 * is shown in the overall application.
 *
 * @mixin GlobalCursor
 */
export const GlobalCursor = define_class({
    _class: "GlobalCursor",
    /**
     * Adds a class <code>"aux-cursor-" + cursor</code> to the <code>document.body</code> to show a specific cursor.
     * 
     * @method GlobalCursor#global_cursor
     * 
     * @param {string} cursor - The name of the <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">cursor</a> to show.
     * 
     * @emits GlobalCursor#globalcursor
     */
    global_cursor: function (cursor) {
        add_class(document.body, "aux-cursor-" + cursor);
        /**
         * Is fired when a cursor gets set.
         * 
         * @event GlobalCursor#globalcursor
         * 
         * @param {string} cursor - The name of the <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">cursor</a> to show. 
         */
        this.emit("globalcursor", cursor);
    },
    /**
     * Removes the class from <code>document.body</code> node.
     *
     * @method GlobalCursor#remove_cursor
     * 
     * @param {string} cursor - The name of the <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">cursor</a> to remome.
     * 
     * @emits GlobalCursor#cursorremoved
     */
    remove_cursor: function (cursor) {
        remove_class(document.body, "aux-cursor-" + cursor);
        /**
         * Is fired when a cursor is removed.
         * 
         * @event GlobalCursor#cursorremoved
         * 
         * @param {string} cursor - The name of the <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">cursor</a> to remove.
         */
        this.emit("cursorremoved", cursor);
    }
});

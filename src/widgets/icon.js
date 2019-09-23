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

import { element, add_class, is_class_name, remove_class } from './../utils/dom.js';
import { define_class } from './../widget_helpers.js';
import { Widget } from './widget.js';
    
export const Icon = define_class({
    /**
     * Icon represents a <code>&lt;DIV></code> element showing either
     * icons from the toolkit font or dedicated image files as CSS background.
     *
     * @class Icon
     * 
     * @extends Widget
     *
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {String} [options.icon] - The icon to show. It can either be
     *   a string which is interpreted as class name (if <code>[A-Za-z0-9_\-]</code>) or as URI.
     */
    _class: "Icon",
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        icon: "string",
    }),
    options: {
        icon: false,
    },
    initialize: function (options) {
        var E;
        Widget.prototype.initialize.call(this, options);
        /** 
         * @member {HTMLDivElement} Icon#element - The main DIV element. Has class <code.aux-icon</code> 
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "aux-icon"); 
        this.widgetize(E, true, true, true);
        this._icon_old = [];
    },
    redraw: function() {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;

        Widget.prototype.redraw.call(this);
        
        if (I.icon) {
            I.icon = false;
            var old = this._icon_old;
            for (var i = 0; i < old.length; i++) {
                if (old[i] && is_class_name(old[i])) {
                    remove_class(E, old[i]);
                }
            }
            this._icon_old = [];
            if (is_class_name(O.icon)) {
                E.style["background-image"] = null;
                if (O.icon)
                    add_class(E, O.icon);
            } else if (O.icon) {
                E.style["background-image"] = "url(\"" + O.icon + "\")";
            }
        }
    },
    set: function (key, val) {
        if (key === "icon") {
            this._icon_old.push(this.options.icon);
        }
        return Widget.prototype.set.call(this, key, val);
    },
});

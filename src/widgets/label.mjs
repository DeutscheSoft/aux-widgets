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

import { element, add_class, is_class_name, remove_class } from './../helpers.mjs';
import { define_class } from './../widget_helpers.mjs';
import { Widget } from './widget.mjs';

export const Label = define_class({
    /**
     * Label is a simple text field displaying strings.
     *
     * @class Label
     * 
     * @extends Widget
     * 
     * @property {Object} options
     * 
     * @param {String} [options.label=""] - The text of the label.
     * @param {Function|null} [options.format=null] - Optional format function.
     */
    _class: "Label",
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        label: "string",
        format: "function|object"
    }),
    options: {
        label: "",
        format: null
    },
    initialize: function (options) {
        var E;
        Widget.prototype.initialize.call(this, options);
        /** @member {HTMLDivElement} Label#element - The main DIV container.
         * Has class <code>toolkit-label</code>.
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "toolkit-label");
        this._text = document.createTextNode("");
        E.appendChild(this._text);
        this.widgetize(E, true, true, true);
    },
    
    redraw: function () {
        var I = this.invalid;
        var O = this.options;

        Widget.prototype.redraw.call(this);

        if (I.label || I.format) {
            I.label = I.format = false;
            this._text.data = O.format ? O.format.call(this, O.label) : O.label;
        }
    },
});

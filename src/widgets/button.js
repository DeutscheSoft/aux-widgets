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
import { element, add_class, toggle_class } from './../utils/dom.js';
import { define_class } from './../widget_helpers.js';
import { define_child_widget } from './../child_widget.js';
import { Widget } from './widget.js';
import { Icon } from './icon.js';
import { Label } from './label.js';

export const Button = define_class({
    /**
     * Button is a simple, clickable widget containing an
     * {@link Icon} and a {@link Label} to trigger functions.
     * Button serves as base for other widgets, too, e.g.
     * {@link Toggle}, {@link ConfirmButton} and {@link Select}.
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {String|Boolean} [options.label=false] - Text for the
     *   button label. Set to <code>false</code> to remove the label
     *   from DOM.
     * @property {String|Boolean} [options.icon=false] - URL to an image
     *   file or an icon class (see styles/fonts/Toolkit.html). If set
     *   to <code>false</code>, the icon is removed from DOM.
     * @property {Boolean} [options.state=false] - State of the button,
     *   reflected as class <code.aux-active</code>.
     * @property {String} [options.layout="horizontal"] - Define the
     *   arrangement of label and icon. <code>vertical</code> means icon
     *   above the label, <code>horizontal</code> places the icon left
     *   to the label.
     * 
     * @extends Widget
     * 
     * @class Button
     */
    _class: "Button",
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        label: "string|boolean",
        icon: "string|boolean",
        state: "boolean",
        layout: "string",
    }),
    options: {
        label:            false,
        icon:            false,
        state:            false,
        layout:           "horizontal"
    },
    initialize: function (options) {
        var E;
        Widget.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Button#element - The main DIV element.
         *   Has class <code.aux-button</code>.
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "aux-button");
        this.widgetize(E, true, true, true);
    },
    destroy: function () {
        Widget.prototype.destroy.call(this);
    },

    redraw: function() {
        Widget.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;
        var E = this.element;
        
        if (I.layout) {
            I.layout = false;
            toggle_class(E, "aux-vertical", O.layout === "vertical");
            toggle_class(E, "aux-horizontal", O.layout !== "vertical");
        }

        if (I.state) {
            I.state = false;
            toggle_class(E, "aux-active", O.state);
        }
    },
});

/**
 * @member {Icon} Button#icon - The {@link Icon} widget.
 */
define_child_widget(Button, "icon", {
    create: Icon,
    option: "icon",
    inherit_options: true,
    toggle_class: true,
});

/**
 * @member {Label} Button#label - The {@link Label} of the button.
 */
define_child_widget(Button, "label", {
    create: Label,
    option: "label",
    inherit_options: true,
    toggle_class: true,
});

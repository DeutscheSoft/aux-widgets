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
import { define_class } from './../widget_helpers.mjs';
import { Widget } from './widget.mjs';
import { element, add_class } from '../helpers.mjs';

/**
 * The State widget is a multi-functional adaption of a traditional LED. It
 * is able to show different colors as well as on/off states. The
 * "brightness" can be set seamlessly. Classes can be used to display
 * different styles. State extends Widget.
 *
 * The LED effect is implemented as an DIV element, which is overlayed by
 * a DIV mask element with class <code>toolkit-mask</code>. When switching
 * the state the opacity of the mask is toggled between zero and
 * <code>options.opactity</code>.
 *
 * @class State
 * 
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Number} [options.state=0] - The state.
 * @property {String} [options.color="red"] - A css color string for the state LED.
 *   <code>false</code>.
 */
export const State = define_class({
    _class: "State",
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        state: "number|boolean",
        color: "string",
    }),
    options: {
        state:           0,     // the initial state (0 ... 1)
        color:           false, // the base color
    },
    initialize: function (options) {
        Widget.prototype.initialize.call(this, options);

        var E;
        /**
         * @member {HTMLDivElement} State#element - The main DIV container.
         *   Has class <code>toolkit-state</code>.
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "toolkit-state");
        this.widgetize(E, true, true, true);
        
        /**
         * @member {HTMLDivElement} State#_mask - A DIV for masking the background.
         *   Has class <code>toolkit-mask</code>.
         */
        this._mask   = element("div","toolkit-mask");

        E.appendChild(this._mask);
    },
    destroy: function () {
        this._mask.remove();
        Widget.prototype.destroy.call(this);
    },

    redraw: function() {
        Widget.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;

        if (I.color) {
            I.color = false;
            if (O.color)
                this.element.style["background-color"] = O.color;
            else
                this.element.style["background-color"] = void 0;
        }

        if (I.state) {
            I.state = false;
            var v = +O.state;
            if (!(v >= 0)) v = 0;
            if (!(v <= 1)) v = 1;

            if (!O.state) {
                this.remove_class("toolkit-state-on");
                this.add_class("toolkit-state-off");
            } else {
                this.remove_class("toolkit-state-off");
                this.add_class("toolkit-state-on");
            }
            this._mask.style["opacity"] = "" + (1 - v);
        }
    }
});

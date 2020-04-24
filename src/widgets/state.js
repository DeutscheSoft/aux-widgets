/*
 * This file is part of A.UX.
 *
 * A.UX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * A.UX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

/* jshint -W018 */

import { define_class } from '../widget_helpers.js';
import { Widget } from './widget.js';
import { element, add_class } from '../utils/dom.js';

/**
 * The State widget is a multi-functional adaption of a traditional LED. It
 * is able to show different colors as well as on/off states. The
 * "brightness" can be set seamlessly. Classes can be used to display
 * different styles. State extends {@link Widget}.
 *
 * The LED effect is implemented as a DIV element, which is overlayed by
 * a DIV element with class <code>.aux-mask</code>. `options.state`
 * changes the opacity of the mask element.
 *
 * @class State
 * 
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Number} [options.state=0] - The state. To toggle between `on|off` set to `1|0`.
 *   Set to fractions of `1` to change "brightness", e.g. `0.5`. Values > 0 trigger setting
 *   the class .aux-state-on`, while a state of `0` results in class .aux-state-off`.
 * @property {String|Boolean} [options.color=false] - A CSS color string for the state LED or
 *   `false` to set the background via external CSS.
 */
export const State = define_class({
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        state: "number|boolean",
        color: "string|boolean",
    }),
    options: {
        state:           0,     // the initial state (0 ... 1)
        color:           false, // the base color
    },
    initialize: function (options) {
        if (!options.element) options.element = element("div");
        Widget.prototype.initialize.call(this, options);

        /**
         * @member {HTMLDivElement} State#element - The main DIV container.
         *   Has class <code>.aux-state</code>.
         */
        
        /**
         * @member {HTMLDivElement} State#_mask - A DIV for masking the background.
         *   Has class <code>.aux-mask</code>.
         */
        this._mask   = element("div","aux-mask");
    },
    destroy: function () {
        this._mask.remove();
        Widget.prototype.destroy.call(this);
    },

    draw: function(O, element)
    {
      add_class(element, "aux-state");
      element.appendChild(this._mask);

      Widget.prototype.draw.call(this, O, element);
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
                this.remove_class("aux-state-on");
                this.add_class("aux-state-off");
            } else {
                this.remove_class("aux-state-off");
                this.add_class("aux-state-on");
            }
            this._mask.style.opacity = "" + (1 - v);
        }
    }
});

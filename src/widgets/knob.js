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
 
/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>value</code>.
 *
 * @event Knob#useraction
 * 
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { define_class } from '../widget_helpers.js';
import { Widget } from './widget.js';
import { Circular } from './circular.js';
import { DragValue } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { element, add_class, remove_class, make_svg } from '../utils/dom.js';
import { FORMAT } from '../utils/sprintf.js';
import { object_and, object_sub } from '../utils/object.js';
     
var format_viewbox = FORMAT("0 0 %d %d");
function dblclick() {
    this.userset("value", this.options.reset);
    /**
     * Is fired when the knob receives a double click in order to reset to initial value.
     * 
     * @event Knob#doubleclick
     * 
     * @param {number} value - The value of the widget.
     */
    this.emit("doubleclick", this.options.value);
}
function module_range() {
    return this.parent.circular;
}
/**
 * Knob is a {@link Circular} inside of an SVG which can be
 * modified both by dragging and scrolling utilizing {@link DragValue}
 * and {@link ScrollValue}.
 * It inherits all options of {@link Circular} and {@link DragValue}.
 * The options listed below consist of options from the contained widgets,
 * only showing the default values.
 *
 * @class Knob
 * 
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Object} [options.hand={width: 1, length: 12, margin: 24}]
 * @property {Number} [options.margin=13]
 * @property {Number} [options.thickness=6]
 * @property {Number} [options.step=1] 
 * @property {Number} [options.shift_up=4]
 * @property {Number} [options.shift_down=0.25]
 * @property {Object} [options.dot={length: 6, margin: 13, width: 2}]
 * @property {Object} [options.marker={thickness: 6, margin: 13}]
 * @property {Object} [options.label={margin: 10, align: "outer", format: function(val){return val;}}]
 * @property {Number} [options.basis=300] - Distance to drag between <code>min</code> and <code>max</code>.

 */
export const Knob = define_class({
    _class: "Knob",
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), Circular.prototype._options,
                            DragValue.prototype._options, {
        size: "number",
        reset: "number",
    }),
    options: Object.assign({}, Circular.prototype.options, {
        size: 100,
        hand: {width: 1, length: 12, margin: 24},
        margin: 13,
        thickness: 6,
        step: 1,
        shift_up: 4,
        shift_down: 0.25,
        dot: {length: 6, margin: 13, width: 2},
        marker: {thickness: 6, margin: 13},
        label: {margin: 12, align: "outer", format: function(val){return val;}},
        direction: "polar",
        rotation:       45,
        blind_angle:    20,
        basis: 300,
    }),
    static_events: {
        dblclick: dblclick,
    },
    initialize: function (options) {
        Widget.prototype.initialize.call(this, options);
        options = this.options;
        var E, S;
        /**
         * @member {HTMLDivElement} Knob#element - The main DIV container.
         *   Has class <code>.aux-knob</code>.
         */
        if (!(E = this.element)) this.element = E = element("div")
        add_class(E, "aux-knob");

        /**
         * @member {SVGImage} Knob#svg - The main SVG image.
         */
        this.svg = S = make_svg("svg");
        
        var co = object_and(options, Circular.prototype._options);
        co = object_sub(co, Widget.prototype._options);
        co.container = S;

        /**
         * @member {Circular} Knob#circular - The {@link Circular} module.
         */
        this.circular = new Circular(co);

        this.widgetize(E, true, true, true);
        
        /**
         * @member {DragValue} Knob#drag - Instance of {@link DragValue} used for the
         *   interaction.
         */
        this.drag = new DragValue(this, {
            node:    S,
            range:   module_range,
            direction: options.direction,
            rotation: options.rotation,
            blind_angle: options.blind_angle,
            limit: true,
        });
        /**
         * @member {ScrollValue} Knob#scroll - Instance of {@link ScrollValue} used for the
         *   interaction.
         */
        this.scroll = new ScrollValue(this, {
            node:    S,
            range:   module_range,
            limit: true,
        });

        E.appendChild(S);
        this.set("base", options.base);
        if (options.reset === void(0))
            options.reset = options.value;
        this.add_child(this.circular);
    },

    get_range: function() {
        return this.circular;
    },
    
    destroy: function () {
        this.drag.destroy();
        this.scroll.destroy();
        this.circular.destroy();
        Widget.prototype.destroy.call(this);
    },

    redraw: function() {
        var I = this.invalid;
        var O = this.options;

        if (I.size) {
            I.size = false;
            this.svg.setAttribute("viewBox", format_viewbox(O.size, O.size));
        }

        Widget.prototype.redraw.call(this);
    },
    /**
     * This is an alias for {@link Circular#add_label} of the internal
     * circular instance.
     *
     * @method Knob#add_label
     */
    add_label: function(x) {
        return this.circular.add_label(x);
    },

    /**
     * This is an alias for {@link Circular#remove_label} of the internal
     * circular instance.
     *
     * @method Knob#remove_label
     */
    remove_label: function(x) {
        this.circular.remove_label(x);
    },

    set: function(key, value) {
        if (key === "base") {
            if (value === false) value = this.options.min;
        }
        // Circular does the snapping
        if (!Widget.prototype._options[key]) {
            if (Circular.prototype._options[key])
                value = this.circular.set(key, value);
            if (DragValue.prototype._options[key])
                this.drag.set(key, value);
        }
        return Widget.prototype.set.call(this, key, value);
    },
});

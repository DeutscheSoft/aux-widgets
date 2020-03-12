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
 * @event Fader#useraction
 * 
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { define_class } from './../widget_helpers.js';
import { Widget } from './widget.js';
import { Ranged } from '../implements/ranged.js';
import { Warning } from '../implements/warning.js';
import { GlobalCursor } from '../implements/globalcursor.js';
import { Scale } from './scale.js';
import { DragValue } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { Value } from './value.js';
import { Label } from './label.js';
import {
    element, add_class, remove_class, supports_transform,
    css_space, outer_height, inner_height, outer_width, inner_width
  } from '../utils/dom.js';
import { define_child_widget } from '../child_widget.js';

function vert(O) {
    return O.layout === "left" || O.layout === "right";
}
function get_value(ev) {
    var is_vertical = vert(this.options);
    var real, hsize, pad;
    hsize = this._handle_size / 2;
    pad = this._padding;
    
    if (is_vertical) {
        real  = this.options.basis - (ev.offsetY - hsize) + pad.bottom;
    } else {
        real  = ev.offsetX - hsize + pad.left;
    }
    return this.px2val(real);
}
function clicked(ev) {
    var value;
    if (this._handle.contains(ev.target)) return;
    if (this.value.element.contains(ev.target)) return;
    if (this.label.element.contains(ev.target)) return;
    if (this.scale.element.contains(ev.target)) return;
    value = this.userset("value", get_value.call(this, ev));
}
function dblclick() {
    this.userset("value", this.options.reset);
    /**
     * Is fired when the handle receives a double click.
     * 
     * @event Fader#doubleclick
     * 
     * @param {number} value - The value of the {@link Fader}.
     */
    this.emit("doubleclick", this.options.value);
}

/**
 * Fader is a slidable control with a {@link Scale} next to it which
 * can be both dragged and scrolled. Fader implements {@link Ranged},
 * {@link Warning} and {@link GlobalCursor} and inherits their options.
 * A {@link Label} and a {@link Value} are available optionally.
 *
 * @class Fader
 * 
 * @extends Widget
 * 
 * @mixes Ranged
 * @mixes Warning
 * @mixes GlobalCursor
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Number} [options.value] - The fader's position. This options is
 *   modified by user interaction.
 * @property {String} [options.layout] - The fader's layout. One out of
 *   `top`, `left`, `right` or `bottom`, defining the fader handles position
 *   in comparison to the scale.
 * @property {Boolean} [options.bind_click=false] - If true, a <code>click</code>
 *   on the fader will move the handle to the pointed position.
 * @property {Boolean} [options.bind_dblclick=true] - If true, a <code>dblclick</code>
 *   on the fader will reset the fader value to <code>options.reset</code>.
 * @property {Number} [options.reset=options.value] - The reset value, which is used by
 *   the <code>dblclick</code> event and the {@link Fader#reset} method.
 * @property {Boolean} [options.show_scale=true] - If true, a {@link Scale} is added to the fader.
 * @property {Boolean} [options.show_value=false] - If true, a {@link Value} widget is added to the fader.
 * @property {String|Boolean} [options.label=false] - Add a label to the fader. Set to `false` to remove the label from the DOM.
 */
export const Fader = define_class({
    Extends: Widget,
    Implements: [Ranged, Warning, GlobalCursor],
    _options: Object.assign(Object.create(Widget.prototype._options),
                            Ranged.prototype._options, Scale.prototype._options, {
        value:    "number",
        division: "number",
        levels:   "array",
        gap_dots: "number",
        gap_labels: "number",
        show_labels: "boolean",
        labels: "function",
        layout: "string",
        direction: "int",
        reset: "number",
        bind_click: "boolean",
        bind_dblclick: "boolean",
    }),
    options: {
        value: 0,
        division: 1,
        levels: [1, 6, 12, 24],
        gap_dots: 3,
        gap_labels: 40,
        show_labels: true,
        labels: function (val) { return val.toFixed(2); },
        layout: "left",
        bind_click: false,
        bind_dblclick: true,
        label: false,
    },
    static_events: {
        set_bind_click: function(value) {
            if (value) this.on("click", clicked);
            else this.off("click", clicked);
        },
        set_bind_dblclick: function(value) {
            if (value) this.on("dblclick", dblclick);
            else this.off("dblclick", dblclick);
        },
        set_layout: function() {
            this.options.direction = vert(this.options) ? "vertical" : "horizontal";
            this.drag.set("direction", this.options.direction);
            this.scroll.set("direction", this.options.direction);
        },
    },
    initialize: function (options) {
        this.__tt = false;
        if (!options.element) options.element = element('div');
        Widget.prototype.initialize.call(this, options);

        var E, O = this.options;
        
        /**
         * @member {HTMLDivElement} Fader#element - The main DIV container.
         *   Has class <code>.aux-fader</code>.
         */

        /**
         * @member {HTMLDivElement} Fader#_track - The track for the handle. Has class <code>.aux-track</code>.
         */
        this._track = element("div", "aux-track");
        
        /**
         * @member {HTMLDivElement} Fader#_handle - The handle of the fader. Has class <code>.aux-handle</code>.
         */
        this._handle = element("div", "aux-handle");
        this._handle_size = 0;
        this._track.appendChild(this._handle);

        if (O.reset === void(0))
            O.reset = O.value;

        if (O.direction === void(0))
            O.direction = vert(O) ? "vertical" : "horizontal";
        /**
         * @member {DragValue} Fader#drag - Instance of {@link DragValue} used for the handle
         *   interaction.
         */
        this.drag = new DragValue(this, {
            node:    this._handle,
            classes: this.element,
            direction: O.direction,
        });
        this.drag.on('startdrag', () => this.startInteracting());
        this.drag.on('stopdrag', () => this.stopInteracting());
        /**
         * @member {ScrollValue} Fader#scroll - Instance of {@link ScrollValue} used for the
         *   handle interaction.
         */
        this.scroll = new ScrollValue(this, {
            node:    this.element,
            classes: this.element,
        });
        this.scroll.on('scrollstarted', () => this.startInteracting());
        this.scroll.on('scrollended', () => this.stopInteracting());
        
        this.set("bind_click", O.bind_click);
        this.set("bind_dblclick", O.bind_dblclick);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-fader");
      element.appendChild(this._track);

      Widget.prototype.draw.call(this, O, element);
    },

    redraw: function () {
        Widget.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;
        var E = this.element;
        var value;
        var tmp;

        if (I.layout) {
            I.layout = false;
            value = O.layout;
            remove_class(E, "aux-vertical", "aux-horizontal", "aux-left",
                            "aux-right", "aux-top", "aux-bottom");
            add_class(E, vert(O) ? "aux-vertical" : "aux-horizontal");
            add_class(E, "aux-"+value);
            
            if (supports_transform)
                this._handle.style.transform = null;
            else {
                if (vert(O))
                    this._handle.style.left = null;
                else
                    this._handle.style.bottom = null;
            }
            I.value = false;
        }

        if (I.validate.apply(I, Object.keys(Ranged.prototype._options)) || I.value) {
            I.value = false;
            // TODO: value is snapped already in set(). This is not enough for values which are set during
            // initialization.
            tmp = this.val2px(this.snap(O.value)) + "px";

            if (vert(O)) {
                if (supports_transform)
                    this._handle.style.transform = "translateY(-"+tmp+")";
                else
                    this._handle.style.bottom = tmp;
            } else {
                if (supports_transform)
                    this._handle.style.transform = "translateX("+tmp+")";
                else
                    this._handle.style.left = tmp;
            }
        }
    },
    resize: function () {
        var O = this.options;
        var T = this._track, H = this._handle;
        var basis;

        Widget.prototype.resize.call(this);
        
        this._padding = css_space(T, "padding", "border");
        
        if (vert(O)) {
            this._handle_size = outer_height(H, true);
            basis = inner_height(T) - this._handle_size;
        } else {
            this._handle_size = outer_width(H, true);
            basis = inner_width(T) - this._handle_size;
        }

        this.set("basis", basis);
    },
    destroy: function () {
        this._handle.remove();
        Widget.prototype.destroy.call(this);
    },

    /**
     * Resets the fader value to <code>options.reset</code>.
     *
     * @method Fader#reset
     */
    reset: function() {
        this.set("value", this.options.reset);
    },
    
    // GETTER & SETTER
    set: function (key, value) {
        var O = this.options;
        if (key === "value") {
            if (value > O.max || value < O.min)
                this.warning(this.element);
            value = this.snap(Math.min(O.max, Math.max(O.min, value)));
        }
        return Widget.prototype.set.call(this, key, value);
    },
});
/**
 * @member {Scale} Fader#scale - A {@link Scale} to display a scale next to the fader.
 */
define_child_widget(Fader, "scale", {
    create: Scale,
    show: true,
    inherit_options: true,
    toggle_class: true,
    static_events: {
        set: function(key, value) {
            /**
             * Is fired when the scale was changed.
             * 
             * @event Fader#scalechanged
             * 
             * @param {string} key - The key of the option.
             * @param {mixed} value - The value to which it was set.
             */
            if (this.parent)
                this.parent.emit("scalechanged", key, value);
        },
    },
});
/**
 * @member {Label} Fader#label - A {@link Label} to display a title.
 */
define_child_widget(Fader, "label", {
    create: Label,
    show: false,
    toggle_class: true,
    option: "label",
    map_options: {
        label: "label",
    },
});
/**
 * @member {Value} Fader#value - A {@link Value} to display the current value, offering a way to enter a value via keyboard.
 */
define_child_widget(Fader, "value", {
    create: Value,
    show: false,
    static_events: {
        "valueset" : function (v) { this.parent.set("value", v); }
    },
    map_options: {
        value: "value",
        format: "format",
    },
    toggle_class: true,
});

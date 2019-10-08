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
import { tooltip } from './tooltips.js';
import {
    set_text, element, add_class, toggle_class, remove_class, supports_transform,
    css_space, outer_height, inner_height, outer_width, inner_width
  } from '../utils/dom.js';
import { define_child_widget } from '../child_widget.js';
import { S } from '../dom_scheduler.js';

function vert(O) {
    return O.layout === "left" || O.layout === "right";
}
function get_value(ev) {
    var is_vertical = vert(this.options);
    var pos, real, hsize, pad;
    hsize = this._handle_size / 2;
    pad = this._padding;
    
    if (is_vertical) {
        real  = this.options.basis - (ev.offsetY - hsize) + pad.bottom;
    } else {
        real  = ev.offsetX - hsize + pad.left;
    }
    return this.px2val(real);
}
function tooltip_by_position(ev, tt) {
    if (this._handle.contains(ev.target)) {
        tooltip_by_value.call(this, ev, tt);
        return;
    }
    var val = this.snap(get_value.call(this, ev));
    set_text(tt, this.options.tooltip(val));
}
function tooltip_by_value(ev, tt) {
    set_text(tt, this.options.tooltip(this.options.value));
}
function mouseenter (ev) {
    if (!this.options.tooltip) return;
    tooltip.add(1, this.tooltip_by_position);
}
function clicked(ev) {
    var value;
    if (this._handle.contains(ev.target)) return;
    if (this.value.element.contains(ev.target)) return;
    if (this.label.element.contains(ev.target)) return;
    if (this.scale.element.contains(ev.target)) return;
    value = this.userset("value", get_value.call(this, ev));
    if (this.options.tooltip && tooltip._entry)
        set_text(tooltip._entry, this.options.tooltip(this.options.value));
}
function mouseleave (ev) {
    tooltip.remove(1, this.tooltip_by_position);
}
function startdrag(ev) {
    if (!this.options.tooltip) return;
    tooltip.add(0, this.tooltip_by_value);
}
function stopdrag(ev) {
    tooltip.remove(0, this.tooltip_by_value);
}
function scrolling(ev) {
    if (!this.options.tooltip) return;
    set_text(tooltip._entry, this.options.tooltip(this.options.value));
}
function dblclick(ev) {
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
function activate_tooltip() {
    if (!this.tooltip_by_position) {
        this.tooltip_by_position = tooltip_by_position.bind(this);
        this.tooltip_by_value = tooltip_by_value.bind(this);
        this.__startdrag = startdrag.bind(this);
        this.__stopdrag = stopdrag.bind(this);
        this.__scrolling = scrolling.bind(this);
    }
    this.on("mouseenter", mouseenter);
    this.on("mouseleave", mouseleave);
    this.drag.on("startdrag", this.__startdrag);
    this.drag.on("stopdrag", this.__stopdrag);
    this.scroll.on("scrolling", this.__scrolling);
}

function deactivate_tooltip() {
    if (!this.tooltip_by_position) return;
    tooltip.remove(0, this.tooltip_by_value);
    tooltip.remove(1, this.tooltip_by_position);
    this.off("mouseenter", mouseenter);
    this.off("mouseleave", mouseleave);
    this.drag.off("startdrag", this.__startdrag);
    this.drag.off("stopdrag", this.__stopdrag);
    this.scroll.off("scrolling", this.__scrolling);
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
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Number} [options.value] - The faders position. This options is
 *   modified by user interaction.
 * @property {Function} [options.tooltip=false] - An optional formatting function for
 *   the tooltip value. The tooltip will show the value the mouse cursor is
 *   currently hovering over. If this option is not set, no tooltip will be shown.
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
    _class: "Fader",
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
        tooltip: "function",
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
        tooltip: false,
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
        set_tooltip: function(value) {
            (value ? activate_tooltip : deactivate_tooltip).call(this);
        },
        set_layout: function(value) {
            this.options.direction = vert(this.options) ? "vertical" : "horizontal";
            this.drag.set("direction", this.options.direction);
            this.scroll.set("direction", this.options.direction);
        },
    },
    initialize: function (options) {
        this.__tt = false;
        Widget.prototype.initialize.call(this, options);

        var E, O = this.options;
        
        /**
         * @member {HTMLDivElement} Fader#element - The main DIV container.
         *   Has class <code.aux-fader</code>.
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "aux-fader");
        this.widgetize(E, true, true, true);

        /**
         * @member {HTMLDivElement} Fader#_track - The track for the handle. Has class <code.aux-track</code>.
         */
        this._track = element("div", "aux-track");
        this.element.appendChild(this._track);
        
        /**
         * @member {HTMLDivElement} Fader#_handle - The handle of the fader. Has class <code.aux-handle</code>.
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
            limit: true,
        });
        /**
         * @member {ScrollValue} Fader#scroll - Instance of {@link ScrollValue} used for the
         *   handle interaction.
         */
        this.scroll = new ScrollValue(this, {
            node:    this.element,
            classes: this.element,
            limit: true,
        });
        
        this.set("bind_click", O.bind_click);
        this.set("bind_dblclick", O.bind_dblclick);
        this.set("tooltip", O.tooltip);
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
            tmp = this.val2px(this.snap(O.value)) + "px"

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
        tooltip.remove(0, this.tooltip_by_value);
        tooltip.remove(1, this.tooltip_by_position);
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
        if (key === "value") {
            if (value > this.options.max || value < this.options.min)
                this.warning(this.element);
            value = this.snap(value);
        }

        return Widget.prototype.set.call(this, key, value);
    },
    userset: function (key, value) {
        if (key == "value") {
            if (value > this.options.max || value < this.options.min)
                this.warning(this.element);
            value = this.snap(value);
        }
        return Widget.prototype.userset.call(this, key, value);
    }
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
 * @member {Label} Fader#label - A {@link label} to display a title.
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
 * @member {Label} Fader#value - A {@link Value} to display the current value, offering a way to enter a value via keyboard.
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

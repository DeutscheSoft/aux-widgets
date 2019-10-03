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
import { define_class } from '../widget_helpers.js';
import { define_child_widget } from '../child_widget.js';
import { Widget } from './widget.js';
import { Label } from './label.js';
import { Gradient } from '../implements/gradient.js';
import { Scale } from './scale.js';
import {
    element, add_class, get_style, toggle_class, remove_class, insert_after,
    inner_width, inner_height
  } from '../utils/dom.js';

import { FORMAT } from '../utils/sprintf.js';
import { S } from '../dom_scheduler.js';

function vert(O) {
    return O.layout === "left" || O.layout === "right";
}
function fill_interval(ctx, w, h, a, is_vertical) {
    var i;
    if (is_vertical) {
        for (i = 0; i < a.length; i+= 2) {
            ctx.fillRect(0, h - a[i+1], w, a[i+1]-a[i]);
        }
    } else {
        for (i = 0; i < a.length; i+= 2) {
            ctx.fillRect(a[i], 0, a[i+1]-a[i], h);
        }
    }
}
function clear_interval(ctx, w, h, a, is_vertical) {
    var i;
    if (is_vertical) {
        for (i = 0; i < a.length; i+= 2) {
            ctx.clearRect(0, h - a[i+1], w, a[i+1]-a[i]);
        }
    } else {
        for (i = 0; i < a.length; i+= 2) {
            ctx.clearRect(a[i], 0, a[i+1]-a[i], h);
        }
    }
}
function draw_full(ctx, w, h, a, is_vertical) {

    ctx.fillRect(0, 0, w, h);
    clear_interval(ctx, w, h, a, is_vertical);
}
function make_interval(a) {
    var i, tmp, again, j;

    do {
        again = false;
        for (i = 0; i < a.length-2; i+=2) {
            if (a[i] > a[i+2]) {
                tmp = a[i];
                a[i] = a[i+2];
                a[i+2] = tmp;

                tmp = a[i+1];
                a[i+1] = a[i+3];
                a[i+3] = tmp;
                again = true;
            }
        }
    } while (again);

    for (i = 0; i < a.length-2; i+= 2) {
        if (a[i+1] > a[i+2]) {
            if (a[i+3] > a[i+1]) {
                a[i+1] = a[i+3];
            }
            for (j = i+3; j < a.length; j++) a[j-1] = a[j];
            a.length = j-2;
            i -=2;
            continue;
        }
    }
}
function cmp_intervals(a, b) {
    var ret = 0;
    var i;

    for (i = 0; i < a.length; i+=2) {
        if (a[i] === b[i]) {
            if (a[i+1] === b[i+1]) continue;
            ret |= (a[i+1] < b[i+1]) ? 1 : 2;
        } else if (a[i+1] === b[i+1]) {
            ret |= (a[i] > b[i]) ? 1 : 2;
        } else return 4;
    }
    return ret;
}
function subtract_intervals(a, b) {
    var i;
    var ret = [];

    for (i = 0; i < a.length; i+=2) {
        if (a[i] === b[i]) {
            if (a[i+1] <= b[i+1]) continue;
            ret.push(b[i+1], a[i+1]);
        } else {
            if (a[i] > b[i]) continue;
            ret.push(a[i], b[i]);
        }
    }

    return ret;
}
export const Meter = define_class({
    /**
     * Meter is a base class to build different meters such as {@link LevelMeter} from.
     * Meter uses {@link Gradient} and contains a {@link Scale} widget.
     * Meter inherits all options from {@link Scale}.
     * 
     * Note that the two options <code>format_labels</code> and
     * <code>scale_base</code> have different names here.
     *
     * Note that level meters with high update frequencies can be very demanding when it comes
     * to rendering performance. These performance requirements can be reduced by increasing the
     * segment size using the <code>segment</code> option. Using a segment, the different level
     * meter positions are reduced. This widget will take advantage of that by avoiding rendering those
     * changes to the meter level, which fall into the same segment.
     *
     * @class Meter
     * 
     * @extends Widget
     *
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {String} [options.layout="left"] - A string describing the layout of the meter.
     *   Possible values are <code>"left"</code>, <code>"right"</code>, <code>"top"</code> and 
     *   <code>"bottom"</code>. <code>"left"</code> and <code>"right"</code> are vertical
     *   layouts, where the meter is on the left or right of the scale, respectively. Similarly,
     *   <code>"top"</code> and <code>"bottom"</code> are horizontal layouts in which the meter
     *   is at the top or the bottom, respectively.
     * @property {Integer} [options.segment=1] - Segment size. Pixel positions of the meter level are
     *   rounded to multiples of this size. This can be used to give the level meter a LED effect and to
     *   reduce processor load.
     * @property {Number} [options.value=0] - Level value.
     * @property {Number} [options.base=false] - The base value of the meter. If set to <code>false</code>,
     *   the base will coincide with the minimum value <code>options.min</code>. The meter level is drawn
     *   starting from the base to the value.
     * @property {Number} [options.label=0] - Value to be displayed on the label. 
     * @property {Function} [options.format_label=FORMAT("%.2f")] - Function for formatting the 
     *   label.
     * @property {Boolean} [options.show_label=false] - If set to <code>true</code> a label is displayed.
     * @property {Number} [options.title=false] - The title of the Meter. Set to `false` to hide it.
     * @property {Boolean} [options.show_scale=true] - Set to <code>false</code> to hide the scale.
     * @property {Number|Boolean} [options.scale_base=false] - Base of the meter scale, see {@link Scale} for more information.
     * @property {Boolean} [options.show_labels=true] - If <code>true</code>, display labels on the
     *   scale.
     * @property {Function} [options.format_labels=FORMAT("%.2f")] - Function for formatting the 
     *   scale labels. This is passed to Scale as option <code>labels</code>.
     *
     */
    
    _class: "Meter",
    Extends: Widget,
    Implements: [Gradient],
    _options: Object.assign(Object.create(Widget.prototype._options),
                            Gradient.prototype._options, Scale.prototype._options, {
        layout: "string",
        segment: "number",
        value: "number",
        base: "number|boolean",
        min: "number",
        max: "number",
        label: "number",
        title: "string|boolean",
        show_labels: "boolean",
        format_label: "function",
        scale_base: "number|boolean",
        format_labels: "function",
        background: "string|boolean",
        gradient: "object|boolean"
    }),
    options: {
        layout:          "left",
        segment:         1,
        value:           0,
        base:            false,
        label:           0,
        title:           false,
        show_labels:     true,
        format_label:    FORMAT("%.2f"),
        levels:          [1, 5, 10],     // array of steps where to draw labels
        scale_base:       false,
        format_labels:   FORMAT("%.2f"),
        background:      false,
        gradient:        false
    },
    static_events: {
        set_label: function(value) {
            /**
             * Is fired when the label changed.
             * The argument is the actual label value.
             * 
             * @event Meter#labelchanged
             * 
             * @param {string} label - The label of the {@link Meter}.
             */
            this.emit("labelchanged", value);
        },
        set_title: function(value) {
            /**
             * Is fired when the title changed.
             * The argument is the actual title.
             * 
             * @event Meter#titlechanged
             * 
             * @param {string} title - The title of the {@link Meter}.
             */
            this.emit("titlechanged", value);
        },
        set_segment: function(value) {
            // what is this supposed to do?
            // -> probably invalidate the value to force a redraw
            this.set("value", this.options.value);
        },
        set_value: function(value) {
            /**
             * Is fired when the value changed.
             * The argument is the actual value.
             * 
             * @event Meter#valuechanged
             * 
             * @param {number} value - The value of the {@link Meter}.
             */
            this.emit("valuechanged", value);
        },
        set_base: function(value) {
            if (value === false) {
              var O = this.options;
              O.base = value = O.min;
            }
            /**
             * Is fired when the base value changed.
             * The argument is the actual base value.
             * 
             * @event Meter#basechanged
             * 
             * @param {number} base - The value of the base.
             */
            this.emit("basechanged", value);
        },
        rangedchanged: function() {
            /* redraw the gradient, if we have any */

            var gradient = this.options.gradient;

            if (gradient) {
              this.set("gradient", gradient);
            }
        },
    },
    
    initialize: function (options) {
        var E;
        Widget.prototype.initialize.call(this, options);
        var O = this.options;
        /**
         * @member {HTMLDivElement} Meter#element - The main DIV container.
         *   Has class <code.aux-meter-base</code>.
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "aux-meter-base");
        this.widgetize(E, false, true, true);
        
        this._bar = element("div", "aux-bar");
        /**
         * @member {HTMLCanvas} Meter#_canvas - The canvas element drawing the mask.
         *   Has class <code.aux-mask</code>.
         */
        this._canvas = document.createElement("canvas");
        add_class(this._canvas, "aux-mask");

        this._fillstyle = false;
        
        E.appendChild(this._bar);

        this._bar.appendChild(this._canvas);
        
        /**
         * @member {HTMLDivElement} Meter#_bar - The DIV element containing the masks
         *      and drawing the background. Has class <code.aux-bar</code>.
         */
        this.delegate(this._bar);
        this._last_meters = [];
        this._current_meters = [];

        this.set("label", O.value);
        this.set("base", O.base);
    },

    destroy: function () {
        this._bar.remove();
        Widget.prototype.destroy.call(this);
    },
    redraw: function () {
        var I = this.invalid;
        var O = this.options;
        var E = this.element;

        if (this._fillstyle === false) {
            this._canvas.style.removeProperty("background-color");
            S.add(function() {
                this._fillstyle = get_style(this._canvas, "background-color");
                S.add(function() {
                    this._canvas.getContext("2d").fillStyle = this._fillstyle;
                    this._canvas.style.setProperty("background-color", "transparent", "important");
                    this.trigger_draw();
                }.bind(this), 3);
            }.bind(this), 2);
        }

        if (I.reverse) {
            I.reverse = false;
            toggle_class(E, "aux-reverse", O.reverse);
        }
        if (I.gradient || I.background) {
            I.gradient = I.background = false;
            this.draw_gradient(this._bar, O.gradient, O.background);
        }

        Widget.prototype.redraw.call(this);
        
        if (I.layout) {
            I.layout = false;
            remove_class(E, "aux-vertical",
                            "aux-horizontal", "aux-left",
                            "aux-right", "aux-top", "aux-bottom");
            var scale = this.scale ? this.scale.element : null;
            var bar = this._bar;
            switch (O.layout) {
                case "left":
                    add_class(E, "aux-vertical", "aux-left");
                    if (scale) insert_after(scale, bar);
                    break;
                case "right":
                    add_class(E, "aux-vertical", "aux-right");
                    if (scale) insert_after(bar, scale);
                    break;
                case "top":
                    add_class(E, "aux-horizontal", "aux-top");
                    if (scale) insert_after(scale, bar);
                    break;
                case "bottom":
                    add_class(E, "aux-horizontal", "aux-bottom");
                    if (scale) insert_after(bar, scale);
                    break;
                default:
                    throw new Error("unsupported layout");
            }
        }

        if (this._fillstyle === false) return;

        if (I.basis && O._height > 0 && O._width > 0) {
            this._canvas.setAttribute("height", Math.round(O._height));
            this._canvas.setAttribute("width", Math.round(O._width));
            /* FIXME: I am not sure why this is even necessary */
            this._canvas.style.width = O._width + "px";
            this._canvas.style.height = O._height + "px";
            this._canvas.getContext("2d").fillStyle = this._fillstyle;
        }
        
        if (I.value && O.show_label) {
            this.label.set("label", O.format_label(O.value));
        }
        
        if (I.value || I.basis || I.min || I.max) {
            I.basis = I.value = I.min = I.max = false;
            this.draw_meter();
        }
    },

    resize: function() {
        var O = this.options;
        Widget.prototype.resize.call(this);
        var w = inner_width(this._bar);
        var h = inner_height(this._bar);
        this.set("_width", w);
        this.set("_height", h);
        var i = vert(O) ? h : w;
        this.set("basis", i);
        this._last_meters.length = 0;
        this._fillstyle = false;
    },

    calculate_meter: function(to, value, i) {
        var O = this.options;
        // Set the mask elements according to options.value to show a value in
        // the meter bar
        var base = O.base;
        var segment = O.segment|0;
        var reverse = !!O.reverse;
        var size = O.basis|0;

        /* At this point the whole meter bar is filled. We now want
         * to clear the area between base and value.
         */

        /* canvas coordinates are reversed */
        var v1 = this.val2px(base)|0;
        var v2 = this.val2px(value)|0;

        if (segment !== 1) v2 = segment*(Math.round(v2/segment)|0);

        if (v2 < v1) {
            to[i++] = v2;
            to[i++] = v1;
        } else {
            to[i++] = v1;
            to[i++] = v2;
        }

        return i;
    },
    
    draw_meter: function () {
        var O = this.options;
        var w = Math.round(O._width);
        var h = Math.round(O._height);
        var i, j;

        if (!(w > 0 && h > 0)) return;

        var a = this._current_meters;
        var tmp = this._last_meters;

        var i = this.calculate_meter(a, O.value, 0);
        if (i < a.length) a.length = i;
        make_interval(a);

        this._last_meters = a;
        this._current_meters = tmp;

        var diff;

        if (tmp.length === a.length) {
            diff = cmp_intervals(tmp, a)|0;
        } else diff = 4;

        if (!diff) return;

        // FIXME: this is currently broken for some reason
        if (diff == 1)
          diff = 4;

        var ctx = this._canvas.getContext("2d");
        ctx.fillStyle = this._fillstyle;
        var is_vertical = vert(O);

        if (diff === 1) {
            /* a - tmp is non-empty */
            clear_interval(ctx, w, h, subtract_intervals(a, tmp), is_vertical);
            return;
        }
        if (diff === 2) {
            /* tmp - a is non-empty */
            fill_interval(ctx, w, h, subtract_intervals(tmp, a), is_vertical);
            return;
        }

        draw_full(ctx, w, h, a, is_vertical);
    },
    
    // HELPERS & STUFF
    _val2seg: function (val) {
        // rounds values to fit in the segments size
        // always returns values without taking options.reverse into account
        var s = +this.val2px(this.snap(val));
        s -= s % +this.options.segment;
        if (this.options.reverse)
            s = +this.options.basis - s;
        return s;
    },

    has_base: function() {
        var O = this.options;
        return O.base > O.min;
    },
    
});
/**
 * @member {Scale} Meter#scale - The {@link Scale} of the meter.
 */
define_child_widget(Meter, "scale", {
    create: Scale,
    map_options: {
        format_labels: "labels",
        scale_base: "base",
    },
    inherit_options: true,
    show: true,
    toggle_class: true,
    static_events: {
        set: function(key, value) {
            var p = this.parent;
            if (p)
              p.emit("scalechanged", key, value);
        },
    },
});
/**
 * @member {Label} Meter#title - The {@link Label} displaying the title.
 *   Has class <code.aux-title</code>.
 */
define_child_widget(Meter, "title", {
    create: Label,
    show: false,
    option: "title",
    default_options: { "class" : "aux-title" },
    map_options: { "title" : "label" },
    toggle_class: true,
});
/**
 * @member {Label} Meter#label - The {@link Label} displaying the label.
 */
define_child_widget(Meter, "label", {
    create: Label,
    show: false,
    default_options: { "class" : "aux-value" },
    toggle_class: true,
});

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
import { Widget } from './widget.js';
import { Ranges } from '../implements/ranges.js';
import { make_svg, add_class, remove_class } from '../utils/dom.js';
import { error } from '../utils/log.js';

function range_change_cb() {
    this.invalidate_all();
    this.trigger_draw();
};
// this is not really a rounding operation but simply adds 0.5. we do this to make sure
// that integer pixel positions result in actual pixels, instead of being spread across
// two pixels with half opacity
function svg_round(x) {
    x = +x;
    return x + 0.5;
}
function get_px(value, range) {
    return svg_round(range.val2px(value));
}

function _start(d, s) {
    var w = this.range_x.options.basis;
    var h = this.range_y.options.basis;
    var t = d[0].type || this.options.type;
    var m = this.options.mode;
    var x = this.range_x.val2px(d[0].x);
    var y = this.range_y.val2px(d[0].y);
    switch (m) {
        case "bottom":
            // fill the lower part of the graph
            s.push(
                "M " + svg_round(x - 1) + " ",
                svg_round(h + 1) + " " + t + " ",
                svg_round(x - 1) + " ",
                svg_round(y)
            );
            break;
        case "top":
            // fill the upper part of the graph
            s.push("M " + svg_round(x - 1) + " " + svg_round(-1),
                   " " + t + " " + svg_round(x - 1) + " ",
                   svg_round(y)
            );
            break;
        case "center":
            // fill from the mid
            s.push(
                   "M " + svg_round(x - 1) + " ",
                    svg_round(0.5 * h)
            );
            break;
        case "base":
            // fill from variable point
            s.push(
                   "M " + svg_round(x - 1) + " ",
                    svg_round((1 - this.options.base) * h)
            );
            break;
        default:
            error("Unsupported mode:", m);
            /* FALL THROUGH */
        case "line":
            // fill nothing
            s.push("M " + svg_round(x) + " " + svg_round(y));
            break;
    }
}
function _end(d, s) {
    var a = 0.5;
    var dot = d[d.length-1];
    var h = this.range_y.options.basis;
    var t = dot.type || this.options.type;
    var m = this.options.mode;
    var x = this.range_x.val2px(dot.x);
    var y = this.range_y.val2px(dot.y);
    switch (m) {
        case "bottom":
            // fill the graph below
            s.push(" " + t + " " + svg_round(x) + " " + svg_round(h + 1) + " Z");
            break;
        case "top":
            // fill the upper part of the graph
            s.push(" " + t + " " + svg_round(x + 1) + " " + svg_round(-1) + " Z");
            break;
        case "center":
            // fill from mid
            s.push(" " + t + " " + svg_round(x + 1) + " " + svg_round(0.5 * h) + " Z");
            break;
        case "base":
            // fill from variable point
            s.push(" " + t + " " + svg_round(x + 1) + " " + svg_round((-m + 1) * h) + " Z");
            break;
        default:
            error("Unsupported mode:", m);
            /* FALL THROUGH */
        case "line":
            // fill nothing
            break;
    }
}
    
export const Graph = define_class({
    /**
     * Graph is a single SVG path element. It provides
     * some functions to easily draw paths inside Charts and other
     * derivates.
     *
     * @class Graph
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Function|Object} options.range_x - Callback function
     *   returning a {@link Range} module for x axis or an object with options
     *   for a new {@link Range}.
     * @property {Function|Object} options.range_y - Callback function
     *   returning a {@link Range} module for y axis or an object with options
     *   for a new {@link Range}.
     * @property {Array<Object>|String} options.dots=[] - The dots of the path.
     *   Can be a ready-to-use SVG-path-string or an array of objects like
     *   <code>{x: x, y: y [, x1: x1, y1: y1, x2: x2, y2: y2, type: type]}</code> (depending on the type,
     *   see `options.type` for more information). `type` is optional and defines a different type
     *   as explained under `options.type` for a specific dot. If omitted, the
     *   general `options.type` is used.
     * @property {String} [options.type="L"] - Type of the graph (needed values in dots object):
     *   <ul>
     *     <li><code>L</code>: normal (needs x,y)</li>
     *     <li><code>T</code>: smooth quadratic Bézier (needs x, y)</li>
     *     <li><code>H[n]</code>: smooth horizontal, [n] = smoothing factor between 1 (square) and 5 (nearly no smooth)</li>
     *     <li><code>Q</code>: quadratic Bézier (needs: x1, y1, x, y)</li>
     *     <li><code>C</code>: CurveTo (needs: x1, y1, x2, y2, x, y)</li>
     *     <li><code>S</code>: SmoothCurve (needs: x1, y1, x, y)</li>
     *   </ul>
     * @property {String} [options.mode="line"] - Drawing mode of the graph, possible values are:
     *   <ul>
     *     <li><code>line</code>: line only</li>
     *     <li><code>bottom</code>: fill below the line</li>
     *     <li><code>top</code>: fill above the line</li>
     *     <li><code>center</code>: fill from the vertical center of the canvas</li>
     *     <li><code>base</code>: fill from a percentual position on the canvas (set with base)</li>
     *   </ul>
     * @property {Number} [options.base=0] - If mode is <code>base</code> set the position
     *   of the base line to fill from between 0 (bottom) and 1 (top).
     * @property {String} [options.color=""] - Set the color of the path.
     *   Better use <code>stroke</code> and <code>fill</code> via CSS.
     * @property {String|Boolean} [options.key=false] - Show a description
     *   for this graph in the charts key, <code>false</code> to turn it off.
     * 
     * @extends Widget
     * 
     * @mixes Ranges
     */
    Extends: Widget,
    Implements: Ranges,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        dots: "array",
        type: "string",
        mode: "string",
        base: "number",
        color: "string",
        range_x: "object",
        range_y: "object",
        key: "string|boolean",
        element: void(0),
    }),
    options: {
        dots:      null,
        type:      "L",
        mode:      "line",
        base:      0,
        color:     "",
        key:       false
    },
    
    initialize: function (options) {
        Widget.prototype.initialize.call(this, options);
        /** @member {SVGPath} Graph#element - The SVG path. Has class <code>.aux-graph</code> 
         */
        this.element = make_svg("path");
        /** @member {Range} Graph#range_x - The range for the x axis. 
         */
        /** @member {Range} Graph#range_y - The range for the y axis.
         */
        if (this.options.range_x) this.set("range_x", this.options.range_x);
        if (this.options.range_y) this.set("range_y", this.options.range_y);
        this.set("color", this.options.color);
        this.set("mode",  this.options.mode);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-graph");

      Widget.prototype.draw.call(this, O, element);
    },
    
    redraw: function () {
        var I = this.invalid;
        var O = this.options;
        var E = this.element;

        if (I.color) {
            I.color = false;
            E.style.stroke = O.color;
        }

        if (I.mode) {
            I.mode = false;
            remove_class(E, "aux-filled");
            remove_class(E, "aux-outline");
            add_class(E, O.mode === "line" ?  "aux-outline" : "aux-filled");
        }

        if (I.validate("dots", "type")) {
            var dots = O.dots;
            var type = O.type;
            var RX = this.range_x;
            var RY = this.range_y;
            var w = RX.options.basis;
            var h = RY.options.basis;
        
            if (typeof dots === "string") {
                E.setAttribute("d", dots);
            } else if (!dots) {
                E.setAttribute("d", "");
            } else {
                // if we are drawing a line, _start will do the first point
                var i = O.mode === "line" ? 1 : 0;
                var s = [];
                var f, t, _t, dot;

                _start.call(this, dots, s);
                
                _t = dots[i].type || type;
                f = _t.length > 1 ? parseFloat(_t.substr(1)) : 3;
                if (_t.substr(0) === "H" && i === 0) {
                    i++;
                    s.push(" S" + get_px(dots[i].x, RX) + "," + get_px(dots[i].y, RY) + " " + get_px(dots[i].x, RX) + "," + get_px(dots[i].y, RY));
                }
                        
                for (; i < dots.length; i++) {
                    dot = dots[i];
                    t = dot.type || type;
                    t = t.substr(0,1);
                    switch (t) {
                    case "L":
                    case "T":
                        s.push(" " + t + " " + get_px(dot.x, RX) + " " + get_px(dot.y, RY));
                        break;
                    case "Q":
                    case "S":
                        s.push(" " + t + " "
                            + get_px(dot.x1) + "," + get_px(dot.y1, RY) + " "
                            + get_px(dot.x) + "," + get_px(dot.y, RY));
                        break;
                    case "C":
                        s.push(" " + t + " "
                            + get_px(dot.x1, RX) + "," + get_px(dot.y1, RY) + " "
                            + get_px(dot.x2, RX) + "," + get_px(dot.y2, RY) + " "
                            + get_px(dot.x, RX) + "," + get_px(dot.y, RY));
                        break;
                    case "H":
                        s.push(" S" + (x[i] - Math.round(x[i] - x[i-1])/f) + ","
                            + y[i] + " " + x[i] + "," + y[i]);
                        break;
                    default:
                        error("Unsupported graph type", O.type);
                    }
                }
                
                if (i < dots.length) {
                    _t = dots[i] || type; 
                    if (_t.substr(0) === "H") {
                        s.push(" S" + get_px(dot.x, RX) + "," + get_px(dot.y, RY) + " " + get_px(dot.x, RX) + "," + get_px(dot.y, RY));
                    }
                }
                
                _end.call(this, dots, s);
                E.setAttribute("d", s.join(""));
            }
        }
        Widget.prototype.redraw.call(this);
    },
    
    // GETTER & SETTER
    set: function (key, value) {
        Widget.prototype.set.call(this, key, value);
        switch (key) {
            case "range_x":
            case "range_y":
                this.add_range(value, key);
                value.on("set", range_change_cb.bind(this));
                break;
            case "dots":
                /**
                 * Is fired when the graph changes
                 * @event Graph#graphchanged
                 */
                this.emit("graphchanged");
                break;
        }
    }
});

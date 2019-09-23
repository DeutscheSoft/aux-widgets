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
import { Chart } from './chart.js';
import { add_class, remove_class, css_space, inner_width, inner_height } from '../utils/dom.js';
import { error, warn } from '../utils/log.js';

function range_set(value, key) {
    this.range_x.set(key, value);
    this.range_y.set(key, value);
}
export const Dynamics = define_class({
    /**
     * Dynamics are based on {@link Chart} and display the characteristics of dynamic
     * processors. They are square widgets drawing a {@link Grid} automatically based on
     * the range.
     *
     * @class Dynamics
     * 
     * @extends Chart
     * 
     * @property {Object} options
     * 
     * @param {Number} [options.min=-96] - Minimum decibels to display.
     * @param {Number} [options.max=24] - Maximum decibels to display.
     * @param {String} [options.scale="linear"] - Scale of the display, see {@link Range} for details.
     * @param {String} [options.type=false] - Type of the dynamics: <code>compressor</code>, <code>expander</code>, <code>gate</code>, <code>limiter</code> or <code>false</code> to draw your own graph.
     * @param {Number} [options.threshold=0] - Threshold of the dynamics.
     * @param {Number} [options.ratio=1] - Ratio of the dynamics.
     * @param {Number} [options.makeup=0] - Makeup of the dynamics. This raises the whole graph after all other parameters are applied.
     * @param {Number} [options.range=0] - Range of the dynamics. Only used in type <code>expander</code>. The maximum gain reduction.
     * @param {Number} [options.gain=0] - Input gain of the dynamics.
     * @param {Number} [options.reference=0] - Input reference of the dynamics.
     * @param {Function} [options.grid_labels=function (val) { return val + (!val ? "dB":""); }] - Callback to format the labels of the {@link Grid}.
     * @param {Number} [options.db_grid=12] - Draw a grid line every [n] decibels.
     */
    _class: "Dynamics",
    Extends: Chart,
    _options: Object.assign(Object.create(Chart.prototype._options), {
        size: "number", // deprecated, undocumented. Is set via CSS.
        min:  "number",
        max:  "number",
        scale: "string",
        type:  "string",
        threshold: "number",
        ratio:     "number",
        makeup:    "number",
        range:     "number",
        gain:      "number",
        reference: "number",
        grid_labels: "function",
        db_grid: "number",
    }),
    options: {
        db_grid: 12,
        min:     -96,
        max:     24,
        scale:   "linear",
        type:    false, 
        threshold: 0,
        ratio:     1,
        makeup:    0,
        range:     0,
        gain:      0,
        reference: 0,
        grid_labels: function (val) { return val + (!val ? "dB":""); }
    },
    static_events: {
        set_size: function(value) {
            warn("using deprecated 'size' option");
            this.set("width", value);
            this.set("height", value);
        },
        set_min: range_set,
        set_max: range_set,
        set_scale: range_set,
    },
    initialize: function (options) {
        Chart.prototype.initialize.call(this, options, true);
        var O = this.options;
        /**
         * @member {HTMLDivElement} Dynamics#element - The main DIV container.
         *   Has class <code.aux-dynamics</code>.
         */
        add_class(this.element, "aux-dynamics");
        this.set("scale", O.scale);
        if (O.size) this.set("size", O.size);
        this.set("min", O.min);
        this.set("max", O.max);
        /**
         * @member {Graph} Dynamics#steady - The graph drawing the zero line. Has class <code.aux-steady</code> 
         */
        this.steady = this.add_graph({
            dots: [{x:O.min, y:O.min},
                   {x:O.max, y:O.max}],
            "class": "aux-steady",
            mode: "line"
        });
    },
    
    redraw: function () {
        var O = this.options;
        var I = this.invalid;
        
        Chart.prototype.redraw.call(this);

        if (I.validate("size", "min", "max", "scale")) {
            var grid_x = [];
            var grid_y = [];
            var min = this.range_x.get("min");
            var max = this.range_x.get("max");
            var step = O.db_grid;
            var cls;
            for (var i = min; i <= max; i += step) {
                cls = i ? "" : "aux-highlight";
                grid_x.push({
                    pos:     i,
                    label:   i === min ? "" : O.grid_labels(i),
                    "class": cls
                });
                grid_y.push({
                    pos:     i,
                    label:   i === min ? "" : O.grid_labels(i),
                    "class": cls
                });
            }
            if (this.grid) {
                this.grid.set("grid_x", grid_x);
                this.grid.set("grid_y", grid_y);
            }

            if (this.steady)
                this.steady.set("dots", [{x:O.min, y:O.min}, {x:O.max, y:O.max}]);
        }
        
        if (I.type) {
            if (O._last_type)
                remove_class(this.element, "aux-" + O._last_type);
            add_class(this.element, "aux-" + O.type);
        }

        if (I.validate("ratio", "threshold", "range", "makeup", "gain", "reference")) {
            this.draw_graph();
        }
    },

    resize: function() {
        var O = this.options;
        var E = this.element;
        var S = this.svg;

        /* bypass the Chart resize logic here */
        Chart.prototype.resize.call(this);

        var tmp = css_space(S, "border", "padding");
        var w = inner_width(E) - tmp.left - tmp.right;
        var h = inner_height(E) - tmp.top - tmp.bottom;

        var s = Math.min(h, w);

        if (s > 0 && s !== O._width) {
            this.set("_width", s);
            this.set("_height", s);
            this.range_x.set("basis", s);
            this.range_y.set("basis", s);
        }
    },
    
    draw_graph: function () {
        var O = this.options;
        if (O.type === false) return;
        if (!this.graph) {
            this.graph = this.add_graph({
                dots: [{x: O.min, y: O.min},
                       {x: O.max, y: O.max}]
            });
        }
        var curve = [];
        var range = O.range;
        var ratio = O.ratio;
        var thres = O.threshold;
        var gain = O.gain;
        var ref = O.reference;
        var makeup = O.makeup;
        var min = O.min;
        var max = O.max;
        var s;
        if (ref == 0)
        {
          s = 0;
        }
        else if (!isFinite(ratio))
        {
          s = ref;
        }
        else
        {
          s = (1 / (Math.max(ratio, 1.001) - 1)) * ratio * ref;
        }
        var l = 5; // estimated width of line. dirty workaround for
                   // keeping the line end out of sight in case
                   // salient point is outside the visible are
        switch (O.type) {
            case "compressor":
                // entry point
                curve.push({x: min - l,
                            y: min + makeup - gain + ref - l});
                // salient point
                curve.push({x: thres + gain - s,
                            y: thres + makeup - s + ref});
                // exit point
                if (isFinite(ratio) && ratio > 0) {
                    curve.push({x: max,
                                y: thres + makeup + (max - thres - gain) / ratio
                               });
                } else if (ratio === 0) {
                    curve.push({x: thres,
                                y: max
                               });
                } else {
                    curve.push({x: max,
                                y: thres + makeup
                               });
                }

                break;
            case "limiter":
                curve.push({x: min,
                            y: min + makeup - gain});
                curve.push({x: thres + gain,
                            y: thres + makeup});
                curve.push({x: max,
                            y: thres + makeup});
                break;
            case "gate":
                curve.push({x: thres,
                            y: min});
                curve.push({x: thres,
                            y: thres + makeup});
                curve.push({x: max,
                            y: max + makeup});
                break;
            case "expander":
                if (O.ratio !== 1) {
                    curve.push({x: min,
                                y: min + makeup + range});
                    
                    var y = (ratio * range + (ratio - 1) * thres) / (ratio - 1);
                    curve.push({x: y - range,
                                y: y + makeup});
                    curve.push({x: thres,
                                y: thres + makeup});
                }
                else
                    curve.push({x: min,
                                y: min + makeup});
                curve.push({x: max,
                            y: max + makeup});
                break;
            default:
                warn("Unsupported type", O.type);
        }
        this.graph.set("dots", curve);
    },
    set: function (key, val) {
        if (key == "type")
            this.options._last_type = this.options.type;
        return Chart.prototype.set.call(this, key, val);
    },
});

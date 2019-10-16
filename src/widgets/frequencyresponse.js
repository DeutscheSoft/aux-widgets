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
import { add_class } from '../utils/dom.js';

function calculate_grid(range, step) {
    var min = range.get("min");
    var max = range.get("max");
    var grid = [];
    var i, cls;


    for (i = min; i <= max; i += step) {
        if (i == 0) {
            cls = "aux-highlight";
        } else {
            cls = "";
        }
        grid.push({
            pos:     i,
            label:   i === min ? "" : i + "dB",
            "class": cls
        });
    }

    return grid;
}

export const FrequencyResponse = define_class({
    /**
     * FrequencyResponse is a {@link Chart} drawing frequencies on the x axis and dB
     * values on the y axis. This widget automatically draws a {@link Grid} depending
     * on the ranges.
     *
     * @class FrequencyResponse
     * 
     * @extends Chart
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Number} [options.db_grid=12] - Distance in decibels between y axis grid lines.
     * @property {Object} [options.range_x={min:20, max:20000, scale:"frequency"}] - Either a function returning a {@link Range}
     *   or an object containing options for a new {@link Range}
     * @property {Object} [options.range_y={min:-36, max: 36, scale: "linear"}] - Either a function returning a {@link Range}
     *   or an object containing options for a new {@link Range}
     * @property {Array<Object>} [options.grid_x=[{pos:    20, label: "20 Hz"}, {pos:    30}, {pos:    40}, {pos:    50}, {pos:    60}, {pos:    70}, {pos:    80}, {pos:    90}, {pos:   100, label: "100 Hz"}, {pos:   200}, {pos:   300}, {pos:   400}, {pos:   500}, {pos:   600}, {pos:   700}, {pos:   800}, {pos:   900}, {pos:  1000, label: "1000 Hz"}, {pos:  2000}, {pos:  3000}, {pos:  4000}, {pos:  5000}, {pos:  6000}, {pos:  7000}, {pos:  8000}, {pos:  9000}, {pos: 10000, label: "10000 Hz"}, {pos: 20000, label: "20000 Hz"}]] - An array containing objects with the following optional members:
     * @property {Number} [options.grid_x.pos] - The value where to draw grid line and corresponding label.
     * @property {String} [options.grid_x.color] - A valid CSS color string to colorize the elements.
     * @property {String} [options.grid_x.class] - A class name for the elements.
     * @property {String} [options.grid_x.label] - A label string.
     * @property {String} [options.scale="linear"] - The type of the decibels scale. See {@link Range} for more details.
     * @property {Number} [options.depth=0] - The depth of the z axis (<code>basis</code> of options.range_z)
     */
    Extends: Chart,
    _options: Object.assign(Object.create(Chart.prototype._options), {
        db_grid: "number",
        grid_x: "array",
        scale: "boolean",
        depth: "number",
    }),
    options: {
        db_grid: 12,                                         // dB grid distance
        range_x: {min:20, max:20000, scale:"frequency"},   // Range x options
        range_y: {min:-36, max: 36, scale: "linear"}, // Range y options
        range_z: {min:0.1, max:10, scale:"linear"},
        grid_x:  [
                    {pos:    20, label: "20Hz"},
                    {pos:    30},
                    {pos:    40},
                    {pos:    50},
                    {pos:    60},
                    {pos:    70},
                    {pos:    80},
                    {pos:    90},
                    {pos:   100, label: "100Hz"},
                    {pos:   200},
                    {pos:   300},
                    {pos:   400},
                    {pos:   500},
                    {pos:   600},
                    {pos:   700},
                    {pos:   800},
                    {pos:   900},
                    {pos:  1000, label: "1kHz"},
                    {pos:  2000},
                    {pos:  3000},
                    {pos:  4000},
                    {pos:  5000},
                    {pos:  6000},
                    {pos:  7000},
                    {pos:  8000},
                    {pos:  9000},
                    {pos: 10000, label: "10kHz"},
                    {pos: 20000, label: "20kHz"}],        // Frequency grid
        scale:  false,                                       // the mode of the
                                                             // dB scale
        depth: 0,   // the depth of the z axis (basis of range_z)
    },
    static_events: {
        set_scale: function(value, key) {
            this.range_y.set("scale", value);
        },
        set_db_grid: function(value) {
            this.set("grid_y", calculate_grid(this.range_y, value));
        },
    },
    initialize: function (options) {
        Chart.prototype.initialize.call(this, options);

        options = this.options;

        if (options.scale)
            this.set("scale", options.scale, true);
        /**
         * @member {HTMLDivElement} FrequencyResponse#element - The main DIV container.
         *   Has class <code>.aux-frequencyresponse</code>.
         */
        add_class(this.element, "aux-frequencyresponse");
        /** 
         * @member {SVGGroup} Chart#_handles - The SVG group containing all handles.
         *      Has class <code>.aux-responsehandles</code>.
         */
        add_class(this._handles, "aux-responsehandles");
        
        // do not overwrite custom grids, please
        if (this.options.db_grid && !this.options.grid_y.length)
            this.set("db_grid", this.options.db_grid);
        this.range_y.on("set", function (key, value) {
            if (key === "scale")
                this.options.scale = value;
        }.bind(this));
        if (this.options.depth) this.set("depth", this.options.depth);
    },

    redraw: function() {
        var I = this.invalid;
        var O = this.options;

        if (I.scale) {
            I.scale = false;
            // tell chart to redraw
            I.ranges = true;
        }

        Chart.prototype.redraw.call(this);
    },
});

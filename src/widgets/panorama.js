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
import { define_class } from '../widget_helpers.js';
import { Chart } from './chart.js';
import { ChartHandle } from './charthandle.js';
    import { add_class, remove_class } from '../utils/dom.js';
import { define_child_widget } from '../child_widget.js';
import { warn } from '../utils/log.js';

/**
 * Panorama is a {@link Chart} with a single handle to set panorama
 * or balance on stereo and surround channels.
 * 
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {String} [options.mode="panorama"] - Mode of the widget:
 *   `panorama` only sets the x parameter and is displayed by a vertical line.
 *   `balance` is a stereo to stereo transformer offering two vertical lines setting x and y.
 *   `surround` offers a circular handle setting x and y parameters.
 * @property {Number} [options.range=100] - Sets x and y range to
 *   {min:-n,max:n}. If more fine grained access is needed, range_x and
 *   range_y need to be set directly.
 * @property {Integer} [options.digits=1] - Amount of digits for displaying
 *   values in labels.
 * 
 * @extends Chart
 * 
 * @class Panorama
 */
export const Panorama = define_class({
    Extends: Chart,
    _options: Object.assign(Object.create(Chart.prototype._options), {
        mode: "string",
        range: "number",
        digits: "int",
    }),
    options: {
        mode: "panorama",
        range: 100,
        digits: 1,
        
        square: true,
        range_z: {min:1,max:1},
        grid_x: [{pos:-50,label:"L"},{pos:0,label:"C",class:"aux-center"},{pos:50,label:"R"}],
        grid_y: [{pos:-50,label:"B"},{pos:0,label:"M",class:"aux-center"},{pos:50,label:"F"}],
    },
    static_events: {
        set_mode: function (v) {
            remove_class(this.element, "aux-balance", "aux-surround");
            switch (v) {
                default: warn("Unsupported mode", v); break;
                case "panorama":
                    this.handle1.set("mode", "line-vertical");
                    this.handle2.hide();
                    break;
                case "balance":
                    this.handle1.set("mode", "line-vertical");
                    this.handle2.show();
                    add_class(this.element, "aux-balance");
                    break;
                case "surround":
                    this.handle1.set("mode", "circular");
                    this.handle2.hide();
                    add_class(this.element, "aux-surround");
                    break;
            }
            this.handle1.set("_mode", v);
            this.handle2.set("_mode", v);
        },
        set_range: function (v) {
            this.range_x.set("min", -v);
            this.range_x.set("max", +v);
            this.range_y.set("min", -v);
            this.range_y.set("max", +v);
        },
        set_digits: function (v) {
            this.handle1.set("_digits", v);
            this.handle2.set("_digits", v);
        },
    },
    initialize: function (options) {
        Chart.prototype.initialize.call(this, options);
        /**
         * @member {SVGElement} Panorama#element - The main SVG image.
         *   Has class <code>.aux-panorama</code>.
         */
        this.set_parent(null);
    },
    initialized: function () {
        Chart.prototype.initialized.call(this);
        var O = this.options;
        this.set("range", O.range);
        this.set("digits", O.digits);
        this.set("mode", O.mode);
    },
    draw: function(O, element)
    {
        add_class(element, "aux-panorama");
        
        Chart.prototype.draw.call(this, O, element);
    },
});
function handle_label (label, x, y, z) {
    var O = this.options;
    var s = "";
    if (O._mode == "balance")
        s += label + "\n";
    var lr = x ? x < 0 ? "L" : "R" : "";
    s += lr + " " + Math.abs(x).toFixed(+O._digits);
    if (O._mode == "surround") {
        var fb = y ? y < 0 ? "F" : "B" : "";
        s += "\n" + fb + " " + Math.abs(y).toFixed(+O._digits);
    }
    return s;
}
function handle_label2 (label, x, y, z) {
    var O = this.options;
    var s = label + "\n";
    var lr = y ? y < 0 ? "L" : "R" : "";
    s = lr + " " + Math.abs(y).toFixed(+O._digits);
    return s;
}
/**
 * @member {ChartHandle} Panorama#handle1 - The {@link ChartHandle}
 *   displaying/setting the position on panorama and surround modes.
 *   In panorama mode it affects the `x` parameter, in surround it
 *   affects both, `x` and `y` parameters.
 */
define_child_widget(Panorama, "handle1", {
    create: ChartHandle,
    show: true,
    toggle_class: true,
    map_options: {
        x: "x",
        y: "y",
    },
    default_options: {
        format_label: handle_label,
        preferences:["top","bottom","left","right"],
        label: "In 1",
    },
});
/**
 * @member {ChartHandle} Panorama#handle2 - The {@link ChartHandle}
 *   displaying/setting the position of the second channel in balance
 *   mode. It affects the `y` parameter.
 */
define_child_widget(Panorama, "handle2", {
    create: ChartHandle,
    show: true,
    toggle_class: true,
    map_options: {
        y: "x",
    },
    default_options: {
        format_label: handle_label,
        mode: "line-vertical",
        preferences:["top","bottom","left","right"],
        label: "In 2",
    },
});

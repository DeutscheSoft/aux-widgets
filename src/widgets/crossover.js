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
import { add_class } from '../utils/dom.js';
import { error } from '../utils/log.js';
import { sprintf } from '../utils/sprintf.js';
import { Equalizer } from './equalizer.js';
import { EqBand } from './eqband.js';
import { Filter } from '../modules/filter.js';

export const CrossoverBand = define_class({
    /**
     * CrossoverBand is a {@link EqBand} with an additional filter.
     * 
     * @param {Object} [options={ }] - An object containing additional options.
     * 
     * @property {String|Function} [lower="lowpass3"] - The type of filter for the range below cutoff frequency. See {@link EqBand} for more information.
     * @property {String|Function} [upper="highpass3"] - The type of filter for the range above cutoff frequency. See {@link EqBand} for more information.
     * @property {Function} [label=function (t, x, y, z) { return sprintf("%.2f Hz", x); }] - The function formatting the handles label.
     * 
     * @class CrossoverBand
     * 
     * @extends EqBand
     */
    Extends: EqBand,
    _options: Object.assign(Object.create(EqBand.prototype._options), {
        lower: "string|function",
        upper: "string|function",
    }),
    options: {
        lower: "lowpass3",
        upper: "highpass3",
        label: function (t, x/*, y, z*/) { return sprintf("%.2f Hz", x); },
        mode: "line-vertical", // undocumented, just a default differing from ChartHandle
        preferences: [ "top-right", "right", "bottom-right", "top-left", "left", "bottom-left"], // undocumented, just a default differing from ChartHandle
    },
    static_events: {
        set_lower: function (val) {
            this.filter = this.lower;
            EqBand.prototype.set.call(this, "type", val);
            this.set("mode", "line-vertical");
        },
        set_upper: function (val) {
            this.filter = this.upper;
            EqBand.prototype.set.call(this, "type", val);
            this.set("mode", "line-vertical");
        },
    },
    initialize: function (options) {
        /**
         * @member {Filter} CrossoverBand#upper - The filter providing the graphical calculations for the upper graph. 
         */
        this.upper = new Filter();
        /**
         * @member {Filter} CrossoverBand#lower - The filter providing the graphical calculations for the lower graph. 
         */
        this.lower = new Filter();
        EqBand.prototype.initialize.call(this, options);
        /** 
         * @member {HTMLDivElement} CrossoverBand#element - The main SVG group.
         *   Has class <code>.aux-crossoverband</code>.
         */
        
        this.set("lower", this.options.lower);
        this.set("upper", this.options.upper);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-crossoverband");

      EqBand.prototype.draw.call(this, O, element);
    },
    set: function (key, val) {
        switch (key) {
            case "freq":
            case "gain":
            case "q":
                if (this.lower)
                    this.filter = this.lower;
                val = EqBand.prototype.set.call(this, key, val);
                this.filter = this.upper;
                return EqBand.prototype.set.call(this, key, val);
        }
        return EqBand.prototype.set.call(this, key, val);
    },
});
 
function invalidate_bands() {
    this.invalid.bands = true;
    this.trigger_draw();
}

function sort_bands() {
    this.bands.sort(function (a, b) {
        return a.options.freq - b.options.freq;
    });
}

function limit_bands () {
    if (this.options.leap) return;
    sort_bands.call(this);
    for (var i = 0; i < this.bands.length; i++)
        _set_freq.call(this, i, this.bands[i]);
}

function set_freq (band) {
    if (this.options.leap) return;
    var i = this.bands.indexOf(band);
    if (i < 0) {
        error("Band no member of crossover");
        return;
    }
    _set_freq.call(this, i, band);
}

function _set_freq (i, band) {
    var freq = band.options.freq;
    var dist = freq * this.get("distance");
    if (i)
        this.bands[i-1].set("x_max", freq - dist);
    if (i < this.bands.length-1)
        this.bands[i+1].set("x_min", freq + dist);
}

export const Crossover = define_class({
    /**
     * Crossover is a {@link Equalizer} displaying the response
     * of a multi-band crossover filter. Crossover  uses {@link CrossoverBand}
     * as response handles.
     * 
     * @class Crossover
     * 
     * @extends Equalizer
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Boolean} [options.leap=true] - Define if bands are allowed to leap over each other.
     * @property {Number} [options.distance=0] - Set a minimal distance between bands if leaping is not allowed.
     *   Value is a factor of x. Example: if distance=0.2 a band cannot be moved beyond 800Hz if the upper next
     *   band is at 1kHz.
     */
    Extends: Equalizer,
    _options: Object.assign(Object.create(Equalizer.prototype._options), {
        leap: "boolean",
        distance: "number",
    }),
    options: {
        range_y: {min:-60, max: 12, scale: "linear"},
        leap: true,
        distance: 0,
    },
    initialize: function (options) {
        Equalizer.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Equalizer#element - The main DIV container.
         *   Has class <code>.aux-crossover</code>.
         */

        var self = this;
        this.set_freq_cb = function() {
          set_freq.call(self, this);
        };
    },
    resize: function () {
        invalidate_bands.call(this);
        Equalizer.prototype.resize.call(this);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-crossover");

      Equalizer.prototype.draw.call(this, O, element);
    },
    redraw: function () {
        var I = this.invalid;
        var O = this.options;
        if (I.validate("bands", "accuracy")) {
            I.bands = false;
            I.accuracy = false;
            sort_bands.call(this);

            if (this.bands.length && this.graphs.length)
            {
              var lastb = this.bands.length - 1;
              var lastg = this.graphs.length - 1;

              for (var i = 0; i < this.bands.length; i++) {
                  var f = [this.bands[i].lower.get_freq2gain()];
                  if (i)
                      f.push(this.bands[i-1].upper.get_freq2gain());
                  this._draw_graph(this.graphs[i], f);
              }
              this._draw_graph(this.graphs[lastg], [this.bands[lastb].upper.get_freq2gain()]);
            }
        }
        Equalizer.prototype.redraw.call(this);
    },
    add_child: function (child) {
        Equalizer.prototype.add_child.call(this, child);
        if (child instanceof CrossoverBand) {
            this.add_graph();
            child.on("set_freq", this.set_freq_cb);
            limit_bands.call(this);
        }
    },
    remove_child: function (child) {
        Equalizer.prototype.remove_child.call(this, child);
        if (child instanceof CrossoverBand) {
            this.remove_graph(this.graphs[this.graphs.length-1]);
            child.off("set_freq", this.set_freq_cb);
            limit_bands.call(this);
        }
    },
    add_band: function (options, type) {
        let band;

        if (options instanceof CrossoverBand) {
          band = options;
        } else {
          type = type || CrossoverBand;
          band = new type(options);
        }
        this.add_child(band);
        return band;
    },
    remove_band: function (band) {
        this.remove_child(band);
    },
});

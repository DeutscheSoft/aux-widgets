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
import { make_svg, add_class } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import { FrequencyResponse } from './frequencyresponse.js';
import { EqBand } from './eqband.js';
 
function fast_draw_plinear(X, Y) {
    var ret = [];
    var i, len = X.length;
    var dy = 0, x, y, tmp;

    var accuracy = 20;
    var c = 0;

    if (len < 2) return "";

    x = +X[0];
    y = +Y[0];

    ret.push("M", x.toFixed(2), ",", y.toFixed(2));

    x = +X[1];
    y = +Y[1];

    dy = ((y - Y[0])*accuracy)|0;

    for (i = 2; i < len; i++) {
        tmp = ((Y[i] - y)*accuracy)|0;
        if (tmp !== dy) {
           ret.push("L", x.toFixed(2), ",", y.toFixed(2));
           dy = tmp;
           c++;
        }
        x = +X[i];
        y = +Y[i];
    }

    ret.push("L", x.toFixed(2), ",", y.toFixed(2));

    return ret.join("");
}
function draw_graph (graph, bands) {
    var O = this.options;
    var c = 0;
    var end = this.range_x.get("basis") | 0;
    var step = O.accuracy;
    var over = O.oversampling;
    var thres = O.threshold;
    var x_px_to_val = this.range_x.px2val;
    var y_val_to_px = this.range_y.val2px;
    var i, j, k;
    var x, y;
    var pursue;
    var diff;
                
    var X = new Array(end / step);
    for (i = 0; i < X.length; i++) {
        X[i] = c;
        c += step;
    }
    var Y = new Array(end / step);
    var y;
    
    for (i = 0; i < X.length; i++) {
        x = x_px_to_val(X[i]);
        y = 0.0;
        for (j = 0; j < bands.length; j++) y += bands[j](x);
        Y[i] = y_val_to_px(y);
        var diff = Math.abs(Y[i] - Y[i-1]) >= thres;
        if (i && over > 1 && (diff || pursue)) {
            if (diff) pursue = true;
            else if (!diff && pursue) pursue = false;
            for (k = 1; k < over; k++) {
                x = X[i-k] + ((step / over) * k);
                X.splice(i, 0, x);
                x = x_px_to_val(x);
                y = 0.0;
                for (j = 0; j < bands.length; j++) y += bands[j](x);
                Y.splice(i, 0, y_val_to_px(y));
                i++;
            }
        }

        if (!isFinite(Y[i])) {
            warn("Singular filter in Equalizer.");
            graph.set("dots", void(0));
            return;
        }
    }
    graph.set("dots", fast_draw_plinear(X, Y));
}
function invalidate_bands() {
    this.invalid.bands = true;
    this.trigger_draw();
}
export const Equalizer = define_class({
    /**
     * Equalizer is a {@link FrequencyResponse}, utilizing {@link EqBand}s instead of
     * simple {@link ResponseHandle}s.
     *
     * @property {Object} options
     * 
     * @param {Number} [options.accuracy=1] - The distance between points on
     *   the x axis. Reduces CPU load in favour of accuracy and smoothness.
     * @param {Array} [options.bands=[]] - A list of bands to add on init.
     * @param {Boolean} [options.show_bands=true] - Show or hide all bands.
     * @param {Number} [options.oversampling=5] - If slope of the curve is too
     *   steep, oversample n times in order to not miss e.g. notch filters.
     * @param {Number} [options.threshold=5] - Steepness of slope to oversample,
     *   i.e. y pixels difference per x pixel
     * @class Equalizer
     * 
     * @extends FrequencyResponse
     */
    Extends: FrequencyResponse,
    _options: Object.assign(Object.create(FrequencyResponse.prototype._options), {
        accuracy: "number",
        oversampling: "number",
        threshold: "number",
        bands:  "array",
        show_bands: "boolean",
    }),
    options: {
        accuracy: 1, // the distance between points of curves on the x axis
        oversampling: 4, // if slope of the curve is too steep, oversample
                         // n times in order to not miss a notch filter
        threshold: 10, // steepness of slope, i.e. amount of y pixels difference
        bands: [],   // list of bands to create on init
        show_bands: true,
    },
    static_events: {
        set_bands: function(value) {
            if (this.bands.length) this.remove_bands();
            this.add_bands(value);
        },
        set_show_bands: function(value) {
          this.set('show_handles', value);
        },
    },
    
    initialize: function (options) {
        FrequencyResponse.prototype.initialize.call(this, options);
        /**
         * @member {Array} Equalizer#bands - Array of {@link EqBand} instances.
         */
        this.bands = this.handles;
        
        /**
         * @member {HTMLDivElement} Equalizer#element - The main DIV container.
         *   Has class <code>.aux-equalizer</code>.
         */
        
        /**
         * @member {SVGGroup} Equalizer#_bands - The SVG group containing all the bands SVG elements.
         *   Has class <code>.aux-eqbands</code>.
         */
        this._bands = this._handles;
        add_class(this._bands, "aux-eqbands");
        
        /**
         * @member {Graph} Equalizer#baseline - The graph drawing the zero line.
         *   Has class <code>.aux-baseline</code> 
         */
        this.baseline = this.add_graph({
            range_x:   this.range_x,
            range_y:   this.range_y,
            container: this._bands,
            dots: [{x: 20, y: 0}, {x: 20000, y: 0}],
            "class": "aux-baseline"
        });
        this.add_bands(this.options.bands);
    },
    
    destroy: function () {
        this.empty();
        this._bands.remove();
        FrequencyResponse.prototype.destroy.call(this);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-equalizer");

      FrequencyResponse.prototype.draw.call(this, O, element);
    },
    redraw: function () {
        var I = this.invalid;
        var O = this.options;
        FrequencyResponse.prototype.redraw.call(this);
        if (I.validate("bands", "accuracy")) {
            if (this.baseline) {
                var f = [];
                for (var i = 0; i < this.bands.length; i++) {
                    if (this.bands[i].get("active")) {
                        f.push(this.bands[i].filter.get_freq2gain());
                    }
                }
                draw_graph.call(this, this.baseline, f);
            }
        }
    },
    resize: function () {
        invalidate_bands.call(this);
        FrequencyResponse.prototype.resize.call(this);
    },
    /**
     * Add a new band to the equalizer. Options is an object containing
     * options for the {@link EqBand}
     * 
     * @method Equalizer#add_band
     * 
     * @param {Object} [options={ }] - An object containing initial options for the {@link EqBand}.
     * @param {Object} [type=EqBand] - A widget class to be used for the new band.
     * 
     * @emits Equalizer#bandadded
     */
    add_child: function(child)
    {
      FrequencyResponse.prototype.add_child.call(this, child);

      if (child instanceof EqBand)
      {
        child.on("set", invalidate_bands.bind(this));
        /**
         * Is fired when a new band was added.
         * 
         * @event Equalizer#bandadded
         * 
         * @param {EqBand} band - The {@link EqBand} which was added.
         */
        this.emit("bandadded", child);
        invalidate_bands.call(this);
      }
    },
    remove_child: function(child) {
      if (child instanceof EqBand)
      {
        /**
         * Is fired when a band was removed.
         * 
         * @event Equalizer#bandremoved
         * 
         * @param {EqBand} band - The {@link EqBand} which was removed.
         */
        this.emit("bandremoved", h);
        invalidate_bands.call(this);
      }

      FrequencyResponse.prototype.remove_child.call(this, child);
    },
    add_band: function (options, type) {
        let b;

        if (options instanceof EqBand)
        {
          b = options;
        } else {
          type = type || EqBand;
          b = new type(options);
        }

        this.add_child(b);
        
        return b;
    },
    /**
     * Add multiple new {@link EqBand}s to the equalizer. Options is an array
     * of objects containing options for the new instances of {@link EqBand}
     * 
     * @method Equalizer#add_bands
     * 
     * @param {Array<Object>} options - An array of options objects for the {@link EqBand}.
     * @param {Object} [type=EqBand] - A widget class to be used for the new band.
     */
    add_bands: function (bands, type) {
        for (var i = 0; i < bands.length; i++)
            this.add_band(bands[i], type);
    },
    /**
     * Remove a band from the widget.
     * 
     * @method Equalizer#remove_handle
     * 
     * @param {EqBand} band - The {@link EqBand} to remove.
     * 
     * @emits Equalizer#bandremoved
     */
    remove_band: function (h) {
        this.remove_child(h);
    },
    /**
     * Remove multiple {@link EqBand} from the equalizer. Options is an array
     * of {@link EqBand} instances.
     * 
     * @method Equalizer#remove_bands
     * 
     * @param {Array<EqBand>} bands - An array of {@link EqBand} instances.
     */
    remove_bands: function (bands) {
        if (!bands) bands = this.bands.slice(0);

        for (let i = 0; i < bands.length; i++)
          this.remove_band(bands[i]);
        /**
         * Is fired when all bands are removed.
         * 
         * @event Equalizer#emptied
         */
        if (!bands)
          this.emit("emptied");
    },
    _draw_graph: draw_graph,
});

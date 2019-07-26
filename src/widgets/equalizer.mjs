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
import { define_class } from './../widget_helpers.mjs';
import { warn, make_svg, add_class } from '../helpers.mjs';
import { ResponseHandler } from './responsehandler.mjs';
import { EqBand } from '../modules/eqband.mjs';
 
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
function show_bands() {
    var b = this.bands;
    for (var i = 0; i < b.length; i ++) {
        this.add_child(b[i]);
    }
}
function hide_bands() {
    var b = this.bands;
    for (var i = 0; i < b.length; i ++) {
        this.remove_child(b[i]);
    }
}
export const Equalizer = define_class({
    /**
     * Equalizer is a ResponseHandler adding some EqBands instead of
     * simple ResponseHandles.
     *
     * @property {Object} options
     * 
     * @param {Number} [options.accuracy=1] - The distance between points on the x axis.
     * @param {Array} [options.bands=[]] - A list of bands to add on init.
     * @param {Boolean} [options.show_bands=true] - Show or hide all bands.
     * @param {Number} [options.oversampling=5] - If slope of the curve is too
     *   steep, oversample n times in order to not miss a notch filter.
     * @param {Number} [options.threshold=5] - Steepness of slope to oversample,
     *   i.e. y pixels difference per x pixel
     * @class Equalizer
     * 
     * @extends ResponseHandler
     */
    _class: "Equalizer",
    Extends: ResponseHandler,
    _options: Object.assign(Object.create(ResponseHandler.prototype._options), {
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
            (value ? show_bands : hide_bands).call(this);
        },
    },
    
    initialize: function (options) {
        /**
         * @member {Array} Equalizer#bands - Array of {@link EqBand} instances.
         */
        this.bands = [];
        ResponseHandler.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Equalizer#element - The main DIV container.
         *   Has class <code>toolkit-equalizer</code>.
         */
        add_class(this.element, "toolkit-equalizer");
        
        /**
         * @member {SVGGroup} Equalizer#_bands - The SVG group containing all the bands SVG elements.
         *   Has class <code>toolkit-eqbands</code>.
         */
        this._bands = make_svg("g", {"class": "toolkit-eqbands"});
        this.svg.appendChild(this._bands);
        
        /**
         * @member {Graph} Equalizer#baseline - The graph drawing the zero line.
         *   Has class <code>toolkit-baseline</code> 
         */
        this.baseline = this.add_graph({
            range_x:   this.range_x,
            range_y:   this.range_y,
            container: this._bands,
            dots: [{x: 20, y: 0}, {x: 20000, y: 0}],
            "class": "toolkit-baseline"
        });
        this.add_bands(this.options.bands);
    },
    
    destroy: function () {
        this.empty(); // Arne: ??? <- Markus: removes all graphs, defined in Chart
        this._bands.remove();
        ResponseHandler.prototype.destroy.call(this);
    },
    redraw: function () {
        var I = this.invalid;
        var O = this.options;
        ResponseHandler.prototype.redraw.call(this);
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

        if (I.show_bands) {
            I.show_bands = false;
            if (O.show_bands) {
                this._bands.style.removeProperty("display");
            } else {
                this._bands.style.display = "none";
            }
        }
    },
    resize: function () {
        invalidate_bands.call(this);
        ResponseHandler.prototype.resize.call(this);
    },
    /*
     * Add a new band to the equalizer. Options is an object containing
     * options for the {@link EqBand}
     * 
     * @method Equalizer#add_band
     * 
     * @param {Object} [options={ }] - An object containing initial options. - The options for the {@link EqBand}.
     * @param {Object} [type=EqBand] - A widget class to be used for the new band.
     * 
     * @emits Equalizer#bandadded
     */
    add_band: function (options, type) {
        var b;
        type = type || EqBand;
        if (type.prototype.isPrototypeOf(options)) {
          b = options;
        } else {
          options.container = this._bands;
          if (options.range_x === void(0))
              options.range_x = function () { return this.range_x; }.bind(this);
          if (options.range_y === void(0))
              options.range_y = function () { return this.range_y; }.bind(this);
          if (options.range_z === void(0))
              options.range_z = function () { return this.range_z; }.bind(this);
          
          options.intersect = this.intersect.bind(this);
          b = new type(options);
        }
        
        this.bands.push(b);
        b.add_event("set", invalidate_bands.bind(this));
        /**
         * Is fired when a new band was added.
         * 
         * @event Equalizer#bandadded
         * 
         * @param {EqBand} band - The {@link EqBand} which was added.
         */
        this.fire_event("bandadded", b);
        if (this.options.show_bands)
            this.add_child(b);
        invalidate_bands.call(this);
        return b;
    },
    /*
     * Add multiple new {@link EqBand} to the equalizer. Options is an array
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
    /*
     * Remove a band from the widget.
     * 
     * @method Equalizer#remove_handle
     * 
     * @param {EqBand} band - The {@link EqBand} to remove.
     * 
     * @emits Equalizer#bandremoved
     */
    remove_band: function (h) {
        for (var i = 0; i < this.bands.length; i++) {
            if (this.bands[i] === h) {
                if (this.options.show_bands)
                    this.remove_child(h);
                
                this.bands.splice(i, 1);
                /**
                 * Is fired when a band was removed.
                 * 
                 * @event Equalizer#bandremoved
                 * 
                 * @param {EqBand} band - The {@link EqBand} which was removed.
                 */
                this.fire_event("bandremoved", h);
                h.destroy();
                break;
            }
        }
    },
    /*
     * Remove multiple {@link EqBand} from the equalizer. Options is an array
     * of {@link EqBand} instances.
     * 
     * @method Equalizer#remove_bands
     * 
     * @param {Array<EqBand>} bands - An array of {@link EqBand} instances.
     */
    remove_bands: function () {
        while (this.bands.length) {
            this.remove_band(this.bands[0]);
        }
        this.bands = [];
        /**
         * Is fired when all bands are removed.
         * 
         * @event Equalizer#emptied
         */
        this.fire_event("emptied");
        invalidate_bands.call(this);
    },
    _draw_graph: draw_graph,
});

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
import { Widget } from './widget.mjs';
import { Circular } from '../modules/circular.mjs';
import { element, add_class, make_svg } from '../utils/dom.mjs';
import { FORMAT } from '../utils/sprintf.mjs';
import { object_and, object_sub } from '../utils/object.mjs';
import { S } from '../dom_scheduler.mjs';

function _get_coords_single(deg, inner, pos) {
    deg = deg * Math.PI / 180;
    return {
        x: Math.cos(deg) * inner + pos,
        y: Math.sin(deg) * inner + pos
    }
}
var format_translate = FORMAT("translate(%f, %f)");
var format_viewbox = FORMAT("0 0 %d %d");
/**
 * Gauge draws a single {@link Circular} into a SVG image. It inherits
 * all options of {@link Circular}.
 *
 * @class Gauge
 * 
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Number} [options.x=0] - Displacement of the {@link Circular}
 *   in horizontal direction. This allows drawing gauges which are only
 *   represented by a segment of a circle.
 * @property {Number} [options.y=0] - Displacement of the {@link Circular}
 *   in vertical direction.
 * @property {Object} [options.title] - Optional gauge title.
 * @property {Number} [options.title.pos] - Position inside of the circle in
 *   degrees.
 * @property {String} [options.title.title] - Title string.
 * @property {Number} [options.title.margin] - Margin of the title string.
 * @property {String} [options.title.align] - Alignment of the title, either
 *   <code>inner</code> or <code>outer</code>.
 */
export const Gauge = define_class({
    _class: "Gauge",
    Extends: Widget,
    _options: Object.assign(Object.create(Circular.prototype._options), {
        width:  "number",
        height: "number",
        title: "object",
    }),
    options: Object.assign({}, Circular.prototype.options, {
        width:  120, // width of the element
        height: 120, // height of the svg
        size:   120,
        title: {pos: 90, margin: 0, align: "inner", title:""}
    }),
    initialize: function (options) {
        Widget.prototype.initialize.call(this, options);

        var O = this.options;
        var E, S;

        if (typeof O.title === "string")
            this.set('title', O.title);

        if (!(E = this.element)) this.element = E = element("div");
        
        /**
         * @member {SVGImage} Gauge#svg - The main SVG image.
         */
        this.svg = S = make_svg("svg");
        
        /**
         * @member {HTMLDivElement} Gauge#element - The main DIV container.
         *   Has class <code>toolkit-gauge</code>.
         */
        add_class(E, "toolkit-gauge");
        this.widgetize(E, true, true, true);
        
        /**
         * @member {SVGText} Gauge#_title - The title of the gauge.
         *   Has class <code>toolkit-title</code>.
         */
        this._title = make_svg("text", {"class": "toolkit-title"});
        S.appendChild(this._title);

        var co = object_and(O, Circular.prototype._options);
        co = object_sub(co, Widget.prototype._options);
        co.container = S;
        
        /**
         * @member {Circular} Gauge#circular - The {@link Circular} module.
         */
        this.circular = new Circular(co);
        this.add_child(this.circular);
        this.widgetize(this.element);
        E.appendChild(S);
    },
    resize: function() {
        Widget.prototype.resize.call(this);
        this.invalid.title = true;
        this.trigger_draw();
    },
    redraw: function() {
        var I = this.invalid, O = this.options;
        var S = this.svg;

        Widget.prototype.redraw.call(this);

        if (I.validate("width", "height")) {
            S.setAttribute("viewBox", format_viewbox(O.width, O.height));
        }

        if (I.validate("title", "size", "x", "y")) {
            var _title = this._title;
            _title.textContent = O.title.title;

            if (O.title.title) {
                S.add(function() {
                    var t = O.title;
                    var outer   = O.size / 2;
                    var margin  = t.margin;
                    var align   = t.align === "inner";
                    var bb      = _title.getBoundingClientRect();
                    var angle   = t.pos % 360;
                    var outer_p = outer - margin;
                    var coords  = _get_coords_single(angle, outer_p, outer);

                    var mx = ((coords.x - outer) / outer_p)
                           * (bb.width + bb.height / 2.5) / (align ? -2 : 2);
                    var my = ((coords.y - outer) / outer_p)
                           * bb.height / (align ? -2 : 2);
                    
                    mx += O.x;
                    my += O.y;
                           
                    S.add(function() {
                        _title.setAttribute("transform", format_translate(coords.x + mx, coords.y + my));
                        _title.setAttribute("text-anchor", "middle");
                    }.bind(this), 1);
                    /**
                     * Is fired when the title changed.
                     * 
                     * @event Gauge#titledrawn
                     */
                    this.fire_event("titledrawn");
                }.bind(this));
            }
        }
    },
    
    // GETTERS & SETTERS
    set: function (key, value) {
        if (key === "title") {
            if (typeof value === "string") value = {title: value};
            value = Object.assign(this.options.title, value);
        }
        // Circular does the snapping
        if (!Widget.prototype._options[key] && Circular.prototype._options[key])
            value = this.circular.set(key, value);
        return Widget.prototype.set.call(this, key, value);
    }
});

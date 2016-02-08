 /* toolkit provides different widgets, implements and modules for 
 * building audio based applications in webbrowsers.
 * 
 * Invented 2013 by Markus Schmidt <schmidt@boomshop.net>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
 * Boston, MA  02110-1301  USA
 */
"use strict";
(function(w){ 
var format_viewbox = TK.FORMAT("0 0 %d %d");
function dblclick() {
    this.set("value", this.options.reset);
    this.fire_event("doubleclick", this.options.value);
    this.fire_event("useraction", "value", this.options.value);
}
w.TK.Knob = w.Knob = $class({
    /**
     * TK.Knob is a {@link TK.Circular} injected into a SVG and extended by {@link TK.ScrollValue}
     * and {@link TK.DragValue} to set its value. TK.Knob uses {@link TK.DragValue} and {@link TK.ScrollValue}
     * for setting its value.
     *
     * @class TK.Knob
     * @extends TK.Widget
     */
    _class: "Knob",
    Extends: TK.Widget,
    _options: Object.assign(Object.create(TK.Widget.prototype._options), TK.Circular.prototype._options,
                            TK.DragValue.prototype._options, {
        size: "number",
        hand: "object",
        margin: "number",
        thickness: "number",
        step: "number",
        shift_up: "number",
        shift_down: "number",
        dot: "object",
        marker: "object",
        label: "object",
        direction: "int",
        rotation: "number",
        blind_angle: "number",
        reset: "number",
    }),
    options: Object.assign({}, TK.Circular.prototype.options, {
        size: 100,
        hand: {width: 1, length: 12, margin: 24},
        margin: 13,
        thickness: 6,
        step: 1,
        shift_up: 4,
        shift_down: 0.25,
        dot: {length: 6, margin: 13, width: 2},
        marker: {thickness: 6, margin: 13},
        label: {margin: 10, align: "outer", format: function(val){return val;}},
        direction: "polar",
        rotation:       45,
        blind_angle:    20
    }),
    initialize: function (options) {
        TK.Widget.prototype.initialize.call(this, options);
        var E, S;

        if (!(E = this.element)) this.element = E = TK.element("div")
        TK.add_class(E, "toolkit-knob");

        this.svg = S = TK.make_svg("svg");

        var co = TK.object_and(this.options, TK.Circular.prototype._options);
        co = TK.object_sub(co, TK.Widget.prototype._options);
        co.container = S;

        this.circular = new TK.Circular(co);

        this.widgetize(E, true, true, true);
        
        this.drag = new TK.DragValue({
            node:    S,
            range:   function () { return this.circular; }.bind(this),
            get:     function () { return this.options.value; }.bind(this),
            set:     function (v) {
                this.set("value", v);
                this.fire_event("useraction", "value", v);
            }.bind(this),
            direction: this.options.direction,
            rotation: this.options.rotation,
            blind_angle: this.options.blind_angle,
            events: function () { return this }.bind(this),
        });
        this.scroll = new TK.ScrollValue({
            node:    S,
            range:   function () { return this.circular; }.bind(this),
            get:     function () { return this.options.value; }.bind(this),
            set:     function (v) {
                this.set("value", v);
                this.fire_event("useraction", "value", v);
            }.bind(this),
            events: function () { return this }.bind(this),
        });

        E.appendChild(S);
        
        if (typeof this.options.reset == "undefined")
            this.options.reset = this.options.value;
        this.add_event("dblclick", dblclick);
        this.add_child(this.circular);
    },
    
    destroy: function () {
        this.drag.destroy();
        this.scroll.destroy();
        this.circular.destroy();
        TK.Widget.prototype.destroy.call(this);
    },

    redraw: function() {
        var I = this.invalid;
        var O = this.options;

        if (I.size) {
            I.size = false;
            this.svg.setAttribute("viewBox", format_viewbox(O.size, O.size));
        }

        TK.Widget.prototype.redraw.call(this);
    },

    set: function(key, value) {
        // TK.Circular does the snapping
        if (!TK.Widget.prototype._options[key]) {
            if (TK.Circular.prototype._options[key])
                value = this.circular.set(key, value);
            if (TK.DragValue.prototype._options[key])
                this.drag.set(key, value);
        }
        return TK.Widget.prototype.set.call(this, key, value);
    },
});
})(this);

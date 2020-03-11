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
import { define_child_widget } from '../child_widget.js';
import { Widget } from './widget.js';
import { Knob } from './knob.js';
import { Value } from './value.js';
import { Label } from './label.js';
import { add_class, remove_class,  element } from '../utils/dom.js';

 /**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>value</code>.
 *
 * @event ValueKnob#useraction
 * 
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
function value_clicked() {
    var self = this.parent;
    var knob = self.knob;
    knob.scroll.set("active", false);
    knob.drag.set("active", false);
    /**
     * Is fired when the user starts editing the value manually.
     * 
     * @event ValueButton#valueedit
     * 
     * @param {number} value - The value of the widget.
     */
    self.emit("valueedit", this.options.value);
}
function value_done() {
    var self = this.parent;
    var knob = self.knob;
    knob.scroll.set("active", true);
    knob.drag.set("active", true);
    /**
     * Is fired when the user finished editing the value manually.
     * 
     * @event ValueButton#valueset
     * 
     * @param {number} value - The value of the widget.
     */
    self.emit("valueset", this.options.value);
}
export const ValueKnob = define_class({
    /**
     * This widget combines a {@link Knob}, a {@link Label}  and a {@link Value} whose
     * value is synchronized. It inherits all options from {@link Knob} and {@link Value}.
     *
     * @class ValueKnob
     * 
     * @extends Widget
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {String} [options.label=false] - Label of the knob. Set to `false` to hide the element from the DOM.
     * @property {Number} [options.show_value=true] - Set to `false` to hide the {@link Value}.
     * @property {Number} [options.show_knob=true] - Set to `false` to hide the {@link Knob}.
     * @property {String} [options.layout="default"] - Layout of the knob. Select from `horizontal`, `vertical` (default), `left` and `right`.
     */
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        layout: "string",
    }),
    options: { 
        layout: "vertical",
    },
    initialize: function (options) {
        if (!options.element) options.element = element("div");
        Widget.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} ValueKnob#element - The main DIV container.
         *   Has class <code>.aux-valueknob</code>.
         */
    },
    draw: function(O, element)
    {
      add_class(element, "aux-valueknob");
      
      this.knob.drag.set("classes", this.element);
      this.knob.scroll.set("classes", this.element);

      Widget.prototype.draw.call(this, O, element);
    },
    redraw: function () {
        Widget.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;
        var E = this.element;
        if (I.layout) {
            I.layout = false;
            var value = O.layout;
            remove_class(E, "aux-vertical", "aux-horizontal", "aux-left",
                            "aux-right");
            add_class(E, "aux-"+value);
        }
    },
    get_range: function() {
        return this.knob.get_range();
    },
    set: function (key, value) {
        /* this gets triggered twice, but we need it in order to make the snapping work */
        if (key === "value" && this.knob)
            value = this.knob.set("value", value);

        return Widget.prototype.set.call(this, key, value);
    },
});
/**
 * @member {Label} ValueKnob#label - The {@link Label} widget.
 */
define_child_widget(ValueKnob, "label", {
    create: Label,
    option: "label",
    toggle_class: true,
    map_options: {
        label: "label",
    },
});
/**
 * @member {Knob} ValueKnob#knob - The {@link Knob} widget.
 */
define_child_widget(ValueKnob, "knob", {
    create: Knob,
    show: true,
    inherit_options: true,
    toggle_class: true,
    blacklist_options: [ "label" ],
});
/**
 * @member {Value} ValueKnob#value - The {@link Value} widget.
 */
define_child_widget(ValueKnob, "value", {
    create: Value,
    show: true,
    inherit_options: true,
    map_options: {
        value: "value",
    },
    static_events: {
        valueclicked: value_clicked,
        valuedone: value_done,
    },
    toggle_class: true,
});

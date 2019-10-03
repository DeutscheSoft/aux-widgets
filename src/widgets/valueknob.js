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
import { define_class } from '../widget_helpers.js';
import { ChildWidget } from '../child_widget.js';
import { Widget } from './widget.js';
import { Knob } from './knob.js';
import { Value } from './value.js';
import { Label } from './label.js';
import { add_class, element } from '../utils/dom.js';
import { FORMAT } from '../utils/sprintf.js';

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
     * value is synchronized.
     *
     * @class ValueKnob
     * 
     * @extends Widget
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Function} [options.value_format=FORMAT("%.2f")] - Callback to format the value.
     * @property {Number} [options.value_size=5] - Amount of digits for the value input.
     */
    _class: "ValueKnob",
    Extends: Widget,
    _options: Object.create(Widget.prototype._options),
    options: { },
    initialize: function (options) {
        Widget.prototype.initialize.call(this, options);
        var E;
        /**
         * @member {HTMLDivElement} ValueKnob#element - The main DIV container.
         *   Has class <code.aux-valueknob</code>.
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "aux-valueknob");

        this.widgetize(E, true, true, true);
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
ChildWidget(ValueKnob, "label", {
    create: Label,
    option: "title",
    toggle_class: true,
    map_options: {
        title: "label",
    },
});
/**
 * @member {Knob} ValueKnob#knob - The {@link Knob} widget.
 */
ChildWidget(ValueKnob, "knob", {
    create: Knob,
    show: true,
    inherit_options: true,
    toggle_class: true,
});
/**
 * @member {Value} ValueKnob#value - The {@link Value} widget.
 */
ChildWidget(ValueKnob, "value", {
    create: Value,
    show: true,
    inherit_options: true,
    map_options: {
        value_format: "format",
        value_set: "set",
        value_size: "size",
    },
    static_events: {
        valueclicked: value_clicked,
        valuedone: value_done,
    },
    toggle_class: true,
});

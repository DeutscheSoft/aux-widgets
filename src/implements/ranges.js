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
import { Ranged } from './ranged.js';
import { Range } from '../modules/range.js';

function range_changed(value, name) {
    var range = this[name];
    for (var i in value) {
        range.set(i, value[i]);
    }
}

/**
 * Ranges provides multiple {@link Range}s for a widget. They
 * can be used for building coordinate systems.
 *
 * @mixin Ranges
 */
export const Ranges = define_class({
    _class: "Ranges",
    /**
     * Add a new {@link Range}. If <code>name</code> is set and <code>this.options[name]</code>
     * exists, is an object and <code>from</code> is an object, too, both are merged
     * before a range is created.
     *
     * @method Ranges#add_range
     * 
     * @param {Function|Object} from - A function returning a {@link Range}
     *   instance or an object containing options for a new {@link Range}.
     * @param {string} name - Designator of the {@link Range}.
     *   If a name is set a new set function is added to the item to
     *   set the options of the {@link Range}. Use the set function like this:
     *   <code>this.set("name", {key: value});</code>
     * 
     * @emits Ranges#rangeadded
     * 
     * @returns {Range} The new {@link Range}.
     */
    add_range: function (from, name) {
        var r;
        if (typeof from === "function") {
            r = from();
        } else if (Ranged.prototype.isPrototypeOf(from)) {
            r = new Range(from.options);
        } else if (Range.prototype.isPrototypeOf(from)) {
            r = from;
        } else {
            if (name
            && this.options[name]
            && typeof this.options[name] === "object")
                from = Object.assign({}, this.options[name], from)
            r = new Range(from);
        }
        if (name) {
            this[name] = r;
            this.on("set_"+name, range_changed);
        }
        /**
         * Gets fired when a new range is added
         *
         * @event Ranges#rangeadded
         * 
         * @param {Range} range - The {@link Range} that was added.
         */
        this.emit("rangeadded", r);
        return r;
    }
});

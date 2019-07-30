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
import { define_class } from '../widget_helpers.mjs';
import { ListItem } from './listitem.mjs';
import { Button } from './button.mjs';
import { add_class } from '../helpers.mjs';

var build_sorter = function () {
    this.sorter = new Button({"class":"toolkit-sorter",container:this.element});
    this.add_child(this.sorter);
}

export const SortableListItem = define_class({
    _class: "SortableListItem",
    Extends: ListItem,
    _options: Object.assign(Object.create(ListItem.prototype._options), {
        sortable: "boolean",
    }),
    options: {
        sortable: false,
    },
    initialize: function (options) {
        ListItem.prototype.initialize.call(this, options);
        add_class(this.element, "toolkit-sortable-list-item");
    },
    redraw: function () {
        ListItem.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;
        if (I.sortable) {
            if (O.sortable) {
                if (!this.sorter) {
                    build_sorter.call(this);
                } else {
                    this.element.appendChild(this.sorter.element);
                }
            } else {
                if (this.sorter)
                    this.element.removeChild(this.sorter.element);
            }
        }
    },
    set: function (key, value) {
        return ListItem.prototype.set.call(this, key, value);
    }
});

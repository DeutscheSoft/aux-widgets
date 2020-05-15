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
import { ListItem } from './listitem.js';
import { Taggable } from './taggable.js';
import { add_class } from '../utils/dom.js';

export const TaggableListItem = define_class({
    Extends: ListItem,
    Implements: Taggable,
    initialize: function (options) {
        ListItem.prototype.initialize.call(this, options);
        Taggable.prototype.initialize.call(this);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-taggablelistitem");

      ListItem.prototype.draw.call(this, O, element);
    },
});

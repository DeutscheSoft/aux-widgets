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

import { defineClass } from '../widget_helpers.js';
import { ListItem } from './listitem.js';
import { Button } from './button.js';
import { addClass } from '../utils/dom.js';

function buildSorter() {
  this.sorter = new Button({ class: 'aux-sorter', container: this.element });
  this.addChild(this.sorter);
}

export const SortableListItem = defineClass({
  Extends: ListItem,
  _options: Object.assign(Object.create(ListItem.prototype._options), {
    sortable: 'boolean',
  }),
  options: {
    sortable: false,
  },
  initialize: function (options) {
    ListItem.prototype.initialize.call(this, options);
  },
  draw: function (O, element) {
    addClass(element, 'aux-sortablelistitem');

    ListItem.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    ListItem.prototype.redraw.call(this);
    var I = this.invalid;
    var O = this.options;
    if (I.sortable) {
      if (O.sortable) {
        if (!this.sorter) {
          buildSorter.call(this);
        } else {
          this.element.appendChild(this.sorter.element);
        }
      } else {
        if (this.sorter) this.element.removeChild(this.sorter.element);
      }
    }
  },
  set: function (key, value) {
    return ListItem.prototype.set.call(this, key, value);
  },
});

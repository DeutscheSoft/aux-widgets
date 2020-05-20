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
import { DragCapture } from '../modules/dragcapture.js';
import { List } from './list.js';
import { Container } from './container.js';
import { SortableListItem } from './sortablelistitem.js';
import { add_class } from '../utils/dom.js';

/* TODO */

function build_dragcapture() {
  this.dragcapture = new DragCapture(this, {
    state: true,
    onstartcapture: function () {
      return true;
    },
    onmovecapture: function () {},
    onstopcapture: function () {},
  });
}

export const SortableList = define_class({
  Extends: List,

  _options: Object.assign(Object.create(Container.prototype._options), {
    sortable: 'boolean',
  }),
  options: {
    sortable: false,
    item_class: SortableListItem,
  },
  initialize: function (options) {
    List.prototype.initialize.call(this, options);
  },
  draw: function (O, element) {
    add_class(element, 'aux-sortablelist');

    List.prototype.draw.call(this, O, element);
  },
  add_item: function (item, pos) {
    var O = this.options;
    item = List.prototype.add_item.call(this, item, pos);
    item.set('sortable', O.sortable);
  },
  set: function (key, value) {
    switch (key) {
      case 'sortable':
        var I = this.options.items;
        for (var i = 0; i < I.length; i++) I[i].set('sortable', value);
        if (value && !this.dragcapture) build_dragcapture.call(this);
        break;
    }
    return List.prototype.set.call(this, key, value);
  },
});

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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { defineClass } from '../widget_helpers.js';
import { Container } from './container.js';
import { element, addClass } from '../utils/dom.js';

export const List = defineClass({
  /**
   * List is a sortable {@link Container} for {@ListItems}s.
   *   the element is a UL instead of a DIV.
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Function|Boolean} [options.sort=false] - A function
   *   expecting arguments A and B, returning a number < 0, if A comes first and > 0,
   *   if B comes first. 0 keeps both elements in place. Please refer to the
   *   compareFunction at <a href="https://www.w3schools.com/jsref/jsref_sort.asp">W3Schools</a>
   *   for any further information.
   *
   * @class List
   *
   * @extends Container
   */
  _options: Object.assign(Object.create(Container.prototype._options), {
    sort: 'function',
  }),
  Extends: Container,

  initialize: function (options) {
    if (!options.element) options.element = element('ul');
    Container.prototype.initialize.call(this, options);
  },
  static_events: {
    set_sort: function (f) {
      if (typeof f === 'function') {
        var C = this.children.slice(0);
        C.sort(f);
        for (var i = 0; i < C.length; i++) {
          this.element.appendChild(C[i].element);
        }
      }
    },
  },
  draw: function (O, element) {
    addClass(element, 'aux-list');

    Container.prototype.draw.call(this, O, element);
  },
  appendChild: function (w) {
    Container.prototype.appendChild.call(this, w);
    var O = this.options;
    var C = this.children;
    if (O.sort) {
      C.sort(O.sort);
      var pos = C.indexOf(w);
      if (pos !== C.length - 1)
        this.element.insertBefore(w.element, C[pos + 1].element);
    }
  },
});

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

export const ListItem = defineClass({
  /**
   * ListItem is a member {@link Container} of {@link List}s. The
   * element is a `LI` instead of a `DIV`.
   *
   * @class ListItem
   *
   * @extends Container
   */
  Extends: Container,

  initialize: function (options) {
    if (!options.element) options.element = element('li');
    Container.prototype.initialize.call(this, options);
  },
  draw: function (O, element) {
    addClass(element, 'aux-listitem');

    Container.prototype.draw.call(this, O, element);
  },
});

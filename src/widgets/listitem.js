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
import { Container } from './container.js';
import { element } from '../utils/dom.js';

export const ListItem = define_class({
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
        this.element = element("li", "aux-listitem");
        Container.prototype.initialize.call(this, options);
    },
});

/*
 * This file is part of A.UX.
 *
 * A.UX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * A.UX is distributed in the hope that it will be useful,
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
import { add_class } from '../utils/dom.js';

/**
 * Root is a Container which can be used as the top level when building
 * UIs programmatically. It will automatically activate listening for resize
 * and visibilitychange events globally and forward them to its child widgets.
 * There is no need for using `aux-root` when using WebComponents.
 * 
 * @extends Container
 * 
 * @class Root
 */
export const Root = define_class({
    Extends: Container,
    _options: Object.create(Container.prototype._options),
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Root#element - The main DIV container.
         *   Has class <code>.aux-root</code>.
         */
        this.set_parent(null);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-root");

      Container.prototype.draw.call(this, O, element);
    },
});

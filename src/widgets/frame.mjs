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
import { ChildWidget } from '../child_widget.mjs';
import { Label } from './label.mjs';
import { Container } from './container.mjs';
import { add_class } from '../helpers.mjs';

/**
 * Frame is a {@link Container} with a {@link Label} on top.
 * 
 * @extends Container
 * 
 * @class Frame
 */
export const Frame = define_class({
    Extends: Container,
    _class: "Frame",
    _options: Object.create(Container.prototype._options),
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Frame#element - The main DIV container.
         *   Has class <code>toolkit-frame</code>.
         */
        add_class(this.element, "toolkit-frame");
    },
});
/**
 * @member {Label} Frame#label - The {@link Label} of the frame.
 */
ChildWidget(Frame, "label", {
    create: Label,
    option: "label",
    inherit_options: true,
    default_options: {
        class: "toolkit-frame-label"
    },
});

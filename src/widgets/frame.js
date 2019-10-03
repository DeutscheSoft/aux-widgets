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
import { define_child_widget } from '../child_widget.js';
import { Label } from './label.js';
import { Container } from './container.js';
import { add_class } from '../utils/dom.js';

/**
 * Frame is a {@link Container} with a {@link Label} on top.
 * 
 * @extends Container
 * 
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {String|Boolean} [options.label=false] - The label of the frame. Set to `false` to remove it from the DOM.
 * 
 * @class Frame
 */
export const Frame = define_class({
    Extends: Container,
    _class: "Frame",
    _options: Object.create(Container.prototype._options),
    options: {
        label: false,
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Frame#element - The main DIV container.
         *   Has class <code.aux-frame</code>.
         */
        add_class(this.element, "aux-frame");
    },
});
/**
 * @member {Label} Frame#label - The {@link Label} of the frame.
 */
define_child_widget(Frame, "label", {
    create: Label,
    option: "label",
    inherit_options: true,
    default_options: {
        class: "aux-frame-label"
    },
});

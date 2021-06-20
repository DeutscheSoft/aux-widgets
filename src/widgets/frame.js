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
import { defineChildWidget } from '../child_widget.js';
import { Label } from './label.js';
import { Container } from './container.js';
import { addClass } from '../utils/dom.js';

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
export const Frame = defineClass({
  Extends: Container,
  _options: Object.assign({}, Container.getOptionTypes()),
  options: {
    label: false,
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    /**
     * @member {HTMLDivElement} Frame#element - The main DIV container.
     *   Has class <code>.aux-frame</code>.
     */
  },
  draw: function (O, element) {
    addClass(element, 'aux-frame');

    Container.prototype.draw.call(this, O, element);
  },
});
/**
 * @member {Label} Frame#label - The {@link Label} of the frame.
 */
defineChildWidget(Frame, 'label', {
  create: Label,
  option: 'label',
  inherit_options: true,
  default_options: {
    class: 'aux-framelabel',
  },
  toggle_class: true,
});

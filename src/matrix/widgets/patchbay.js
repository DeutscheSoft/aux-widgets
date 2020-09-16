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

import { defineClass } from './../../widget_helpers.js';
import { addClass } from './../../utils/dom.js';

import { Container } from './../../widgets/container.js';

/**
 * Patchbay is a generic widget for managing connections between sources
 * and sinks. It relies on various data models like
 * two {@link VirtualTreeDataView} and a {@link ConnectionDataView}.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Object} options.sources - A {@link VirtualTreeDataView} containing
 *   sources data.
 * @property {Object} options.sinks - A {@link VirtualTreeDataView} containing
 *   sinks data.
 * @porperty {Integer} [options.size=32] - The size of a single entry in the
 *   {@link VirtualTree}s.
 *
 * @extends Container
 *
 * @class Patchbay
 */
export const Patchbay = defineClass({
  Extends: Container,
  _options: Object.assign(Object.create(Container.prototype._options), {
    sources: 'object',
    sinks: 'object',
    size: 'number',
  }),
  options: {
    size: 32,
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
  },
  draw: function (options, element) {
    addClass(this.element, 'aux-patchbay');
    Container.prototype.draw.call(this, options, element);
  },
});

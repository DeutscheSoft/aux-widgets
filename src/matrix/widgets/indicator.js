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
import { addClass, toggleClass } from './../../utils/dom.js';

import { Button } from './../../widgets/button.js';

/**
 * Indicator is a button element inside the {@link Indicators} widget
 * for the {@link Matrix}. All properties are reflected as class onto
 * the element.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Boolean} [options.connected] - Sink and source represented by this
 *   indicator are connected.
 * @property {Boolean} [options.connectable] - Sink and source represented by
 *   this indicator can be connected, no restrictions.
 * @property {Boolean} [options.sourceisgroup] - The source is a group header.
 * @property {Boolean} [options.sinkisgroup] - The sink is a group header.
 * @property {Boolean} [options.isgroup] - Either source or sink is a group header.
 *
 * @extends Button
 *
 * @class Indicator
 */

export const Indicator = defineClass({
  Extends: Button,
  _options: Object.assign(Object.create(Button.prototype._options), {
    connected: 'boolean',
    connectable: 'boolean',
    sourceisgroup: 'boolean',
    sinkisgroup: 'boolean',
    isgroup: 'boolean',
  }),
  initialize: function (options) {
    Button.prototype.initialize.call(this, options);
    this.source = null;
    this.sink = null;
  },
  /**
   * Updates the Indicator with the relevant data.
   *
   * @method updateData
   *
   * @param {Integer} index1 - The index of the entry in the first list.
   * @param {Integer} index2 - The index of the entry in the second list.
   * @param {ConnectionData} connection - The connection data.
   * @param {PortData} source - The source data.
   * @param {PortData} sink - The sink data.
   *
   */
  updateData: function (index1, index2, connection, source, sink) {
    this.update('connected', !!connection);
    this.update('sourceisgroup', source && source.isGroup);
    this.update('sinkisgroup', sink && sink.isGroup);
    this.update(
      'isgroup',
      (sink && sink.isGroup) || (source && source.isGroup)
    );

    const connectable = source && sink && !source.isGroup && !sink.isGroup;
    this.update('connectable', connectable);

    this.source = source;
    this.sink = sink;
  },
  draw: function (options, element) {
    addClass(this.element, 'aux-indicator');
    Button.prototype.draw.call(this, options, element);
  },
  redraw: function () {
    Button.prototype.redraw.call(this);

    const E = this.element;
    const I = this.invalid;
    const O = this.options;

    if (I.connected) {
      I.connected = false;
      toggleClass(E, 'aux-connected', O.connected);
    }

    if (I.connectable) {
      I.connectable = false;
      toggleClass(E, 'aux-connectable', O.connectable);
    }

    if (I.sourceisgroup) {
      I.sourceisgroup = false;
      toggleClass(E, 'aux-sourceisgroup', O.sourceisgroup);
    }

    if (I.sinkisgroup) {
      I.sinkisgroup = false;
      toggleClass(E, 'aux-sinkisgroup', O.sinkisgroup);
    }

    if (I.isgroup) {
      I.isgroup = false;
      toggleClass(E, 'aux-isgroup', O.isgroup);
    }
  },
});

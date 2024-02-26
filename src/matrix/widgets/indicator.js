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

import { addClass, toggleClass } from './../../utils/dom.js';

import { Button } from './../../widgets/button.js';
import { defineRender } from '../../renderer.js';

function pointerEnter(e) {
  this.sink.update('hovered', true);
  this.source.update('hovered', true);
  this.parent.parent.emit('indicatorEnter', {
    sink: this.sink,
    source: this.source,
    event: e,
    indicator: this,
  });
}
function pointerLeave(e) {
  this.sink.update('hovered', false);
  this.source.update('hovered', false);
  this.parent.parent.emit('indicatorLeave', {
    sink: this.sink,
    source: this.source,
    event: e,
    indicator: this,
  });
}

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

export class Indicator extends Button {
  static get _options() {
    return {
      connected: 'boolean',
      connectable: 'boolean',
      sourceisgroup: 'boolean',
      sinkisgroup: 'boolean',
      isgroup: 'boolean',
    };
  }

  static get static_events() {
    return {
      pointerleave: pointerLeave,
      pointerenter: pointerEnter,
    };
  }

  static get renderers() {
    return [
      defineRender('connected', function (connected) {
        toggleClass(this.element, 'aux-connected', connected);
      }),
      defineRender('connectable', function (connectable) {
        toggleClass(this.element, 'aux-connectable', connectable);
      }),
      defineRender('sourceisgroup', function (sourceisgroup) {
        toggleClass(this.element, 'aux-sourceisgroup', sourceisgroup);
      }),
      defineRender('sinkisgroup', function (sinkisgroup) {
        toggleClass(this.element, 'aux-sinkisgroup', sinkisgroup);
      }),
      defineRender('isgroup', function (isgroup) {
        toggleClass(this.element, 'aux-isgroup', isgroup);
      }),
    ];
  }

  initialize(options) {
    super.initialize(options);
    this.source = null;
    this.sink = null;
  }

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
  updateData(index1, index2, connection, source, sink) {
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
  }

  draw(options, element) {
    addClass(this.element, 'aux-indicator');
    super.draw(options, element);
  }
}

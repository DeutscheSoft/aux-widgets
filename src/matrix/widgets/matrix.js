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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { defineClass } from './../../widget_helpers.js';
import { defineChildWidget } from './../../child_widget.js';
import {
  innerWidth,
  innerHeight,
  outerWidth,
  outerHeight,
  addClass,
  removeClass,
} from './../../utils/dom.js';
import {
  initSubscriptions,
  addSubscription,
  unsubscribeSubscriptions,
} from '../../utils/subscriptions.js';

import { Indicators } from './indicators.js';
import { Indicator } from './indicator.js';
import { Patchbay } from './patchbay.js';
import { VirtualTree } from './virtualtree.js';

import { ConnectionDataView } from '../models.js';

function setVirtualtreeviews() {
  var O = this.options;
  if (!O.sources || !O.sinks) return;
  switch (O.signal_flow) {
    case 'top-left': {
      const connectionview = new ConnectionDataView(O.sinks, O.sources);
      this.virtualtree_top.set('virtualtreeview', O.sources);
      this.virtualtree_left.set('virtualtreeview', O.sinks);
      this.indicators.set('connectionview', connectionview);
      break;
    }
    case 'left-top': {
      const connectionview = new ConnectionDataView(O.sources, O.sinks);
      this.virtualtree_left.set('virtualtreeview', O.sources);
      this.virtualtree_top.set('virtualtreeview', O.sinks);
      this.indicators.set('connectionview', connectionview);
      break;
    }
  }
}

export const Matrix = defineClass({
  Extends: Patchbay,
  _options: Object.assign(Object.create(Patchbay.prototype._options), {
    _virtualtree_size: 'number',
    indicator_class: 'object',
    signal_flow: 'string',
  }),
  options: {
    _virtualtree_size: 0,
    indicator_class: Indicator,
    signal_flow: 'left-top',
  },
  static_events: {
    set_signal_flow: setVirtualtreeviews,
    set_sources: setVirtualtreeviews,
    set_sinks: setVirtualtreeviews,
  },
  initialize: function (options) {
    Patchbay.prototype.initialize.call(this, options);
  },
  draw: function (options, element) {
    const O = this.options;
    addClass(this.element, 'aux-matrix');
    Patchbay.prototype.draw.call(this, options, element);

    this.virtualtree_left.on('scrollTopChanged', (position) => {
      this.indicators.scrollTopTo(position);
    });
    this.virtualtree_top.on('scrollTopChanged', (position) => {
      this.indicators.scrollLeftTo(position);
    });
    this.indicators.on('scrollChanged', (yposition, xposition) => {
      this.virtualtree_left.scrollTo(yposition);
      this.virtualtree_top.scrollTo(xposition);
    });
    this.indicators.on('indicatorClicked', (source, sink) => {
      this.emit('toggleConnection', source, sink);
    });

    setVirtualtreeviews.call(this);
  },
  redraw: function () {
    const O = this.options;
    const I = this.invalid;
    const E = this.element;

    if (I._virtualtree_size) {
      I._virtualtree_size = false;
      const virtualtree = this.virtualtree_top;
      virtualtree.element.style.height = O._virtualtree_size + 'px';
      virtualtree.triggerResize();
    }

    Patchbay.prototype.redraw.call(this);
  },
  resize: function () {
    this.set(
      '_virtualtree_size',
      innerWidth(this.element) - outerWidth(this.virtualtree_left.element)
    );
    Patchbay.prototype.resize.call(this);
  },
});

defineChildWidget(Matrix, 'virtualtree_left', {
  create: VirtualTree,
  show: true,
  map_options: {
    size: 'size',
  },
  default_options: {
    class: 'aux-virtualtreeleft',
  },
});

defineChildWidget(Matrix, 'virtualtree_top', {
  create: VirtualTree,
  show: true,
  map_options: {
    size: 'size',
  },
  default_options: {
    class: 'aux-virtualtreetop',
  },
});

defineChildWidget(Matrix, 'indicators', {
  create: Indicators,
  show: true,
  map_options: {
    size: 'size',
    indicator_class: 'indicator_class',
  },
});

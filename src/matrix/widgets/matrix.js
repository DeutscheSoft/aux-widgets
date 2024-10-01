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

import { defineChildWidget } from './../../child_widget.js';
import { innerWidth, outerWidth, addClass } from './../../utils/dom.js';
import { defineRender } from '../../renderer.js';

import { Indicators } from './indicators.js';
import { Indicator } from './indicator.js';
import { Patchbay } from './patchbay.js';
import { VirtualTree } from './virtualtree.js';
import { ScrollDetector } from './scroll_detector.js';

import { ConnectionDataView } from '../models.js';

const scrollDetectorTimeout = 200;

function setVirtualtreeviews() {
  const O = this.options;
  if (!O.sources || !O.sinks) return;
  switch (O.signal_flow) {
    case 'top-left': {
      const connectionview = new ConnectionDataView(O.sinks, O.sources);
      this.connectionview = connectionview;
      this.virtualtree_top.set('virtualtreeview', O.sources);
      this.virtualtree_left.set('virtualtreeview', O.sinks);
      this.indicators.set('connectionview', connectionview);
      break;
    }
    case 'left-top': {
      const connectionview = new ConnectionDataView(O.sources, O.sinks);
      this.connectionview = connectionview;
      this.virtualtree_left.set('virtualtreeview', O.sources);
      this.virtualtree_top.set('virtualtreeview', O.sinks);
      this.indicators.set('connectionview', connectionview);
      break;
    }
  }
}

/**
 * A patchbay widget for handling connections between sources and sinks
 * with matrix layout.
 * It includes two {@link VirtualTree}s on top and left hand side and a
 * {@link Indicators} widget displaying and handling the connections.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Object} [options.indicator_class=Indicator] - The class to derive the
 *   indicators inside the {@link Indicators} from.
 * @property {String} [options.signal_flow='left-top'] - Define the direction of
 *   the signal flow. Can be either `top-left` or `left-top`. This defines
 *   the position of sinks and sources {@link VirtualTreeView} on the
 *   screen.
 *
 * @extends Patchbay
 *
 * @class Matrix
 */
export class Matrix extends Patchbay {
  static get _options() {
    return {
      _virtualtree_size: 'number',
      indicator_class: 'object',
      signal_flow: 'string',
    };
  }

  static get options() {
    return {
      _virtualtree_size: 0,
      indicator_class: Indicator,
      signal_flow: 'left-top',
    };
  }

  static get static_events() {
    return {
      set_signal_flow: setVirtualtreeviews,
      set_sources: setVirtualtreeviews,
      set_sinks: setVirtualtreeviews,
    };
  }

  static get renderers() {
    return [
      defineRender('_virtualtree_size', function (_virtualtree_size) {
        const virtualtree = this.virtualtree_top;
        virtualtree.element.style.height = _virtualtree_size + 'px';
        virtualtree.triggerResize();
      }),
    ];
  }

  /**
   * Returns the virtual tree view instance of the left tree.
   */
  getVirtualTreeViewLeft() {
    return this.virtualtree_left.get('virtualtreeview');
  }

  /**
   * Returns the virtual tree view instance of the top tree.
   */
  getVirtualTreeViewTop() {
    return this.virtualtree_top.get('virtualtreeview');
  }

  initialize(options) {
    super.initialize(options);
    this.connectionview = null;
    this._scroll_left = new ScrollDetector(scrollDetectorTimeout);
    this._scroll_top = new ScrollDetector(scrollDetectorTimeout);
    this._scroll_matrix = new ScrollDetector(scrollDetectorTimeout);
  }

  scrollTo(options) {
    if (options.top >= 0) this.virtualtree_left.scrollTo(options.top);
    if (options.left >= 0) this.virtualtree_top.scrollTo(options.left);
  }

  getScrollPosition() {
    const top = this.virtualtree_left.getScrollTop();
    const left = this.virtualtree_top.getScrollTop();

    return { top, left };
  }

  draw(options, element) {
    addClass(this.element, 'aux-matrix');
    super.draw(options, element);

    this.virtualtree_left.on('scrollTopChanged', (position) => {
      let called = false;
      this._scroll_left.maybeScrollEvent(() => {
        this._scroll_matrix.maybeScrollTo(() => {
          called = true;
          this.indicators.scrollTopTo(position);
        });
      });
      if (!called) return false;
    });
    this.virtualtree_top.on('scrollTopChanged', (position) => {
      let called = false;
      this._scroll_top.maybeScrollEvent(() => {
        this._scroll_matrix.maybeScrollTo(() => {
          called = true;
          this.indicators.scrollLeftTo(position);
        });
      });
      if (!called) return false;
    });
    this.indicators.on('scrollChanged', (yposition, xposition) => {
      this._scroll_matrix.maybeScrollEvent(() => {
        this._scroll_left.maybeScrollTo(() => {
          this.virtualtree_left.scrollTo(yposition);
          Promise.resolve().then(() => {
            this.virtualtree_left._scrollDataTo(yposition);
          });
        });
        this._scroll_top.maybeScrollTo(() => {
          this.virtualtree_top.scrollTo(xposition);
          Promise.resolve().then(() => {
            this.virtualtree_top._scrollDataTo(xposition);
          });
        });
      });
    });
    this.indicators.on('indicatorClicked', (source, sink) => {
      this.emit('toggleConnection', source, sink);
    });

    this.virtualtree_top.scroll_y.drag.set('direction', 'horizontal');
    this.virtualtree_top.scroll_y.drag.set('reverse', true);
    setVirtualtreeviews.call(this);
  }

  resize() {
    this.set(
      '_virtualtree_size',
      innerWidth(this.element) - outerWidth(this.virtualtree_left.element)
    );
    super.resize();
  }

  destroy() {
    this._scroll_left.destroy();
    this._scroll_top.destroy();
    this._scroll_matrix.destroy();
    super.destroy();
  }
}
/**
 * @member {VirtualTree} Matrix#virtualtree_left - The {@link VirtualTree}
 *   on the left hand side. Has class <code>.aux-virtualtreeleft</code>.
 */
defineChildWidget(Matrix, 'virtualtree_left', {
  create: VirtualTree,
  show: true,
  map_options: {
    size: 'size',
    entry_class: 'entry_class',
  },
  default_options: {
    class: 'aux-virtualtreeleft',
  },
});
/**
 * @member {VirtualTree} Matrix#virtualtree_left - The {@link VirtualTree}
 *   on top. Has class <code>.aux-virtualtreetop</code>.
 */
defineChildWidget(Matrix, 'virtualtree_top', {
  create: VirtualTree,
  show: true,
  map_options: {
    size: 'size',
    entry_class: 'entry_class',
  },
  default_options: {
    class: 'aux-virtualtreetop',
  },
});
/**
 * @member {Indicators} Matrix#indicators - The {@link Indicators}
 *   widget. Has class <code>.aux-indicators</code>.
 */
defineChildWidget(Matrix, 'indicators', {
  create: Indicators,
  show: true,
  map_options: {
    size: 'size',
    indicator_class: 'indicator_class',
  },
  static_events: {
    connectDiagonal: function (...args) {
      this.parent.emit('connectDiagonal', ...args);
    },
    disconnectDiagonal: function (...args) {
      this.parent.emit('disconnectDiagonal', ...args);
    },
    disconnectAll: function (...args) {
      this.parent.emit('disconnectAll', ...args);
    },
  },
});

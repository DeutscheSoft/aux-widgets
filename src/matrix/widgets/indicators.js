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

import { defineClass, defineChildElement } from './../../widget_helpers.js';
import { scrollbarSize, addClass } from './../../utils/dom.js';
import { FORMAT } from '../../utils/sprintf.js';
import { Subscriptions } from '../../utils/subscriptions.js';
import { subscribeDOMEvent } from '../../utils/events.js';

import { Container } from './../../widgets/container.js';
import { Indicator } from './indicator.js';
import { DragCapture } from '../../modules/dragcapture.js';
import { resizeArrayMod } from '../models.js';

scrollbarSize();

function onIndicatorClicked() {
  const indicators = this.parent;

  indicators.emit('indicatorClicked', this.source, this.sink);
}

const formatIndicatorTransform = FORMAT('translateY(%.2fpx) translateX(%.2fpx)');


function getStartEvent (state) {
  if (state.findTouch) {
    return state.findTouch(state.start);
  } else {
    return state.start;
  }
}
function onDragStart (e) {
  return true;
}

function onDragging (e) {
  const O = this.options;
  const state = this.drag.state();
  const px = state.vDistance();
  const x = px[0];
  const y = px[1];
  if (!O._batch) {
    const dist = Math.sqrt( x*x + y*y );
    if (dist > O.min_distance) {
      const start = getStartEvent(state);
      this.set('_batch', true);
      this.set('_x0', start.clientX);
      this.set('_y0', start.clientY);
      this.set('_xd', 0);
      this.set('_yd', 0);
    }
  } else {
    this.set('_xd', x);
    this.set('_yd', y);
  }
}

function onDragStop (e) {
  this.set('_batch', false);
}

/**
 * Indicators is an area inside {@link Matrix} containing a matrix of
 *   {@link Indicator}s displaying and managing connections.
 *
 * @param {Object}[options={ }] - An object containing initial options.
 *
 * @property {Object} [options.indicator_class=Indicator] - the class to
 *   derive new {@link Indicator}s from. Has to be a subclass of
 *   {@link Indicator}.
 * @property {ConnectionView} options.connectionview - The
 *   {@link ConnectionView} data model.
 *
 * @extends Container
 *
 * @class Indicators
 */

export const Indicators = defineClass({
  Extends: Container,
  _options: Object.assign(Object.create(Container.prototype._options), {
    indicator_class: 'object',
    connectionview: 'object',
    batch: 'boolean',
    min_distance: 'number',
    _batch: 'boolean',
    _x0: 'number',
    _y0: 'number',
    _xd: 'number',
    _yd: 'number',
  }),
  options: {
    indicator_class: Indicator,
    min_distance: 5,
    batch: true,
    _batch: false,
    _x0: 0,
    _y0: 0,
    _xd: 0,
    _yd: 0,
  },
  static_events: {
    set_connectionview: function (connectionview) {
      this.connectionview_subs.unsubscribe();
    },
    set_batch: function (v) { this.drag.set('active', v); },
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    this.connectionview_subs = new Subscriptions();
    this.entries = [];
    
    this.drag = new DragCapture(this, {
      node: this.element,
      active: options.batch,
      onstartcapture: onDragStart.bind(this),
      onmovecapture: onDragging.bind(this),
      onstopcapture: onDragStop.bind(this),
    });
    
    this._dragging = false;
  },
  destroy: function () {
    Container.prototype.destroy.call(this);
    this.connectionview_subs.unsubscribe();
  },
  createIndicator: function () {
    return new this.options.indicator_class();
  },
  draw: function (options, element) {
    Container.prototype.draw.call(this, options, element);
    addClass(element, 'aux-indicators');
    this.addSubscriptions(
      subscribeDOMEvent(this.element, 'scroll', (ev) => {
        /**
         * Is fired on scrolling the area.
         *
         * @event Indicators#scrollChanged
         *
         * @param {Integer} scroll_top - The scroll position from top.
         * @param {Integer} scroll_left - The scroll position from left.
         */
        // jshint -W123
        const element = this.element;
        // jshint +W123
        this.emit('scrollChanged', element.scrollTop, element.scrollLeft);
      })
    );
  },
  redraw: function () {
    const O = this.options;
    const I = this.invalid;
    const E = this.element;

    if (I.connectionview) {
      I.connectionview = false;

      const connectionview = O.connectionview;

      if (connectionview) {
        const sub = this.connectionview_subs;

        sub.add(
          connectionview.subscribeSize((rows, columns) => {
            this._scroller.style.width = columns * O.size + 'px';
            this._scroller.style.height = rows * O.size + 'px';
          })
        );

        const setIndicatorPosition = (indicator, index1, index2) => {
          indicator.element.style.transform = formatIndicatorTransform(
            index1 * O.size,
            index2 * O.size
          );
        };

        const createIndicator = (index1, index2) => {
          const indicator = this.createIndicator();

          indicator.on('click', onIndicatorClicked);
          setIndicatorPosition(indicator, index1, index2);

          this._scroller.appendChild(indicator.element);
          this.addChild(indicator);

          return indicator;
        };

        const removeIndicator = (indicator) => {
          indicator.element.remove();
          indicator.off('click', onIndicatorClicked);
          this.removeChild(indicator);
        };

        sub.add(
          connectionview.subscribeAmount((rows, columns) => {
            const createRow = (index1) => {
              const row = new Array(columns);

              for (let i = 0; i < columns; i++) {
                const index2 = connectionview.startIndex2 + i;
                row[index2 % columns] = createIndicator(index1, index2);
              }

              return row;
            };

            const destroyRow = (row) => {
              row.forEach(removeIndicator);
            };

            resizeArrayMod(
              this.entries,
              rows,
              connectionview.startIndex1,
              createRow,
              destroyRow
            );

            for (let i = 0; i < rows; i++) {
              const index1 = connectionview.startIndex1 + i;
              const row = this.entries[index1 % rows];
              resizeArrayMod(
                row,
                columns,
                connectionview.startIndex2,
                (index2) => createIndicator(index1, index2),
                removeIndicator
              );
            }
          })
        );

        sub.add(
          connectionview.subscribeElements(
            (index1, index2, connection, source, sink) => {
              const entries = this.entries;
              const row = entries[index1 % entries.length];
              const indicator = row[index2 % row.length];

              indicator.updateData(index1, index2, connection, source, sink);
              setIndicatorPosition(indicator, index1, index2);
            }
          )
        );
      }
    }
    if (I.validate('_x0', '_y0', '_xd', '_yd') && this._batch) {
      const bbox = this.element.getBoundingClientRect();
      let width, height, x, y;
      if (O._xd < 0) {
        x = O._x0 + O._xd;
        width = -O._xd;
      } else {
        x = O._x0;
        width = O._xd;
      }
      if (O._yd < 0) {
        y = O._y0 + O._yd;
        height = -O._yd;
      } else {
        y = O._y0;
        height = O._yd;
      }
      x -= bbox.x;
      y -= bbox.y;
      this._batch.style.left = x + 'px';
      this._batch.style.top = y + 'px';
      this._batch.style.width = width + 'px';
      this._batch.style.height = height + 'px';
    }
  },
  /**
   * Scroll the indicators area to this vertical (top) position.
   *
   * @param {Integer} position - the position in pixels to scroll to.
   *
   * @method Indicators#scrollTopTo
   */
  scrollTopTo: function (position) {
    this.scrollTo({ top: position });
  },
  /**
   * Scroll the indicators area to this horizontal (left) position.
   *
   * @param {Integer} position - the position in pixels to scroll to.
   *
   * @method Indicators#scrollLeftTo
   */
  scrollLeftTo: function (position) {
    this.scrollTo({ left: position });
  },
  scrollTo: function (options) {
    this.element.scrollTo(options);
  },
});

/**
 * @member {HTMLDiv} Indicators#_scroller - The container for hiding
 *   the scroll bar.
 *   Has class <code>.aux-scroller</code>.
 */
defineChildElement(Indicators, 'scroller', {
  show: true,
});


/**
 * @member {HTMLDiv} Indicators#_batch - The rectangle to indicate
 *   batch selection/deselection.
 *   Has class `.aux-batch`.
 */
defineChildElement(Indicators, 'batch', {
  show: false,
  option: '_batch',
});

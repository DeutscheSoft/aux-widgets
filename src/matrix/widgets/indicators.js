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
import { sprintf } from '../../utils/sprintf.js';
import { Subscriptions } from '../../utils/subscriptions.js';
import { Timer } from '../../utils/timers.js';
import { subscribeDOMEvent } from '../../utils/events.js';

import { Container } from './../../widgets/container.js';
import { Indicator } from './indicator.js';
import { resizeArrayMod } from '../models.js';

scrollbarSize();

function onIndicatorClicked() {
  const indicators = this.parent;

  indicators.emit('indicatorClicked', this.source, this.sink);
}

/**
 * Indicators is an area inside {@link Matrix} containing a matrix of
 *   {@link Indicator}s displaying and managing connections.
 *
 * @param {Object}[options={ }] - An object containing initioal options.
 *
 * @property {Object} [options.indicator_class=Indicator] - the class to
 *   derive new {@link Indicator}s from. Has to be a subclass of
 *   {@link Indicator}.
 * @property {Integer} [options.scroll_top=0] - The scroll position from
 *   top.
 * @property {Integer} [options.scroll_left=0] - The scroll position
 *   from the left.
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
    scroll_top: 'number',
    scroll_left: 'number',
    connectionview: 'object',
  }),
  options: {
    indicator_class: Indicator,
    scroll_top: 0,
    scroll_left: 0,
  },
  static_events: {
    set_connectionview: function (connectionview) {
      this.connectionview_subs.unsubscribe();
    },
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    this.connectionview_subs = new Subscriptions();
    this._scroll_event_suppressed = false;
    this._scroll_timer = new Timer(() => {
      if (!this._scroll_event_suppressed) return;

      this._scroll_event_suppressed = false;
      const element = this.element;
      /**
       * Is fired on scrolling the area.
       *
       * @event Indicators#scrollChanged
       *
       * @param {Integer} scroll_top - The scroll position from top.
       * @param {Integer} scroll_left - The scroll position from left.
       */
      this.emit('scrollChanged', element.scrollTop, element.scrollLeft);
    });
    this.entries = [];
  },
  destroy: function () {
    Container.prototype.destroy.call(this);
    this._scroll_timer.stop();
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
        if (this._scroll_timer.active) {
          this._scroll_event_suppressed = true;
        } else {
          // jshint -W123
          const element = this.element;
          // jshint +W123
          this.emit('scrollChanged', element.scrollTop, element.scrollLeft);
        }
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
          indicator.element.style.transform = sprintf(
            'translateY(%.2fpx) translateX(%.2fpx)',
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
          connectionview.subscribeScrollView((offset_rows, offset_columns) => {
            const rows = connectionview.amount1;
            const columns = connectionview.amount2;
            const startIndex1 = connectionview.startIndex1;
            const startIndex2 = connectionview.startIndex2;

            // TODO: optimize this
            for (let i = 0; i < rows; i++) {
              for (let j = 0; j < columns; j++) {
                const index1 = startIndex1 + i;
                const index2 = startIndex2 + j;
                const indicator = this.entries[index1 % rows][index2 % columns];
                setIndicatorPosition(indicator, index1, index2);
              }
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
            }
          )
        );
      }
    }

    if (I.scroll_left) {
      I.scroll_left = false;
      this.element.scrollLeft = O.scroll_left;
    }
    if (I.scroll_top) {
      I.scroll_top = false;
      this.element.scrollTop = O.scroll_top;
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
    this.update('scroll_top', position);
    this._scroll_timer.restart(100);
  },
  /**
   * Scroll the indicators area to this horizontal (left) position.
   *
   * @param {Integer} position - the position in pixels to scroll to.
   *
   * @method Indicators#scrollLeftTo
   */
  scrollLeftTo: function (position) {
    this.update('scroll_left', position);
    this._scroll_timer.restart(100);
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

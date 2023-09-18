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

import { defineChildElement } from './../../widget_helpers.js';
import { defineChildWidget } from './../../child_widget.js';
import { addClass, removeClass } from './../../utils/dom.js';
import { scrollbarSize } from './../../utils/scrollbar_size.js';
import { FORMAT } from '../../utils/sprintf.js';
import { Subscriptions } from '../../utils/subscriptions.js';
import { subscribeDOMEvent } from '../../utils/events.js';

import { Button } from './../../widgets/button.js';
import { ConfirmButton } from './../../widgets/confirmbutton.js';
import { Container } from './../../widgets/container.js';
import { Indicator } from './indicator.js';
import { DragCapture } from '../../modules/dragcapture.js';
import { resizeArrayMod } from '../models.js';
import { defineRender, defineRecalculation } from '../../renderer.js';

scrollbarSize();

function onIndicatorClicked() {
  const indicators = this.parent;

  indicators.emit('indicatorClicked', this.source, this.sink);
}

const formatIndicatorTransform = FORMAT(
  'translateY(%.2fpx) translateX(%.2fpx)'
);

function getStartEvent(state) {
  if (state.findTouch) {
    return state.findTouch(state.start);
  } else {
    return state.start;
  }
}
function onDragStart(state, start, e) {
  onBatchEnd.call(this);
  return true;
}

function onDragging(s, e) {
  const O = this.options;
  const state = this.drag.state();
  const px = state.vDistance();
  const x = px[0];
  const y = px[1];
  if (!O._batch) {
    const dist = Math.sqrt(x * x + y * y);
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

function onDragStop(state, e) {
  if (this.get('_batch')) onBatchStart.call(this, e);
}

function onBatchStart() {
  const O = this.options;
  this.set('show_buttons', true);
  this.set('show_cancel', true);
  this.set('show_select_diagonal', true);
  this.set('show_deselect_diagonal', true);
  this.set('show_deselect_all', true);
}

function onBatchEnd() {
  this.set('show_cancel', false);
  this.set('show_select_diagonal', false);
  this.set('show_deselect_diagonal', false);
  this.set('show_deselect_all', false);
  this.set('show_buttons', false);
  this.set('_batch', false);
}

function cancel() {
  //this.emit("cancel");
  onBatchEnd.call(this);
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

export class Indicators extends Container {
  static get _options() {
    return {
      indicator_class: 'object',
      connectionview: 'object',
      batch: 'boolean',
      min_distance: 'number',
      _batch: 'boolean',
      _x0: 'number',
      _y0: 'number',
      _xd: 'number',
      _yd: 'number',
      _xinit: 'number',
      _yinit: 'number',
    };
  }

  static get options() {
    return {
      indicator_class: Indicator,
      min_distance: 40,
      batch: true,
      _batch: false,
      _x0: 0,
      _y0: 0,
      _xd: 0,
      _yd: 0,
      _xinit: 0,
      _yinit: 0,
    };
  }

  static get static_events() {
    return {
      set_batch: function (v) {
        this.drag.set('active', v);
      },
    };
  }

  static get renderers() {
    return [
      defineRecalculation(
        ['_x0', '_y0', '_xd', '_yd', '_xinit', '_yinit'],
        function (_x0, _y0, _xd, _yd, _xinit, _yinit) {
          this.set('_rect', this._calculateRectangle());
        }
      ),
      defineRender(['show_buttons', '_rect'], function (show_buttons, _rect) {
        const { _batch } = this;

        if (!_batch) return;

        const x = _rect.flip_x ? 'left' : 'right';
        const y = _rect.flip_y ? 'top' : 'bottom';
        removeClass(_batch, 'aux-top-left');
        removeClass(_batch, 'aux-bottom-left');
        removeClass(_batch, 'aux-top-right');
        removeClass(_batch, 'aux-bottom-right');
        addClass(_batch, 'aux-' + y + '-' + x);
      }),
      defineRender('_rect', function (_rect) {
        const { _batch } = this;

        if (!_batch) return;

        const style = _batch.style;

        style.left = _rect.x + 'px';
        style.top = _rect.y + 'px';
        style.width = _rect.width + 'px';
        style.height = _rect.height + 'px';
      }),
      defineRender(['_columns', '_rows', 'size'], function (
        _columns,
        _rows,
        size
      ) {
        this._scroller.style.width = _columns * size + 'px';
        this._scroller.style.height = _rows * size + 'px';
      }),
      defineRender(['connectionview', 'size'], function (connectionview, size) {
        this.connectionview_subs.unsubscribe();

        if (!connectionview) return;

        const sub = this.connectionview_subs;

        sub.add(
          connectionview.subscribeSize((rows, columns) => {
            this.set('_rows', rows);
            this.set('_columns', columns);
          })
        );

        const setIndicatorPosition = (indicator, index1, index2) => {
          indicator.element.style.transform = formatIndicatorTransform(
            index1 * size,
            index2 * size
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
      }),
    ];
  }

  initialize(options) {
    super.initialize(options);
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
  }

  destroy() {
    super.destroy();
    this.connectionview_subs.unsubscribe();
  }

  createIndicator() {
    return new this.options.indicator_class();
  }

  draw(options, element) {
    super.draw(options, element);
    addClass(element, 'aux-indicators');
    this.addSubscriptions(
      subscribeDOMEvent(this.element, 'scroll', (ev) => {
        onBatchEnd.call(this);
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
  }

  resize() {
    super.resize();
    const bbox = this.element.getBoundingClientRect();
    this.update('_xinit', bbox.x);
    this.update('_yinit', bbox.y);
  }

  _calculateRectangle() {
    const { _x0, _y0, _xd, _yd, _xinit, _yinit } = this.options;
    const stop = this.element.scrollTop;
    const sleft = this.element.scrollLeft;
    let width, height, x, y;
    if (_xd < 0) {
      x = _x0 + _xd + sleft;
      width = -_xd;
    } else {
      x = _x0 + sleft;
      width = _xd;
    }
    if (_yd < 0) {
      y = _y0 + _yd + stop;
      height = -_yd;
    } else {
      y = _y0 + stop;
      height = _yd;
    }
    x -= _xinit;
    y -= _yinit;
    return {
      x: x,
      y: y,
      width: width,
      height: height,
      flip_x: _xd < 0,
      flip_y: _yd < 0,
    };
  }

  _calculateIndexRectangle(rectangle) {
    const { x, y, width, height } = rectangle;
    const size = this.options.size;
    return {
      startColumn: x / size,
      endColumn: (x + width) / size,
      startRow: y / size,
      endRow: (y + height) / size,
    };
  }

  /**
   * Scroll the indicators area to this vertical (top) position.
   *
   * @param {Integer} position - the position in pixels to scroll to.
   *
   * @method Indicators#scrollTopTo
   */
  scrollTopTo(position) {
    this.scrollTo({ top: position });
  }

  /**
   * Scroll the indicators area to this horizontal (left) position.
   *
   * @param {Integer} position - the position in pixels to scroll to.
   *
   * @method Indicators#scrollLeftTo
   */
  scrollLeftTo(position) {
    this.scrollTo({ left: position });
  }

  scrollTo(options) {
    this.element.scrollTo(options);
  }

  // Event handler for batch operation dialog.
  _onConnectDiagonalConfirmed() {
    const rectangle = this._calculateRectangle();
    const indexRectangle = this._calculateIndexRectangle(rectangle);
    this.emit('connectDiagonal', indexRectangle, rectangle);
    onBatchEnd.call(this);
  }

  _onDisconnectDiagonalConfirmed() {
    const rectangle = this._calculateRectangle();
    const indexRectangle = this._calculateIndexRectangle(rectangle);
    this.emit('disconnectDiagonal', indexRectangle, rectangle);
    onBatchEnd.call(this);
  }

  _onDisconnectAllConfirmed() {
    const rectangle = this._calculateRectangle();
    const indexRectangle = this._calculateIndexRectangle(rectangle);
    this.emit('disconnectAll', indexRectangle, rectangle);
    onBatchEnd.call(this);
  }
}

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

defineChildWidget(Indicators, 'buttons', {
  create: Container,
  default_options: {
    class: 'aux-batchbuttons',
  },
  append: function () {
    this._batch.appendChild(this.buttons.element);
  },
});
defineChildWidget(Indicators, 'deselect_diagonal', {
  create: ConfirmButton,
  default_options: {
    icon: 'matrixdeselectdiagonal',
    icon_confirm: 'questionmark',
    class: 'aux-deselectdiagonal',
  },
  static_events: {
    mousedown: function (ev) {
      ev.stopPropagation();
      return false;
    },
    confirmed: function () {
      this.parent._onDisconnectDiagonalConfirmed();
      return false;
    },
  },
  append: function () {
    this.buttons.element.appendChild(this.deselect_diagonal.element);
  },
});
defineChildWidget(Indicators, 'deselect_all', {
  create: ConfirmButton,
  default_options: {
    icon: 'matrixdeselectall',
    icon_confirm: 'questionmark',
    class: 'aux-deselectall',
  },
  static_events: {
    mousedown: function (ev) {
      ev.stopPropagation();
      return false;
    },
    confirmed: function () {
      this.parent._onDisconnectAllConfirmed();
      return false;
    },
  },
  append: function () {
    this.buttons.element.appendChild(this.deselect_all.element);
  },
});
defineChildWidget(Indicators, 'select_diagonal', {
  create: ConfirmButton,
  default_options: {
    icon: 'matrixselectdiagonal',
    icon_confirm: 'questionmark',
    class: 'aux-selectdiagonal',
  },
  static_events: {
    mousedown: function (ev) {
      ev.stopPropagation();
      return false;
    },
    confirmed: function () {
      this.parent._onConnectDiagonalConfirmed();
      return false;
    },
  },
  append: function () {
    this.buttons.element.appendChild(this.select_diagonal.element);
  },
});
defineChildWidget(Indicators, 'cancel', {
  create: Button,
  default_options: {
    icon: 'cancel',
    class: 'aux-cancel',
  },
  static_events: {
    mousedown: function (ev) {
      ev.stopPropagation();
      return false;
    },
    click: function () {
      cancel.call(this.parent);
    },
  },
  append: function () {
    this.buttons.element.appendChild(this.cancel.element);
  },
});

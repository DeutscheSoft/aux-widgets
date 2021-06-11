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

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>value</code>.
 *
 * @event Fader#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { defineClass } from './../widget_helpers.js';
import { Widget } from './widget.js';
import { Ranged } from '../implements/ranged.js';
import { warning } from '../utils/warning.js';
import { setGlobalCursor, unsetGlobalCursor } from '../utils/global_cursor.js';
import { Scale } from './scale.js';
import { DragValue } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { Value } from './value.js';
import { Label } from './label.js';
import {
  element,
  addClass,
  removeClass,
  supports_transform,
  CSSSpace,
  outerHeight,
  innerHeight,
  outerWidth,
  innerWidth,
} from '../utils/dom.js';
import { defineChildWidget } from '../child_widget.js';

function vert(O) {
  return O.layout === 'left' || O.layout === 'right';
}
function getValue(ev) {
  const O = this.options;
  const transformation = O.transformation;
  const is_vertical = vert(O);
  const hsize = this._handle_size / 2;
  const pad = this._padding;

  let real;

  if (is_vertical) {
    real = this.options.basis - (ev.offsetY - hsize) + pad.bottom;
  } else {
    real = ev.offsetX - hsize + pad.left;
  }
  return transformation.pixelToValue(real);
}
function clicked(ev) {
  if (this._handle.contains(ev.target)) return;
  if (this.value && this.value.element.contains(ev.target)) return;
  if (this.label && this.label.element.contains(ev.target)) return;
  if (this.scale && this.scale.element.contains(ev.target)) return;
  this.userset('value', getValue.call(this, ev));
}
function dblClick() {
  this.userset('value', this.options.reset);
  /**
   * Is fired when the handle receives a double click.
   *
   * @event Fader#doubleclick
   *
   * @param {number} value - The value of the {@link Fader}.
   */
  this.emit('doubleclick', this.options.value);
}

/**
 * Fader is a slidable control with a {@link Scale} next to it which
 * can be both dragged and scrolled. Fader implements {@link Ranged}
 * and inherits its options.
 * A {@link Label} and a {@link Value} are available optionally.
 *
 * @class Fader
 *
 * @extends Widget
 *
 * @mixes Ranged
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.value] - The fader's position. This options is
 *   modified by user interaction.
 * @property {String} [options.layout] - The fader's layout. One out of
 *   `top`, `left`, `right` or `bottom`, defining the fader handles position
 *   in comparison to the scale.
 * @property {Boolean} [options.bind_click=false] - If true, a <code>click</code>
 *   on the fader will move the handle to the pointed position.
 * @property {Boolean} [options.bind_dblclick=true] - If true, a <code>dblclick</code>
 *   on the fader will reset the fader value to <code>options.reset</code>.
 * @property {Number} [options.reset=options.value] - The reset value, which is used by
 *   the <code>dblclick</code> event and the {@link Fader#reset} method.
 * @property {Boolean} [options.show_scale=true] - If true, a {@link Scale} is added to the fader.
 * @property {Boolean} [options.show_value=false] - If true, a {@link Value} widget is added to the fader.
 * @property {String|Boolean} [options.label=false] - Add a label to the fader. Set to `false` to remove the label from the DOM.
 * @property {String|Boolean} {options.cursor=false} - set a cursor from <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">standard cursors</a>
 *   on drag or scroll. Set to `false` to disable.
 */
export const Fader = defineClass({
  Extends: Widget,
  Implements: Ranged,
  _options: Object.assign(
    Object.create(Widget.prototype._options),
    Ranged.prototype._options,
    Scale.prototype._options,
    {
      value: 'number',
      division: 'number',
      levels: 'array',
      gap_dots: 'number',
      gap_labels: 'number',
      show_labels: 'boolean',
      labels: 'function',
      layout: 'string',
      direction: 'int',
      reset: 'number',
      bind_click: 'boolean',
      bind_dblclick: 'boolean',
      cursor: 'boolean|string',
    }
  ),
  options: {
    value: 0,
    division: 1,
    levels: [1, 6, 12, 24],
    gap_dots: 3,
    gap_labels: 40,
    show_labels: true,
    labels: function (val) {
      return val.toFixed(2);
    },
    layout: 'left',
    bind_click: false,
    bind_dblclick: true,
    label: false,
    cursor: false,
  },
  static_events: {
    set_bind_click: function (value) {
      if (value) this.on('click', clicked);
      else this.off('click', clicked);
    },
    set_bind_dblclick: function (value) {
      if (value) this.on('dblclick', dblClick);
      else this.off('dblclick', dblClick);
    },
    set_layout: function () {
      this.options.direction = vert(this.options) ? 'vertical' : 'horizontal';
      this.drag.set('direction', this.options.direction);
      this.scroll.set('direction', this.options.direction);
    },
    set_interacting: function (v) {
      const cursor = this.options.cursor;
      if (!cursor)
        return;
      if (v)
        setGlobalCursor(cursor);
      else
        unsetGlobalCursor(cursor);
    },
  },
  initialize: function (options) {
    this.__tt = false;
    if (!options.element) options.element = element('div');
    Widget.prototype.initialize.call(this, options);

    const O = this.options;

    /**
     * @member {HTMLDivElement} Fader#element - The main DIV container.
     *   Has class <code>.aux-fader</code>.
     */

    /**
     * @member {HTMLDivElement} Fader#_track - The track for the handle. Has class <code>.aux-track</code>.
     */
    this._track = element('div', 'aux-track');

    /**
     * @member {HTMLDivElement} Fader#_handle - The handle of the fader. Has class <code>.aux-handle</code>.
     */
    this._handle = element('div', 'aux-handle');
    this._handle_size = 0;
    this._track.appendChild(this._handle);

    if (O.reset === void 0) O.reset = O.value;

    if (O.direction === void 0)
      O.direction = vert(O) ? 'vertical' : 'horizontal';
    /**
     * @member {DragValue} Fader#drag - Instance of {@link DragValue} used for the handle
     *   interaction.
     */
    this.drag = new DragValue(this, {
      node: this._handle,
      classes: this.element,
      direction: O.direction,
      limit: true,
    });
    this.drag.on('startdrag', () => this.startInteracting());
    this.drag.on('stopdrag', () => this.stopInteracting());
    /**
     * @member {ScrollValue} Fader#scroll - Instance of {@link ScrollValue} used for the
     *   handle interaction.
     */
    this.scroll = new ScrollValue(this, {
      node: this.element,
      classes: this.element,
      limit: true,
    });
    this.scroll.on('scrollstarted', () => this.startInteracting());
    this.scroll.on('scrollended', () => this.stopInteracting());

    this.set('bind_click', O.bind_click);
    this.set('bind_dblclick', O.bind_dblclick);
  },
  draw: function (O, element) {
    addClass(element, 'aux-fader');
    element.appendChild(this._track);

    Widget.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    Widget.prototype.redraw.call(this);
    const I = this.invalid;
    const O = this.options;
    const E = this.element;
    let value;
    let tmp;

    if (I.layout) {
      I.layout = false;
      value = O.layout;
      removeClass(
        E,
        'aux-vertical',
        'aux-horizontal',
        'aux-left',
        'aux-right',
        'aux-top',
        'aux-bottom'
      );
      addClass(E, vert(O) ? 'aux-vertical' : 'aux-horizontal');
      addClass(E, 'aux-' + value);

      if (supports_transform) this._handle.style.transform = null;
      else {
        if (vert(O)) this._handle.style.left = null;
        else this._handle.style.bottom = null;
      }
      I.value = false;
    }

    if (I.validate('value', 'transformation')) {
      const transformation = O.transformation;
      const snap_module = O.snap_module;
      tmp = transformation.valueToPixel(snap_module.snap(O.value)) + 'px';

      if (vert(O)) {
        if (supports_transform)
          this._handle.style.transform = 'translateY(-' + tmp + ')';
        else this._handle.style.bottom = tmp;
      } else {
        if (supports_transform)
          this._handle.style.transform = 'translateX(' + tmp + ')';
        else this._handle.style.left = tmp;
      }
    }
  },
  resize: function () {
    const O = this.options;
    const T = this._track,
      H = this._handle;
    let basis;

    Widget.prototype.resize.call(this);

    this._padding = CSSSpace(T, 'padding', 'border');

    if (vert(O)) {
      this._handle_size = outerHeight(H, true);
      basis = innerHeight(T) - this._handle_size;
    } else {
      this._handle_size = outerWidth(H, true);
      basis = innerWidth(T) - this._handle_size;
    }

    this.set('basis', basis);
  },
  destroy: function () {
    this._handle.remove();
    Widget.prototype.destroy.call(this);
  },

  /**
   * Resets the fader value to <code>options.reset</code>.
   *
   * @method Fader#reset
   */
  reset: function () {
    this.set('value', this.options.reset);
  },

  // GETTER & SETTER
  set: function (key, value) {
    const O = this.options;
    if (key === 'value') {
      if (value > O.max || value < O.min) warning(this.element);
    }
    return Widget.prototype.set.call(this, key, value);
  },
});
/**
 * @member {Scale} Fader#scale - A {@link Scale} to display a scale next to the fader.
 */
defineChildWidget(Fader, 'scale', {
  create: Scale,
  show: true,
  inherit_options: true,
  toggle_class: true,
  static_events: {
    set: function (key, value) {
      /**
       * Is fired when the scale was changed.
       *
       * @event Fader#scalechanged
       *
       * @param {string} key - The key of the option.
       * @param {mixed} value - The value to which it was set.
       */
      if (this.parent) this.parent.emit('scalechanged', key, value);
    },
  },
});
/**
 * @member {Label} Fader#label - A {@link Label} to display a title.
 */
defineChildWidget(Fader, 'label', {
  create: Label,
  show: false,
  toggle_class: true,
  option: 'label',
  map_options: {
    label: 'label',
  },
});
/**
 * @member {Value} Fader#value - A {@link Value} to display the current value, offering a way to enter a value via keyboard.
 */
defineChildWidget(Fader, 'value', {
  create: Value,
  show: false,
  userset_delegate: true,
  map_options: {
    value: 'value',
  },
  toggle_class: true,
});

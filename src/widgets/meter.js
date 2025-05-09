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

import { mergeStaticEvents } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { Widget } from './widget.js';
import { Label } from './label.js';
import {
  rangedEvents,
  rangedOptionsDefaults,
  rangedRenderers,
} from '../utils/ranged.js';
import { Scale } from './scale.js';
import {
  element,
  addClass,
  toggleClass,
  removeClass,
  insertAfter,
  innerWidth,
  innerHeight,
  createID,
  applyAttribute,
} from '../utils/dom.js';
import {
  applyMeterFillStyle,
  computeMeterFillStyle,
} from '../utils/meter_fill_style.js';
import {
  defineRender,
  defineMeasure,
  defineRecalculation,
} from '../renderer.js';

import { FORMAT } from '../utils/sprintf.js';
import {
  addInterval,
  clearIntervals,
  diffIntervals,
  emptyIntervals,
  invertIntervals,
} from '../utils/intervals.js';

function vert(layout) {
  return layout === 'left' || layout === 'right';
}

/**
 *
 * @param {number[]} to
 * @param {number} lhs
 * @param {number} rhs
 */
export function addMeterInterval(to, lhs, rhs) {
  lhs = lhs | 0;
  rhs = rhs | 0;
  const min = Math.min(lhs, rhs);
  const max = Math.max(lhs, rhs);
  addInterval(to, min, max);
}

class CanvasDrawingContext {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   * @param {string|CanvasGradient|CanvasPattern} options.fillStyle
   * @param {number} options.height
   * @param {number} options.width
   * @param {boolean} options.vertical
   */
  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options;
    this.currentState = null;
    this.nextState = emptyIntervals();
    this.ctx = canvas.getContext('2d');
  }

  draw() {
    const { ctx, options } = this;

    const { width, height, vertical } = options;

    if (this.currentState === null) {
      ctx.fillStyle = options.fillStyle;
      ctx.fillRect(0, 0, width, height);
      this.currentState = emptyIntervals();
    }

    let sizeDrawn = 0;

    diffIntervals(
      this.currentState,
      this.nextState,
      (start, stop) => {
        const size = stop - start + 1;
        if (vertical) {
          ctx.clearRect(0, height - stop, width, size);
        } else {
          ctx.clearRect(start, 0, size, height);
        }
        sizeDrawn += size;
      },
      (start, stop) => {
        const size = stop - start + 1;
        if (vertical) {
          ctx.fillRect(0, height - stop, width, size);
        } else {
          ctx.fillRect(start, 0, size, height);
        }
        sizeDrawn += size;
      },
    );

    const nextState = this.nextState;

    this.nextState = this.currentState;
    this.currentState = nextState;
    clearIntervals(this.nextState);
  }
}

/**
 * Meter is a base class to build different meters from, such as {@link LevelMeter}.
 * Meter contains a {@link Scale} widget and inherits all its options.
 *
 * Note that level meters with high update frequencies can be very demanding when it comes
 * to rendering performance. These performance requirements can be reduced by increasing the
 * segment size using the <code>segment</code> option. Using a segment, the different level
 * meter positions are reduced. This widget will take advantage of that by avoiding rendering those
 * changes to the meter level, which fall into the same segment.
 *
 * The meter is drawn as a mask above a background. The mask represents the
 * inactive part of the meter. This mask is drawn into a canvas. The
 * fillstyle of this mask is initialized from the `background-color` style
 * of the canvas element with class `aux-mask`. Note that using a `background-color`
 * value with opacity will lead to rendering artifacts in the meter. Instead, set
 * the `opacity` of the mask to the desired value.
 *
 * @class Meter
 *
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} [options.layout="left"] - A string describing the layout of the meter.
 *   Possible values are <code>"left"</code>, <code>"right"</code>, <code>"top"</code> and
 *   <code>"bottom"</code>. <code>"left"</code> and <code>"right"</code> are vertical
 *   layouts, where the meter is on the left or right of the scale, respectively. Similarly,
 *   <code>"top"</code> and <code>"bottom"</code> are horizontal layouts in which the meter
 *   is at the top or the bottom, respectively.
 * @property {Integer} [options.segment=1] - Segment size. Pixel positions of the meter level are
 *   rounded to multiples of this size. This can be used to give the level meter a LED effect and to
 *   reduce processor load.
 * @property {Number} [options.value=0] - Level value.
 * @property {Number} [options.base=false] - The base value of the meter. If set to <code>false</code>,
 *   the base will coincide with the minimum value <code>options.min</code>. The meter level is drawn
 *   starting from the base to the value.
 * @property {Number} [options.value_label=0] - Value to be displayed on the label.
 * @property {Function} [options.format_value=FORMAT("%.2f")] - Function for formatting the
 *   label.
 * @property {Boolean} [options.show_label=false] - If set to <code>true</code> a label is displayed.
 * @property {Number} [options.label=false] - The title of the Meter. Set to `false` to hide it.
 * @property {Boolean} [options.show_scale=true] - Set to <code>false</code> to hide the scale.
 * @property {Number} [options.value_label=0] - The value to be drawn in the value label.
 * @property {Boolean} [options.sync_value=true] - Synchronize the value on the bar with
 *   the value label using `options.format_value` function.
 * @property {String|Object|Object[]|Function} [options.foreground] - Color or gradient definition to draw the overlay.
 *   Can be either a string containing a valid CSS color (e.g. '#12345678', 'rgba(0,112,45, 0.6)', 'black')
 *   or an array containing objects like `[{value: -60, color: 'green'}, {value: 0, color: '#ff8800'}]`
 *   or an object with numerical strings as keys, e.g. `{'-60': 'green', '0': '#ff8800'}`
 *   or a function receiving the canvas' context, the widget's options, the canvas element and width and height.
 * @property {String|Object[]|Object|Function} [options.background] - Color or gradient definition to draw the backdrop.
 *   Can be either a string containing a valid CSS color (e.g. '#12345678', 'rgba(0,112,45, 0.6)', 'black')
 *   or an array containing objects like `[{value: -60, color: 'green'}, {value: 0, color: '#ff8800'}]`
 *   or an object with numerical strings as keys, e.g. `{'-60': 'green', '0': '#ff8800'}`
 * @property {Boolean|Object[]|Object|Function} [options.gradient=false] - Deprecated. Use `background`, instead.
 * @property {String} [options.paint_mode='inverse'] - Either <code>value</code> or <code>inverse</code>.
 *   The meter value is drawn using two canvas elements. With `paint_mode=inverse` the foreground canvas shows
 *   the inverse of the metering value. In this mode the foreground acts as a mask and the background element
 *   represents the current metering value.
 *   With `paint_mode=value` the foreground canvas shows the value itself. In this mode the meter is represented
 *   by the foreground element.
 */

export class Meter extends Widget {
  static get _options() {
    return [
      Scale.getOptionTypes(),
      {
        layout: 'string',
        segment: 'number',
        value: 'number',
        value_label: 'number',
        base: 'number|boolean',
        label: 'string|boolean',
        sync_value: 'boolean',
        format_value: 'function',
        background: 'string|boolean|array|object',
        gradient: 'object|boolean|function',
        foreground: 'string|boolean|array|object',
        paint_mode: 'string',
      },
    ];
  }

  static get options() {
    return [
      rangedOptionsDefaults,
      {
        layout: 'left',
        segment: 1,
        value: 0,
        value_label: 0,
        base: false,
        label: false,
        sync_value: true,
        format_value: FORMAT('%.2f'),
        levels: [1, 5, 10], // array of steps where to draw labels
        background: 'transparent',
        gradient: false,
        foreground: 'transparent',
        role: 'meter',
        set_ariavalue: true,
        aria_live: 'off',
        paint_mode: 'inverse',
      },
    ];
  }

  static get static_events() {
    return mergeStaticEvents(rangedEvents, {
      set_base: function (value) {
        if (value === false) {
          const O = this.options;
          O.base = value = O.min;
        }
      },
      set_value: function (val) {
        if (this.options.sync_value) this.set('value_label', val);
      },
      set_value_label: function (val) {
        if (this.value) this.value.set('label', this.options.format_value(val));
      },
      set_layout: function () {
        const O = this.options;
        this.set('value', O.value);
        this.set('min', O.min);
        this.triggerResize();
      },
      initialized: function () {
        this.set('value', this.get('value'));
        this.set('base', this.get('base'));
      },
    });
  }

  static get renderers() {
    return [
      ...rangedRenderers,
      defineRender('reverse', function (reverse) {
        toggleClass(this.element, 'aux-reverse', reverse);
      }),
      defineRender('layout', function (layout) {
        const E = this.element;
        const scale = this.scale ? this.scale.element : null;
        const bar = this._bar;
        removeClass(
          E,
          'aux-vertical',
          'aux-horizontal',
          'aux-left',
          'aux-right',
          'aux-top',
          'aux-bottom'
        );
        switch (layout) {
          case 'left':
            addClass(E, 'aux-vertical', 'aux-left');
            if (scale) insertAfter(scale, bar);
            break;
          case 'right':
            addClass(E, 'aux-vertical', 'aux-right');
            if (scale) insertAfter(bar, scale);
            break;
          case 'top':
            addClass(E, 'aux-horizontal', 'aux-top');
            if (scale) insertAfter(scale, bar);
            break;
          case 'bottom':
            addClass(E, 'aux-horizontal', 'aux-bottom');
            if (scale) insertAfter(bar, scale);
            break;
          default:
            throw new Error('unsupported layout');
        }
      }),
      defineRender(['_width', '_height'], function (_width, _height) {
        const { _canvas } = this;

        if (!(_height > 0 && _width > 0)) return;

        _canvas.setAttribute('height', Math.round(_height));
        _canvas.setAttribute('width', Math.round(_width));
        /* FIXME: I am not sure why this is even necessary */
        _canvas.style.width = _width + 'px';
        _canvas.style.height = _height + 'px';
      }),
      defineRender(
        [
          '_background_fillstyle',
          '_width',
          '_height',
          'gradient',
          'background',
          'reverse',
          'transformation',
          'snap_module',
          'layout',
        ],
        function (_background_fillstyle, _width, _height) {
          if (!(_height > 0 && _width > 0)) return;
          const { _backdrop } = this;
          _backdrop.setAttribute('height', Math.round(_height));
          _backdrop.setAttribute('width', Math.round(_width));
          _backdrop.style.width = _width + 'px';
          _backdrop.style.height = _height + 'px';
          const ctx = _backdrop.getContext('2d');
          applyMeterFillStyle(this, _backdrop, _background_fillstyle);
          ctx.fillRect(0, 0, _width, _height);
        }
      ),
      defineMeasure(['_width', '_height', 'layout'], function (
        _width,
        _height,
        layout
      ) {
        this.set('basis', vert(layout) ? _height : _width);
      }),
      defineRender(
        [
          'paint_mode',
          '_draw_context',
          'value',
          'basis',
          'transformation',
          'segment',
          'base',
        ],
        function () {
          return this.drawMeter();
        }
      ),
      defineRender(['label', 'aria_labelledby'], function (
        label,
        aria_labelledby
      ) {
        if (aria_labelledby !== void 0) return;

        const value = label !== false ? this.label.get('id') : null;
        applyAttribute(this.element, 'aria-labelledby', value);
      }),
      defineRecalculation(
        [
          'gradient',
          'background',
          '_width',
          '_height',
          'base',
          'transformation',
          'snap_module',
          'layout',
          'segment',
        ],
        function (gradient, background) {
          const fillStyle = computeMeterFillStyle(
            gradient || background,
            this._backdrop,
            this.options
          );
          this.update('_background_fillstyle', fillStyle);
        }
      ),
      defineRecalculation(
        [
          'foreground',
          '_width',
          '_height',
          'base',
          'transformation',
          'snap_module',
          'layout',
          'segment',
        ],
        function (foreground) {
          const fillStyle = computeMeterFillStyle(
            foreground,
            this._canvas,
            this.options
          );
          this.update('_foreground_fillstyle', fillStyle);
        }
      ),
      defineRecalculation(
        ['_width', '_height', '_foreground_fillstyle', 'layout'],
        function (width, height, fillStyle, layout) {
          this.update(
            '_draw_context',
            new CanvasDrawingContext(this._canvas, {
              fillStyle,
              width,
              height,
              vertical: vert(layout),
            })
          );
        }
      ),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    const O = this.options;
    /**
     * @member {HTMLDivElement} Meter#element - The main DIV container.
     *   Has class <code>.aux-meter</code>.
     */
    this._bar = element('div', 'aux-bar');
    /**
     * @member {HTMLCanvas} Meter#_backdrop - The canvas element drawing the background.
     *   Has class <code>.aux-backdrop</code>.
     */
    this._backdrop = document.createElement('canvas');
    addClass(this._backdrop, 'aux-backdrop');
    /**
     * @member {HTMLCanvas} Meter#_canvas - The canvas element drawing the mask.
     *   Has class <code>.aux-mask</code>.
     */
    this._canvas = document.createElement('canvas');
    addClass(this._canvas, 'aux-mask');

    this._bar.appendChild(this._backdrop);
    this._bar.appendChild(this._canvas);

    /**
     * @member {HTMLDivElement} Meter#_bar - The DIV element containing the masks
     *      and drawing the background. Has class <code>.aux-bar</code>.
     */
    this._last_meters = [];
    this._current_meters = [];

    this.set('label', O.label);
    this.set('base', O.base);
  }

  destroy() {
    this._bar.remove();
    super.destroy();
  }

  draw(O, element) {
    addClass(element, 'aux-meter');
    element.appendChild(this._bar);
    this.set('aria_live', O.aria_live);

    super.draw(O, element);
  }

  getResizeTargets() {
    return [this._bar];
  }

  resize() {
    super.resize();

    const _bar = this._bar;

    const w = innerWidth(_bar, undefined, true);
    const h = innerHeight(_bar, undefined, true);

    this.set('_width', w);
    this.set('_height', h);
  }

  effectiveValue() {
    return this.options.value;
  }

  calculateMeter(to) {
    const value = this.effectiveValue();
    const O = this.options;
    // Set the mask elements according to options.value to show a value in
    // the meter bar
    const base = O.base;
    const segment = O.segment | 0;
    const transformation = O.transformation;

    /* At this point the whole meter bar is filled. We now want
     * to clear the area between base and value.
     */

    if (base !== value) {
      const v1 = transformation.valueToPixel(base) | 0;
      let v2 = transformation.valueToPixel(value) | 0;

      if (segment !== 1) {
        v2 = (v1 + segment * Math.round((v2 - v1) / segment)) | 0;
      }

      addMeterInterval(to, v1, v2);
    }
  }

  drawMeter() {
    const { basis, paint_mode, value, _draw_context } = this.options;
    if (!basis) return;
    if (!_draw_context) return;

    const a = _draw_context.nextState;
    this.calculateMeter(a, value);

    if (paint_mode === 'value') {
      invertIntervals(a, 0, basis);
    }

    _draw_context.draw();
  }

  hasBase() {
    const O = this.options;
    return O.base > O.min;
  }
}
/**
 * @member {Scale} Meter#scale - The {@link Scale} of the meter.
 */
defineChildWidget(Meter, 'scale', {
  create: Scale,
  default_options: {
    labels: FORMAT('%.2f'),
  },
  inherit_options: true,
  show: true,
  toggle_class: true,
  static_events: {
    set: function (key, value) {
      const p = this.parent;
      if (p) p.emit('scalechanged', key, value);
    },
  },
});
/**
 * @member {Label} Meter#label - The {@link Label} displaying the title.
 *   Has class <code>.aux-label</code>.
 */
defineChildWidget(Meter, 'label', {
  create: Label,
  show: false,
  option: 'label',
  map_options: { label: 'label' },
  toggle_class: true,
  static_events: {
    initialized: function () {
      if (!this.get('id')) {
        this.set('id', createID('aux-label-'));
      }
    },
  },
});
/**
 * @member {Label} Meter#value - The {@link Label} displaying the value.
 */
defineChildWidget(Meter, 'value', {
  create: Label,
  show: false,
  toggle_class: true,
  default_options: {
    class: 'aux-value',
    role: 'status',
  },
});

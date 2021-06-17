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

import { defineClass } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { Widget } from './widget.js';
import { Label } from './label.js';
import {
  rangedOptionsDefaults,
  rangedOptionsTypes,
  makeRanged,
} from '../utils/make_ranged.js';
import { Scale } from './scale.js';
import { sprintf } from '../utils/sprintf.js';
import {
  element,
  addClass,
  toggleClass,
  removeClass,
  insertAfter,
  innerWidth,
  innerHeight,
} from '../utils/dom.js';

import { FORMAT } from '../utils/sprintf.js';

function vert(O) {
  return O.layout === 'left' || O.layout === 'right';
}
function fillInterval(ctx, w, h, a, is_vertical) {
  let i;
  if (is_vertical) {
    for (i = 0; i < a.length; i += 2) {
      ctx.fillRect(0, h - a[i + 1], w, a[i + 1] - a[i]);
    }
  } else {
    for (i = 0; i < a.length; i += 2) {
      ctx.fillRect(a[i], 0, a[i + 1] - a[i], h);
    }
  }
}
function clearInterval(ctx, w, h, a, is_vertical) {
  let i;
  if (is_vertical) {
    for (i = 0; i < a.length; i += 2) {
      ctx.clearRect(0, h - a[i + 1], w, a[i + 1] - a[i]);
    }
  } else {
    for (i = 0; i < a.length; i += 2) {
      ctx.clearRect(a[i], 0, a[i + 1] - a[i], h);
    }
  }
}
function drawFull(ctx, w, h, a, is_vertical) {
  ctx.fillRect(0, 0, w, h);
  clearInterval(ctx, w, h, a, is_vertical);
}
function makeInterval(a) {
  let i, tmp, again;

  do {
    again = false;
    for (i = 0; i < a.length - 2; i += 2) {
      if (a[i] > a[i + 2]) {
        tmp = a[i];
        a[i] = a[i + 2];
        a[i + 2] = tmp;

        tmp = a[i + 1];
        a[i + 1] = a[i + 3];
        a[i + 3] = tmp;
        again = true;
      }
    }
  } while (again);

  for (i = 0; i < a.length - 2; i += 2) {
    // the first interval overlaps with the next, we merge them
    if (a[i + 1] > a[i + 2]) {
      if (a[i + 3] > a[i + 1]) {
        a[i + 1] = a[i + 3];
      }
      a.splice(i + 2, 2);
      continue;
    }
  }
}
function cmpIntervals(a, b) {
  let ret = 0;
  let i;

  for (i = 0; i < a.length; i += 2) {
    if (a[i] === b[i]) {
      if (a[i + 1] === b[i + 1]) continue;
      ret |= a[i + 1] < b[i + 1] ? 1 : 2;
    } else if (a[i + 1] === b[i + 1]) {
      ret |= a[i] > b[i] ? 1 : 2;
    } else return 4;
  }
  return ret;
}
function subtractIntervals(a, b) {
  let i;
  const ret = [];

  for (i = 0; i < a.length; i += 2) {
    if (a[i] === b[i]) {
      if (a[i + 1] <= b[i + 1]) continue;
      ret.push(b[i + 1], a[i + 1]);
    } else {
      if (a[i] > b[i]) continue;
      ret.push(a[i], b[i]);
    }
  }

  return ret;
}

function drawGradient(element, gradient, fallback, range) {
  const O = this.options;
  let bg = '';
  range = range || this;

  if (!gradient && !O.gradient) {
    bg = fallback || O.background;
    if (element.tagName === 'CANVAS') {
      const ctx = element.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, O._width, O._height);
      return;
    }
  } else {
    gradient = gradient || this.options.gradient;

    let keys = Object.keys(gradient);
    for (let i = 0; i < keys.length; i++) {
      keys[i] = parseFloat(keys[i]);
    }
    keys = keys.sort(
      O.reverse
        ? function (a, b) {
            return b - a;
          }
        : function (a, b) {
            return a - b;
          }
    );

    const transformation = O.transformation;
    const snap_module = O.snap_module;

    if (element.tagName === 'CANVAS') {
      const vert = O.layout == 'left' || O.layout == 'right';
      const ctx = element.getContext('2d');
      const grd = ctx.createLinearGradient(
        0,
        0,
        vert ? 0 : O._width || 0,
        vert ? O._height || 0 : 0
      );
      for (let i = 0; i < keys.length; i++) {
        let pos = transformation.valueToCoef(snap_module.snap(keys[i]));
        pos = Math.min(1, Math.max(0, pos));
        if (vert) pos = 1 - pos;
        grd.addColorStop(pos, gradient[keys[i] + '']);
      }
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, O._width, O._height);
      return;
    }

    let m_regular = '';
    const s_regular = 'linear-gradient(%s, %s)';
    const c_regular = '%s %s%%, ';

    const d_w3c = {};
    d_w3c.sleft = 'to top';
    d_w3c.sright = 'to top';
    d_w3c.stop = 'to right';
    d_w3c.sbottom = 'to right';

    for (let i = 0; i < keys.length; i++) {
      const ps = (
        100 * transformation.valueToCoef(snap_module.snap(keys[i]))
      ).toFixed(2);
      m_regular += sprintf(c_regular, gradient[keys[i] + ''], ps);
    }
    m_regular = m_regular.substr(0, m_regular.length - 2);
    bg = sprintf(s_regular, d_w3c['s' + this.options.layout], m_regular);
  }

  if (element) {
    element.style.background = bg ? bg : void 0;
  }
  return bg;
}

export const Meter = defineClass({
  /**
   * Meter is a base class to build different meters from, such as {@link LevelMeter}.
   * Meter uses {@link Gradient} and contains a {@link Scale} widget.
   * Meter inherits all options from {@link Scale}.
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
   * @property {String|Boolean} [options.foreground] - Color to draw the overlay. Has to be set
   *   via option for performance reasons. Use pure opaque color. If opacity is needed, set via CSS
   *   on `.aux-meter > .aux-bar > .aux-mask`.
   */

  Extends: Widget,
  _options: Object.assign(
    {},
    Widget.prototype._options,
    Scale.prototype._options,
    {
      layout: 'string',
      segment: 'number',
      value: 'number',
      value_label: 'number',
      base: 'number|boolean',
      label: 'string|boolean',
      sync_value: 'boolean',
      format_value: 'function',
      background: 'string|boolean',
      gradient: 'object|boolean',
      foreground: 'string|boolean',
    }
  ),
  options: Object.assign({}, rangedOptionsDefaults, {
    layout: 'left',
    segment: 1,
    value: 0,
    value_label: 0,
    base: false,
    label: false,
    sync_value: true,
    format_value: FORMAT('%.2f'),
    levels: [1, 5, 10], // array of steps where to draw labels
    background: false,
    gradient: false,
    foreground: 'black',
  }),
  static_events: {
    set_base: function (value) {
      if (value === false) {
        const O = this.options;
        O.base = value = O.min;
      }
    },
    rangedchanged: function () {
      /* redraw the gradient, if we have any */

      const gradient = this.options.gradient;

      if (gradient) {
        this.set('gradient', gradient);
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
  },

  initialize: function (options) {
    if (!options.element) options.element = element('div');
    Widget.prototype.initialize.call(this, options);
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
  },

  destroy: function () {
    this._bar.remove();
    Widget.prototype.destroy.call(this);
  },
  draw: function (O, element) {
    addClass(element, 'aux-meter');
    element.appendChild(this._bar);

    Widget.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    const I = this.invalid;
    const O = this.options;
    const E = this.element;

    if (I.reverse) {
      I.reverse = false;
      toggleClass(E, 'aux-reverse', O.reverse);
    }

    Widget.prototype.redraw.call(this);

    if (I.layout) {
      I.layout = false;
      removeClass(
        E,
        'aux-vertical',
        'aux-horizontal',
        'aux-left',
        'aux-right',
        'aux-top',
        'aux-bottom'
      );
      const scale = this.scale ? this.scale.element : null;
      const bar = this._bar;
      switch (O.layout) {
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
    }

    if (O.foreground === false) return;

    if (I.basis && O._height > 0 && O._width > 0) {
      I.basis = false;

      this._canvas.setAttribute('height', Math.round(O._height));
      this._canvas.setAttribute('width', Math.round(O._width));
      /* FIXME: I am not sure why this is even necessary */
      this._canvas.style.width = O._width + 'px';
      this._canvas.style.height = O._height + 'px';
      this._canvas.getContext('2d').fillStyle = O.foreground;

      this._backdrop.setAttribute('height', Math.round(O._height));
      this._backdrop.setAttribute('width', Math.round(O._width));
      /* FIXME: I am not sure why this is even necessary */
      this._backdrop.style.width = O._width + 'px';
      this._backdrop.style.height = O._height + 'px';
    }

    if (I.gradient || I.background) {
      I.gradient = I.background = false;
      drawGradient.call(this, this._backdrop, O.gradient, O.background);
    }

    if (I.value || I.transformation || I.segment || I.foreground) {
      I.transformation = I.value = I.segment = I.foreground = false;
      this.drawMeter();
    }
  },

  resize: function () {
    const O = this.options;
    Widget.prototype.resize.call(this);
    const w = innerWidth(this._bar);
    const h = innerHeight(this._bar);
    this.set('_width', w);
    this.set('_height', h);
    const i = vert(O) ? h : w;
    this.set('basis', i);
    this._last_meters.length = 0;
    this.set('gradient', O.gradient);
  },

  calculateMeter: function (to, value, i) {
    const O = this.options;
    // Set the mask elements according to options.value to show a value in
    // the meter bar
    const base = O.base;
    const segment = O.segment | 0;
    const transformation = O.transformation;

    /* At this point the whole meter bar is filled. We now want
     * to clear the area between base and value.
     */

    /* canvas coordinates are reversed */
    const v1 = transformation.valueToPixel(base) | 0;
    let v2 = transformation.valueToPixel(value) | 0;

    if (segment !== 1) {
      v2 = (v1 + segment * Math.round((v2 - v1) / segment)) | 0;
    }

    if (v2 < v1) {
      to[i++] = v2;
      to[i++] = v1;
    } else {
      to[i++] = v1;
      to[i++] = v2;
    }

    return i;
  },

  drawMeter: function () {
    const O = this.options;
    const w = Math.round(O._width);
    const h = Math.round(O._height);

    if (!(w > 0 && h > 0)) return;

    const a = this._current_meters;
    const tmp = this._last_meters;

    const i = this.calculateMeter(a, O.value, 0);
    if (i < a.length) a.length = i;
    makeInterval(a);

    this._last_meters = a;
    this._current_meters = tmp;

    let diff;

    if (tmp.length === a.length) {
      diff = cmpIntervals(tmp, a) | 0;
    } else diff = 4;

    if (!diff) return;

    // FIXME: this is currently broken for some reason
    if (diff == 1) diff = 4;

    const ctx = this._canvas.getContext('2d');
    ctx.fillStyle = O.foreground;
    const is_vertical = vert(O);

    if (diff === 1) {
      /* a - tmp is non-empty */
      clearInterval(ctx, w, h, subtractIntervals(a, tmp), is_vertical);
      return;
    }
    if (diff === 2) {
      /* tmp - a is non-empty */
      fillInterval(ctx, w, h, subtractIntervals(tmp, a), is_vertical);
      return;
    }

    drawFull(ctx, w, h, a, is_vertical);
  },

  hasBase: function () {
    const O = this.options;
    return O.base > O.min;
  },
});
makeRanged(Meter);
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
  },
});

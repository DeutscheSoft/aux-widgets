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

/* jshint -W014 */
/* jshint -W086 */

import { defineClass } from './../widget_helpers.js';
import { Widget } from './widget.js';
import { Ranges } from '../implements/ranges.js';
import { addClass, removeClass } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { error } from '../utils/log.js';

function rangeChangeCallback() {
  this.invalidateAll();
  this.triggerDraw();
}
// this is not really a rounding operation but simply adds 0.5. we do this to make sure
// that integer pixel positions result in actual pixels, instead of being spread across
// two pixels with half opacity
function SVGRound(x) {
  x = +x;
  return x + 0.5;
}
function getPixels(value, range) {
  return SVGRound(range.valueToPixel(value));
}

function _start(d, s) {
  var h = this.range_y.options.basis;
  var t = d[0].type || this.options.type;
  var m = this.options.mode;
  var x = this.range_x.valueToPixel(d[0].x);
  var y = this.range_y.valueToPixel(d[0].y);
  switch (m) {
    case 'bottom':
      // fill the lower part of the graph
      s.push(
        'M ' + SVGRound(x - 1) + ' ',
        SVGRound(h + 1) + ' ' + t + ' ',
        SVGRound(x - 1) + ' ',
        SVGRound(y)
      );
      break;
    case 'top':
      // fill the upper part of the graph
      s.push(
        'M ' + SVGRound(x - 1) + ' ' + SVGRound(-1),
        ' ' + t + ' ' + SVGRound(x - 1) + ' ',
        SVGRound(y)
      );
      break;
    case 'center':
      // fill from the mid
      s.push('M ' + SVGRound(x - 1) + ' ', SVGRound(0.5 * h));
      break;
    case 'base':
      // fill from variable point
      s.push(
        'M ' + SVGRound(x - 1) + ' ',
        SVGRound((1 - this.options.base) * h)
      );
      break;
    default:
      error('Unsupported mode:', m);
    /* FALL THROUGH */
    case 'line':
      // fill nothing
      s.push('M ' + SVGRound(x) + ' ' + SVGRound(y));
      break;
  }
}
function _end(d, s) {
  var dot = d[d.length - 1];
  var h = this.range_y.options.basis;
  var t = dot.type || this.options.type;
  var m = this.options.mode;
  var x = this.range_x.valueToPixel(dot.x);
  switch (m) {
    case 'bottom':
      // fill the graph below
      s.push(' ' + t + ' ' + SVGRound(x) + ' ' + SVGRound(h + 1) + ' Z');
      break;
    case 'top':
      // fill the upper part of the graph
      s.push(' ' + t + ' ' + SVGRound(x + 1) + ' ' + SVGRound(-1) + ' Z');
      break;
    case 'center':
      // fill from mid
      s.push(' ' + t + ' ' + SVGRound(x + 1) + ' ' + SVGRound(0.5 * h) + ' Z');
      break;
    case 'base':
      // fill from variable point
      s.push(
        ' ' + t + ' ' + SVGRound(x + 1) + ' ' + SVGRound((-m + 1) * h) + ' Z'
      );
      break;
    default:
      error('Unsupported mode:', m);
    /* FALL THROUGH */
    case 'line':
      // fill nothing
      break;
  }
}

export const Graph = defineClass({
  /**
   * Graph is a single SVG path element. It provides
   * some functions to easily draw paths inside Charts and other
   * derivates.
   *
   * @class Graph
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Function|Object} options.range_x - Callback function
   *   returning a {@link Range} module for x axis or an object with options
   *   for a new {@link Range}.
   * @property {Function|Object} options.range_y - Callback function
   *   returning a {@link Range} module for y axis or an object with options
   *   for a new {@link Range}.
   * @property {Array<Object>|String} options.dots=[] - The dots of the path.
   *   Can be a ready-to-use SVG-path-string or an array of objects like
   *   <code>{x: x, y: y [, x1: x1, y1: y1, x2: x2, y2: y2, type: type]}</code> (depending on the type,
   *   see `options.type` for more information). `type` is optional and defines a different type
   *   as explained under `options.type` for a specific dot. If omitted, the
   *   general `options.type` is used.
   * @property {String} [options.type="L"] - Type of the graph (needed values in dots object):
   *   <ul>
   *     <li><code>L</code>: normal (needs x,y)</li>
   *     <li><code>T</code>: smooth quadratic Bézier (needs x, y)</li>
   *     <li><code>H[n]</code>: smooth horizontal, [n] = smoothing factor between 1 (square) and 5 (nearly no smoothing)</li>
   *     <li><code>Q</code>: quadratic Bézier (needs: x1, y1, x, y)</li>
   *     <li><code>C</code>: CurveTo (needs: x1, y1, x2, y2, x, y)</li>
   *     <li><code>S</code>: SmoothCurve (needs: x1, y1, x, y)</li>
   *   </ul>
   * @property {String} [options.mode="line"] - Drawing mode of the graph, possible values are:
   *   <ul>
   *     <li><code>line</code>: line only</li>
   *     <li><code>bottom</code>: fill below the line</li>
   *     <li><code>top</code>: fill above the line</li>
   *     <li><code>center</code>: fill from the vertical center of the canvas</li>
   *     <li><code>base</code>: fill from a percentual position on the canvas (set with base)</li>
   *   </ul>
   * @property {Number} [options.base=0] - If mode is <code>base</code> set the position
   *   of the base line to fill from between 0 (bottom) and 1 (top).
   * @property {String} [options.color=""] - Set the color of the path.
   *   Better use <code>stroke</code> and <code>fill</code> via CSS.
   * @property {String|Boolean} [options.key=false] - Show a description
   *   for this graph in the charts key, <code>false</code> to turn it off.
   *
   * @extends Widget
   *
   * @mixes Ranges
   */
  Extends: Widget,
  Implements: Ranges,
  _options: Object.assign(Object.create(Widget.prototype._options), {
    dots: 'array',
    type: 'string',
    mode: 'string',
    base: 'number',
    color: 'string',
    range_x: 'object',
    range_y: 'object',
    key: 'string|boolean',
  }),
  options: {
    dots: null,
    type: 'L',
    mode: 'line',
    base: 0,
    color: '',
    key: false,
  },

  initialize: function (options) {
    if (!options.element) options.element = makeSVG('path');
    Widget.prototype.initialize.call(this, options);
    /** @member {SVGPath} Graph#element - The SVG path. Has class <code>.aux-graph</code>
     */
    /** @member {Range} Graph#range_x - The range for the x axis.
     */
    /** @member {Range} Graph#range_y - The range for the y axis.
     */
    if (this.options.range_x) this.set('range_x', this.options.range_x);
    if (this.options.range_y) this.set('range_y', this.options.range_y);
    this.set('color', this.options.color);
    this.set('mode', this.options.mode);
  },
  draw: function (O, element) {
    addClass(element, 'aux-graph');

    Widget.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    var I = this.invalid;
    var O = this.options;
    var E = this.element;

    if (I.color) {
      I.color = false;
      E.style.stroke = O.color;
    }

    if (I.mode) {
      removeClass(E, 'aux-filled');
      removeClass(E, 'aux-outline');
      addClass(E, O.mode === 'line' ? 'aux-outline' : 'aux-filled');
    }

    if (I.validate('dots', 'type', 'mode')) {
      const dots = O.dots;
      const type = O.type;
      const RX = this.range_x;
      const RY = this.range_y;
      const w = RX.options.basis;
      const h = RY.options.basis;

      if (typeof dots === 'string') {
        E.setAttribute('d', dots);
      } else if (!dots) {
        E.setAttribute('d', '');
      } else if (Array.isArray(dots)) {
        // if we are drawing a line, _start will do the first point
        let i = O.mode === 'line' ? 1 : 0;
        const s = [];

        if (dots.length > 0) {
          _start.call(this, dots, s);
        }

        if (i === 0 && (dots[i].type || type).startsWith('H')) {
          i++;
          const dot = dots[i];
          const X = getPixels(dot.x, RX);
          const X1 = getPixels(dot.x1, RX);
          const Y = getPixels(dot.y, RY);
          const Y1 = getPixels(dot.y1, RY);

          s.push(' S' + X + ',' + Y + ' ' + X + ',' + Y);
        }

        for (; i < dots.length; i++) {
          const dot = dots[i];
          const _type = dot.type || type;
          const t = _type.substr(0, 1);

          switch (t) {
            case 'L':
            case 'T': {
              const X = getPixels(dot.x, RX);
              const Y = getPixels(dot.y, RY);

              s.push(' ' + t + ' ' + X + ' ' + Y);
              break;
            }
            case 'Q':
            case 'S': {
              const X = getPixels(dot.x, RX);
              const X1 = getPixels(dot.x1, RX);
              const Y = getPixels(dot.y, RY);
              const Y1 = getPixels(dot.y1, RY);

              s.push(' ' + t + ' ' + X1 + ',' + Y1 + ' ' + X + ',' + Y);
              break;
            }
            case 'C': {
              const X = getPixels(dot.x, RX);
              const X1 = getPixels(dot.x1, RX);
              const X2 = getPixels(dot.x2, RX);
              const Y = getPixels(dot.y, RY);
              const Y1 = getPixels(dot.y1, RY);
              const Y2 = getPixels(dot.y2, RY);

              s.push(
                ' ' +
                  t +
                  ' ' +
                  X1 +
                  ',' +
                  Y1 +
                  ' ' +
                  X2 +
                  ',' +
                  Y2 +
                  ' ' +
                  X +
                  ',' +
                  Y
              );
              break;
            }
            case 'H': {
              const f = _type.length > 1 ? parseFloat(type.substr(1)) : 3;
              const X = getPixels(dot.x, RX);
              const Y = getPixels(dot.y, RY);
              const X1 = getPixels(
                dot.x - Math.round(dot.x - dots[i - 1].x) / f,
                RX
              );

              s.push(' S ' + X1 + ',' + Y + ' ' + X + ',' + Y);
              break;
            }
            default:
              error('Unsupported graph type', _type);
          }
        }

        if (dots.length > 0) {
          _end.call(this, dots, s);
        }

        E.setAttribute('d', s.join(''));
      } else {
        error('Unsupported "dots" type', dots);
      }
    }
    Widget.prototype.redraw.call(this);
  },

  /**
   * Moves the graph to the front, i.e. add as last element to the containing
   * SVG group element.
   *
   * @method Graph#toFront
   */
  toFront: function () {
    const E = this.element;
    const P = E.parentElement;
    if (P && E !== P.lastChild)
      this.drawOnce(function () {
        var e = this.element;
        var _p = e.parentNode;
        if (_p && e !== _p.lastChild) _p.appendChild(e);
      });
  },
  /**
   * Moves the graph to the back, i.e. add as first element to the containing
   * SVG group element.
   *
   * @method Graph#toBack
   */
  toBack: function () {
    const E = this.element;
    const P = E.parentElement;
    if (P && E !== P.firstChild)
      this.drawOnce(function () {
        var e = this.element;
        var _p = e.parentNode;
        if (_p && e !== _p.firstChild) _p.insertBefore(e, _p.firstChild);
      });
  },

  // GETTER & SETTER
  set: function (key, value) {
    Widget.prototype.set.call(this, key, value);
    switch (key) {
      case 'range_x':
      case 'range_y':
        this.addRange(value, key);
        value.on('set', rangeChangeCallback.bind(this));
        break;
    }
  },
});

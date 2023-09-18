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

import { defineRange } from '../utils/define_range.js';
import { Widget } from './widget.js';
import { toggleClass, addClass } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { error } from '../utils/log.js';
import { defineRender } from '../renderer.js';

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
  const h = this.range_y.options.basis;
  const m = this.options.mode;
  const x = this.range_x.valueToPixel(d[0].x);
  const y = this.range_y.valueToPixel(d[0].y);

  let fillY;

  switch (m) {
    case 'bottom':
      fillY = h + 1;
      break;
    case 'top':
      fillY = -1;
      break;
    case 'center':
      fillY = h / 2;
      break;
    case 'base':
      fillY = (1 - this.options.base) * h;
      break;
    default:
      error('Unsupported mode:', m);
    /* FALL THROUGH */
    case 'fill':
    /* FALL THROUGH */
    case 'line':
      // fill nothing
      s.push('M ' + SVGRound(x) + ' ' + SVGRound(y));
      return;
  }

  s.push(
    'M ' + SVGRound(x - 1) + ' ' + SVGRound(fillY) + ' ',
    'L ' + SVGRound(x - 1) + ' ' + SVGRound(y) + ' '
  );
}

function _end(d, s) {
  const dot = d[d.length - 1];
  const h = this.range_y.options.basis;
  const m = this.options.mode;

  let fillY;

  switch (m) {
    case 'bottom':
      fillY = h + 1;
      break;
    case 'top':
      fillY = -1;
      break;
    case 'center':
      fillY = h / 2;
      break;
    case 'base':
      fillY = (1 - this.options.base) * h;
      break;
    case 'fill':
      s.push(' Z');
      return;
    default:
      error('Unsupported mode:', m);
    /* FALL THROUGH */
    case 'line':
      return;
  }

  const x = this.range_x.valueToPixel(dot.x);
  const y = this.range_y.valueToPixel(dot.y);

  s.push(
    ' L ' + SVGRound(x + 1) + ' ' + SVGRound(y),
    ' L ' + SVGRound(x + 1) + ' ' + SVGRound(fillY),
    ' Z'
  );
}

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
 *   It may also be a function, in which case it is called with this graph
 *   widget as first and only argument. The return value can be one of the
 *   other possible types.
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
 *     <li><code>base</code>: fill from a arbitray position on the canvas (set with base)</li>
 *     <li><code>fill</code>: close the curve using a Z directive and fill on the canvas</li>
 *   </ul>
 * @property {Number} [options.base=0] - If mode is <code>base</code> set the position
 *   of the base line to fill from between 0 (bottom) and 1 (top).
 * @property {String} [options.color=""] - Set the color of the path.
 *   Better use <code>stroke</code> and <code>fill</code> via CSS.
 * @property {String|Boolean} [options.key=false] - Show a description
 *   for this graph in the charts key, <code>false</code> to turn it off.
 *
 * @extends Widget
 */
export class Graph extends Widget {
  static get _options() {
    return {
      dots: 'array',
      type: 'string',
      mode: 'string',
      base: 'number',
      color: 'string',
      range_x: 'object',
      range_y: 'object',
      key: 'string|boolean',
    };
  }

  static get options() {
    return {
      dots: null,
      type: 'L',
      mode: 'line',
      base: 0,
      color: '',
      key: false,
    };
  }

  static get renderers() {
    return [
      defineRender('color', function (color) {
        this.element.style.stroke = color;
      }),
      defineRender('mode', function (mode) {
        const element = this.element;
        const filled = mode !== 'line';
        toggleClass(element, 'aux-filled', filled);
        toggleClass(element, 'aux-outline', !filled);
      }),
      defineRender(['dots', 'type', 'mode', 'range_x', 'range_y'], function (
        dots,
        type,
        mode,
        range_x,
        range_y
      ) {
        let path;

        if (typeof dots === 'function') {
          dots = dots(this);
        }

        if (typeof dots === 'string') {
          path = dots;
        } else if (!dots) {
          path = '';
        } else if (Array.isArray(dots)) {
          // if we are drawing a line, _start will do the first point
          let i = mode === 'line' ? 1 : 0;
          const s = [];

          if (dots.length > 0) {
            _start.call(this, dots, s);
          }

          if (i === 0 && (dots[i].type || type).startsWith('H')) {
            i++;
            const dot = dots[i];
            const X = getPixels(dot.x, range_x);
            const Y = getPixels(dot.y, range_y);

            s.push(' S' + X + ',' + Y + ' ' + X + ',' + Y);
          }

          for (; i < dots.length; i++) {
            const dot = dots[i];
            const _type = dot.type || type;
            const t = _type.substring(0, 1);

            switch (t) {
              case 'L':
              case 'T': {
                const X = getPixels(dot.x, range_x);
                const Y = getPixels(dot.y, range_y);

                s.push(' ' + t + ' ' + X + ' ' + Y);
                break;
              }
              case 'Q':
              case 'S': {
                const X = getPixels(dot.x, range_x);
                const X1 = getPixels(dot.x1, range_x);
                const Y = getPixels(dot.y, range_y);
                const Y1 = getPixels(dot.y1, range_y);

                s.push(' ' + t + ' ' + X1 + ',' + Y1 + ' ' + X + ',' + Y);
                break;
              }
              case 'C': {
                const X = getPixels(dot.x, range_x);
                const X1 = getPixels(dot.x1, range_x);
                const X2 = getPixels(dot.x2, range_x);
                const Y = getPixels(dot.y, range_y);
                const Y1 = getPixels(dot.y1, range_y);
                const Y2 = getPixels(dot.y2, range_y);

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
                const f = _type.length > 1 ? parseFloat(type.substring(1)) : 3;
                const X = getPixels(dot.x, range_x);
                const Y = getPixels(dot.y, range_y);
                const X1 = getPixels(
                  dot.x - Math.round(dot.x - dots[i - 1].x) / f,
                  range_x
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

          path = s.join('');
        } else {
          error('Unsupported "dots" type', dots);
          path = '';
        }

        this.element.setAttribute('d', path);
      }),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = makeSVG('path');
    super.initialize(options);
    /** @member {SVGPath} Graph#element - The SVG path. Has class <code>.aux-graph</code>
     */
    /** @member {Range} Graph#range_x - The range for the x axis.
     */
    /** @member {Range} Graph#range_y - The range for the y axis.
     */
    defineRange(this, this.options.range_x, 'range_x');
    defineRange(this, this.options.range_y, 'range_y');

    this.set('color', this.options.color);
    this.set('mode', this.options.mode);
  }

  draw(O, element) {
    addClass(element, 'aux-graph');

    super.draw(O, element);
  }

  /**
   * Moves the graph to the front, i.e. add as last element to the containing
   * SVG group element.
   *
   * @method Graph#toFront
   */
  toFront() {
    const E = this.element;
    const P = E.parentElement;
    if (P && E !== P.lastChild)
      this.drawOnce(function () {
        const e = this.element;
        const _p = e.parentNode;
        if (_p && e !== _p.lastChild) _p.appendChild(e);
      });
  }

  /**
   * Moves the graph to the back, i.e. add as first element to the containing
   * SVG group element.
   *
   * @method Graph#toBack
   */
  toBack() {
    const E = this.element;
    const P = E.parentElement;
    if (P && E !== P.firstChild)
      this.drawOnce(function () {
        const e = this.element;
        const _p = e.parentNode;
        if (_p && e !== _p.firstChild) _p.insertBefore(e, _p.firstChild);
      });
  }
}

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

import { defineRange } from '../utils/define_range.js';
import { addClass, getStyle, empty } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { Widget, Resize } from './widget.js';
import { defineRender, combineDefer, deferRender, deferMeasure } from '../renderer.js';

function getPadding(element) {
  const tmp = getStyle(element, 'padding').split(' ');

  switch (tmp.length) {
  case 1: tmp[1] = tmp[0];
  case 2: tmp[2] = tmp[0];
  case 3: tmp[3] = tmp[1];
  }

  return tmp.map((entry) => parseInt(entry) || 0);
}

function drawLines(a, mode, last) {
  const { range_x, range_y, x_min, x_max, y_min, y_max } = this.options;
  const xBasis = range_x.options.basis;
  const yBasis = range_y.options.basis;

  if (!xBasis || !yBasis)
    return;

  const labels = a.map((obj) => {
    if (typeof obj === 'number')
      return null;

    const label = obj.label;

    if (typeof label !== 'string')
      return null;

    const labelNode = makeSVG('text');
    labelNode.textContent = label;
    labelNode.style['dominant-baseline'] = 'central';
    addClass(labelNode, 'aux-gridlabel');
    addClass(labelNode, mode ? 'aux-horizontal' : 'aux-vertical');

    const cl = obj.class;
    if (cl) addClass(labelNode, cl);

    this.element.appendChild(labelNode);
    return labelNode;
  });

  return deferMeasure(() => {
    const coords = a.map((obj, i) => {
        const label = labels[i];
        if (!label) return;
        let bb;
        try {
          bb = label.getBBox();
        } catch (e) {
          // if we are hidden, this may throw
          // we should force redraw at some later point, but
          // its hard to do. the grid should really be deactivated
          // by an option.
          return;
        }
        const { width, height } = bb;
        const [ pt, pr, pb, pl ] = getPadding(label);
        let x, y, m;
        let coordinates;
        if (mode) {
          y = Math.max(
            height / 2,
            Math.min(yBasis - height / 2 - pt, range_y.valueToPixel(obj.pos))
          );
          if (y > last) return;
          x = xBasis - width - pl;
          if (!i)
          last = y - height;
          m = width + pl + pr;
        } else {
          x = Math.max(
            pl,
            Math.min(xBasis - width - pl, range_x.valueToPixel(obj.pos) - width / 2)
          );
          if (x < last) return;
          y = yBasis - height / 2 - pt;
          last = x + width;
          m = height + pt + pb;
        }

        return {
          x,
          y,
          m,
          x_min: obj.x_min,
          x_max: obj.x_max,
        };
      });

    return deferRender(() => {
        Array.from(
          this.element.querySelectorAll(
            '.aux-gridline.aux-' + (mode ? 'horizontal' : 'vertical')
          )).forEach(element => element.remove());

        labels.forEach((label, i) => {
          if (!label) return;
          const position = coords[i];

          if (position) {
            label.setAttribute('x', position.x);
            label.setAttribute('y', position.y);
          } else {
            label.remove();
          }

        });

        for (let j = 0; j < a.length; j++) {
          const obj = a[j];
          const label = coords[j];
          let m, x, y;
          if (label) m = label.m;
          else m = 0;

          if (
            (mode && obj.pos === range_y.options.min) ||
            (mode && obj.pos === range_y.options.max) ||
            (!mode && obj.pos === range_x.options.min) ||
            (!mode && obj.pos === range_x.options.max)
          )
            continue;
          const line = makeSVG('path');
          addClass(line, 'aux-gridline');
          addClass(line, mode ? 'aux-horizontal' : 'aux-vertical');
          if (obj['class']) addClass(line, obj['class']);
          if (obj.color) line.setAttribute('style', 'stroke:' + obj.color);
          if (mode) {
            let xMin, xMax;
            // line from left to right
            if (typeof obj.x_min === 'number')
              xMin = Math.max(0, range_x.valueToPixel(obj.x_min));
            else if (x_min !== false)
              xMin = Math.max(0, range_x.valueToPixel(x_min));
            else xMin = 0;
            if (typeof obj.x_max === 'number')
              xMax = Math.min(
                xBasis - m,
                range_x.valueToPixel(obj.x_max)
              );
            else if (x_max !== false)
              xMax = Math.min(
                xBasis - m,
                range_x.valueToPixel(x_max)
              );
            else xMax = xBasis - m;
            y = Math.round(range_y.valueToPixel(obj.pos));
            line.setAttribute(
              'd',
              'M' + xMin + ' ' + y + '.5 L' + xMax + ' ' + y + '.5'
            );
          } else {
            let yMin, yMax;
            // line from top to bottom
            if (typeof obj.y_min === 'number')
              yMin = Math.max(0, range_y.valueToPixel(obj.y_min));
            else if (y_min !== false)
              yMin = Math.max(0, range_y.valueToPixel(y_min));
            else yMin = 0;
            if (typeof obj.y_max === 'number')
              yMax = Math.min(
                yBasis - m,
                range_y.valueToPixel(obj.y_max)
              );
            else if (y_max !== false)
              yMax = Math.min(
                yBasis - m,
                range_y.valueToPixel(y_max)
              );
            else yMax = yBasis - m;
            x = Math.round(range_x.valueToPixel(obj.pos));
            line.setAttribute(
              'd',
              'M' + x + '.5 ' + yMin + ' L' + x + '.5 ' + yMax
            );
          }
          this.element.appendChild(line);
        }
      });
    });
}
/**
 * Grid creates a couple of lines and labels in a SVG
 * image on the x and y axis. It is used in e.g. {@link Graph} and
 * {@link FrequencyResponse} to draw markers and values. Grid needs a
 * parent SVG image do draw into. The base element of a Grid is a
 * SVG group containing all the labels and lines.
 *
 * @class Grid
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Array<Object|Number>} [options.grid_x=[]] - Array for vertical grid lines
 *   containing either numbers or objects with the members:
 * @property {Number} [options.grid_x.pos] - The value where to draw grid line and correspon ding label.
 * @property {String} [options.grid_x.color] - A valid CSS color string to colorize the elements.
 * @property {String} [options.grid_x.class] - A class name for the elements.
 * @property {String} [options.grid_x.label] - A label string.
 * @property {String} [options.grid_x.y_min] - Start this line at this values position instead of 0.
 * @property {String} [options.grid_x.y_max] - End this line at this values position instead of maximum height.
 * @property {Array<Object|Number>} [options.grid_y=[]] - Array for horizontal grid lines
 *   containing either positions or objects with the members:
 * @property {Number} [options.grid_y.pos] - The value where to draw grid line and corresponding label.
 * @property {String} [options.grid_y.color] - A valid CSS color string to colorize the elements.
 * @property {String} [options.grid_y.class] - A class name for the elements.
 * @property {String} [options.grid_y.label] - A label string.
 * @property {String} [options.grid_y.x_min] - Start this line at this values position instead of 0.
 * @property {String} [options.grid_y.x_max] - End this line at this values position instead of maximum width.
 * @property {Function|Object} [options.range_x={}] - A function returning
 *   a {@link Range} instance for vertical grid lines or an object
 *   containing options. for a new {@link Range}.
 * @property {Function|Object} [options.range_y={}] - A function returning
 *   a {@link Range} instance for horizontal grid lines or an object
 *   containing options. for a new {@link Range}.
 * @property {Number} [options.width=0] - Width of the grid.
 * @property {Number} [options.height=0] - Height of the grid.
 * @property {Number} [options.x_min=false] - Value to start horizontal
 *   lines at this position instead of 0.
 * @property {Number} [options.x_max=false] - Value to end horizontal
 *   lines at this position instead of maximum width.
 * @property {Number} [options.y_min=false] - Value to start vertical
 *   lines at this position instead of 0.
 * @property {Number} [options.y_max=false] - Value to end vertical
 *   lines at this position instead of maximum height.
 *
 *
 * @extends Widget
 */
export class Grid extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), {
      grid_x: 'array',
      grid_y: 'array',
      range_x: 'object',
      range_y: 'object',
      width: 'number',
      height: 'number',
      x_min: 'boolean|number',
      x_max: 'boolean|number',
      y_min: 'boolean|number',
      y_max: 'boolean|number',
    });
  }

  static get options() {
    return {
      grid_x: [],
      grid_y: [],
      range_x: {},
      range_y: {},
      width: 0,
      height: 0,
      x_min: false,
      x_max: false,
      y_min: false,
      y_max: false,
    };
  }

  static get renderers() {
    return [
      defineRender(
        [ 'range_x', 'range_y', 'grid_x', 'grid_y', 'x_min', 'x_max', 'y_min', 'y_max', Resize ],
        function (range_x, range_y, grid_x, grid_y, x_min, x_max, y_min, y_max) {
          empty(this.element);

          return combineDefer(
            drawLines.call(this, grid_x, false, 0),
            drawLines.call(this, grid_y, true, this.range_y.options.basis)
          );
        }),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = makeSVG('g');
    super.initialize(options);
    /**
     * @member {SVGGroup} Grid#element - The main SVG group containing all grid elements. Has class <code>.aux-grid</code>.
     */
    /**
     * @member {Range} Grid#range_x - The range for the x axis.
     */
    /**
     * @member {Range} Grid#range_y - The range for the y axis.
     */
    defineRange(this, this.options.range_x, 'range_x');
    defineRange(this, this.options.range_y, 'range_y');
    if (this.options.width) this.set('width', this.options.width);
    if (this.options.height) this.set('height', this.options.width);
  }

  draw(O, element) {
    addClass(element, 'aux-grid');

    super.draw(O, element);
  }

  // GETTER & SETTER
  set(key, value) {
    this.options[key] = value;
    switch (key) {
      case 'width':
        this.range_x.set('basis', value);
        break;
      case 'height':
        this.range_y.set('basis', value);
        break;
    }
    super.set(key, value);
  }
}

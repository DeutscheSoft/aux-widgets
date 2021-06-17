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

import { S } from '../dom_scheduler.js';
import { defineClass } from '../widget_helpers.js';
import { defineRange } from '../utils/define_range.js';
import { addClass, getStyle, empty } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { Widget } from './widget.js';

function drawLines(a, mode, last) {
  const labels = new Array(a.length);
  const coords = new Array(a.length);

  for (let i = 0; i < a.length; i++) {
    let obj = a[i];
    if (typeof obj === 'number') obj = { pos: obj };
    if (obj.label) {
      const label = makeSVG('text');
      label.textContent = obj.label;
      label.style['dominant-baseline'] = 'central';
      addClass(label, 'aux-gridlabel');
      addClass(label, mode ? 'aux-horizontal' : 'aux-vertical');
      if (obj['class']) addClass(label, obj['class']);

      this.element.appendChild(label);
      labels[i] = label;
    }
  }

  const w = this.range_x.options.basis;
  const h = this.range_y.options.basis;

  S.add(
    function () {
      /* FORCE_RELAYOUT */

      for (let i = 0; i < a.length; i++) {
        const obj = a[i];
        const label = labels[i];
        if (!label) continue;
        let bb;
        try {
          bb = label.getBBox();
        } catch (e) {
          // if we are hidden, this may throw
          // we should force redraw at some later point, but
          // its hard to do. the grid should really be deactivated
          // by an option.
          continue;
        }
        const tw = bb.width;
        const th = bb.height;
        const p = getStyle(label, 'padding').split(' ');
        if (p.length < 2) p[1] = p[2] = p[3] = p[0];
        if (p.length < 3) {
          p[2] = p[0];
          p[3] = p[1];
        }
        if (p.length < 4) p[3] = p[1];
        const pt = parseInt(p[0]) || 0;
        const pr = parseInt(p[1]) || 0;
        const pb = parseInt(p[2]) || 0;
        const pl = parseInt(p[3]) || 0;
        let x, y;
        if (mode) {
          y = Math.max(
            th / 2,
            Math.min(h - th / 2 - pt, this.range_y.valueToPixel(obj.pos))
          );
          if (y > last) continue;
          x = w - tw - pl;
          coords[i] = {
            x: x,
            y: y,
            m: tw + pl + pr,
            x_min: a[i].x_min,
            x_max: a[i].x_max,
          };
          last = y - th;
        } else {
          x = Math.max(
            pl,
            Math.min(w - tw - pl, this.range_x.valueToPixel(obj.pos) - tw / 2)
          );
          if (x < last) continue;
          y = h - th / 2 - pt;
          coords[i] = {
            x: x,
            y: y,
            m: th + pt + pb,
            y_min: a[i].y_min,
            y_max: a[i].y_max,
          };
          last = x + tw;
        }
      }

      S.add(
        function () {
          const O = this.options;
          const elements = this.element.querySelectorAll(
            '.aux-gridline.aux-' + (mode ? 'horizontal' : 'vertical')
          );
          for (let j = 0; j < elements.length; j++) {
            elements[j].parentElement.removeChild(elements[j]);
          }
          for (let j = 0; j < a.length; j++) {
            const label = labels[j];
            if (label) {
              const obj = coords[j];
              if (obj) {
                label.setAttribute('x', obj.x);
                label.setAttribute('y', obj.y);
              } else {
                if (label.parentElement == this.element)
                  this.element.removeChild(label);
              }
            }
          }

          for (let j = 0; j < a.length; j++) {
            const obj = a[j];
            const label = coords[j];
            let m, x_min, x_max, y_min, y_max, x, y;
            if (label) m = label.m;
            else m = 0;

            if (
              (mode && obj.pos === this.range_y.options.min) ||
              (mode && obj.pos === this.range_y.options.max) ||
              (!mode && obj.pos === this.range_x.options.min) ||
              (!mode && obj.pos === this.range_x.options.max)
            )
              continue;
            const line = makeSVG('path');
            addClass(line, 'aux-gridline');
            addClass(line, mode ? 'aux-horizontal' : 'aux-vertical');
            if (obj['class']) addClass(line, obj['class']);
            if (obj.color) line.setAttribute('style', 'stroke:' + obj.color);
            if (mode) {
              // line from left to right
              if (typeof obj.x_min === 'number')
                x_min = Math.max(0, this.range_x.valueToPixel(obj.x_min));
              else if (O.x_min !== false)
                x_min = Math.max(0, this.range_x.valueToPixel(O.x_min));
              else x_min = 0;
              if (typeof obj.x_max === 'number')
                x_max = Math.min(
                  this.range_x.options.basis - m,
                  this.range_x.valueToPixel(obj.x_max)
                );
              else if (O.x_max !== false)
                x_max = Math.min(
                  this.range_x.options.basis - m,
                  this.range_x.valueToPixel(O.x_max)
                );
              else x_max = this.range_x.options.basis - m;
              y = Math.round(this.range_y.valueToPixel(obj.pos));
              line.setAttribute(
                'd',
                'M' + x_min + ' ' + y + '.5 L' + x_max + ' ' + y + '.5'
              );
            } else {
              // line from top to bottom
              if (typeof obj.y_min === 'number')
                y_min = Math.max(0, this.range_y.valueToPixel(obj.y_min));
              else if (O.y_min !== false)
                y_min = Math.max(0, this.range_y.valueToPixel(O.y_min));
              else y_min = 0;
              if (typeof obj.y_max === 'number')
                y_max = Math.min(
                  this.range_y.options.basis - m,
                  this.range_y.valueToPixel(obj.y_max)
                );
              else if (O.y_max !== false)
                y_max = Math.min(
                  this.range_y.options.basis - m,
                  this.range_y.valueToPixel(O.y_max)
                );
              else y_max = this.range_y.options.basis - m;
              x = Math.round(this.range_x.valueToPixel(obj.pos));
              line.setAttribute(
                'd',
                'M' + x + '.5 ' + y_min + ' L' + x + '.5 ' + y_max
              );
            }
            this.element.appendChild(line);
          }
        }.bind(this),
        1
      );
    }.bind(this)
  );
}
export const Grid = defineClass({
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
  Extends: Widget,
  _options: Object.assign({}, Widget.prototype._options, {
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
  }),
  options: {
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
  },
  initialize: function (options) {
    if (!options.element) options.element = makeSVG('g');
    Widget.prototype.initialize.call(this, options);
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
  },
  draw: function (O, element) {
    addClass(element, 'aux-grid');

    Widget.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    const I = this.invalid,
      O = this.options;
    if (I.validate('grid_x', 'grid_y', 'range_x', 'range_y')) {
      empty(this.element);

      drawLines.call(this, O.grid_x, false, 0);
      drawLines.call(this, O.grid_y, true, this.range_y.options.basis);
    }
    Widget.prototype.redraw.call(this);
  },
  // GETTER & SETTER
  set: function (key, value) {
    this.options[key] = value;
    switch (key) {
      case 'width':
        this.range_x.set('basis', value);
        break;
      case 'height':
        this.range_y.set('basis', value);
        break;
    }
    Widget.prototype.set.call(this, key, value);
  },
});

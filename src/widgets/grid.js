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
import { Widget, SymResize } from './widget.js';
import { defineRender, deferRender, deferMeasure } from '../renderer.js';

function getPadding(element) {
  const tmp = getStyle(element, 'padding').split(' ');

  /*eslint no-fallthrough: "error"*/
  switch (tmp.length) {
    case 1:
      tmp[1] = tmp[0];
    // falls through
    case 2:
      tmp[2] = tmp[0];
    // falls through
    case 3:
      tmp[3] = tmp[1];
  }

  return tmp.map((entry) => parseInt(entry) || 0);
}

function createLabels(grid, element, horizontal) {
  return grid.map((obj) => {
    if (typeof obj === 'number') return null;

    const label = obj.label;

    if (typeof label !== 'string') return null;

    const labelNode = makeSVG('text');
    labelNode.textContent = label;
    labelNode.style['dominant-baseline'] = 'central';
    addClass(labelNode, 'aux-gridlabel');
    addClass(labelNode, horizontal ? 'aux-horizontal' : 'aux-vertical');

    const cl = obj.class;
    if (cl) addClass(labelNode, cl);

    element.appendChild(labelNode);
    return labelNode;
  });
}

function positionLabels(labels, coords) {
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
}

function measureCoords(
  grid,
  labels,
  last,
  basis_x,
  basis_y,
  range,
  horizontal
) {
  return grid.map((obj, i) => {
    const label = labels[i];
    if (!label) return;

    let bb;
    try {
      bb = label.getBBox();
    } catch (e) {
      // if we are hidden, this may throw. we should force redraw at some later point, but its hard to do. the grid should really be deactivated by an option.
      return;
    }

    const { width, height } = bb;
    const [pt, pr, pb, pl] = getPadding(label);
    let x, y, m;

    if (horizontal) {
      y = Math.max(
        height / 2,
        Math.min(basis_y - height / 2 - pt, range.valueToPixel(obj.pos))
      );
      if (y > last) return;
      x = basis_x - width - (width ? pl : 0);
      if (!i) last = y - height;
      m = width + (width ? pl + pr : 0);
    } else {
      x = Math.max(
        pl,
        Math.min(basis_x - width - pl, range.valueToPixel(obj.pos) - width / 2)
      );
      if (x < last) return;
      y = basis_y - height / 2 - (height ? pt : 0);
      last = x + width;
      m = height + (height ? pt + pb : 0);
    }

    return {
      x,
      y,
      m,
      x_min: obj.x_min,
      x_max: obj.x_max,
    };
  });
}

function drawLines(
  grid,
  coords,
  last,
  range,
  opprange,
  basis,
  oppbasis,
  min,
  max,
  path,
  element,
  cls,
  dir
) {
  for (let j = 0; j < grid.length; j++) {
    const obj = grid[j];
    const label = coords[j];
    let margin;

    if (label) margin = label.m;
    else margin = 0;

    if (obj.pos === opprange.options.min || obj.pos === opprange.options.max)
      continue;

    let line = makeSVG('path');
    addClass(line, 'aux-gridline');
    addClass(line, cls);
    if (obj['class']) addClass(line, obj['class']);
    if (obj.color) line.setAttribute('style', 'stroke:' + obj.color);

    const _min = obj[dir + '_min'];
    const _max = obj[dir + '_max'];

    const pos = Math.round(opprange.valueToPixel(obj.pos));

    if (pos >= oppbasis - last) {
      line = null;
    } else {
      let start, end;
      if (typeof _min === 'number')
        start = Math.max(0, range.valueToPixel(_min));
      else if (min !== false) start = Math.max(0, range.valueToPixel(min));
      else start = 0;
      if (typeof _max === 'number')
        end = Math.min(basis - margin, range.valueToPixel(_max));
      else if (max !== false)
        end = Math.min(basis - margin, range.valueToPixel(max));
      else end = basis - margin;
      line.setAttribute('d', path(pos, start, end));
    }

    if (line) element.appendChild(line);
  }
}

function drawGrid() {
  const {
    grid_x,
    grid_y,
    range_x,
    range_y,
    x_min,
    x_max,
    y_min,
    y_max,
  } = this.options;

  const basis_x = range_x.options.basis;
  const basis_y = range_y.options.basis;

  if (!basis_x || !basis_y) return;

  empty(this.element);

  const labels_x = createLabels(grid_x, this.element, false);
  const labels_y = createLabels(grid_y, this.element, true);

  return deferMeasure(() => {
    const coords_x = measureCoords(
      grid_x,
      labels_x,
      0,
      basis_x,
      basis_y,
      range_x,
      false
    );
    const coords_y = measureCoords(
      grid_y,
      labels_y,
      basis_y,
      basis_x,
      basis_y,
      range_y,
      true
    );

    return deferRender(() => {
      positionLabels(labels_x, coords_x);
      positionLabels(labels_y, coords_y);

      const margins_x = coords_x.map((v) => (v ? v.m : 0));
      const margins_y = coords_y.map((v) => (v ? v.m : 0));

      const last_x = Math.max(...margins_y);
      const last_y = Math.max(...margins_x);

      drawLines(
        grid_x,
        coords_x,
        last_x,
        range_y,
        range_x,
        basis_y,
        basis_x,
        y_min,
        y_max,
        (pos, min, max) => 'M' + pos + '.5 ' + min + ' L' + pos + '.5 ' + max,
        this.element,
        'aux-vertical',
        'y'
      );
      drawLines(
        grid_y,
        coords_y,
        last_y,
        range_x,
        range_y,
        basis_x,
        basis_y,
        x_min,
        x_max,
        (pos, min, max) =>
          'M' + min + ' ' + pos + '.5 L' + max + ' ' + pos + '.5',
        this.element,
        'aux-horizontal',
        'x'
      );
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
        [
          'range_x',
          'range_y',
          'grid_x',
          'grid_y',
          'x_min',
          'x_max',
          'y_min',
          'y_max',
          SymResize,
        ],
        function (
          range_x,
          range_y,
          grid_x,
          grid_y,
          x_min,
          x_max,
          y_min,
          y_max
        ) {
          return drawGrid.call(this);
        }
      ),
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

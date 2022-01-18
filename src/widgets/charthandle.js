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

/* jshint -W086 */

import { Widget } from './widget.js';
import { setGlobalCursor, unsetGlobalCursor } from '../utils/global_cursor.js';
import { warning } from '../utils/warning.js';
import { FORMAT } from '../utils/sprintf.js';
import { warn } from '../utils/log.js';
import { addEventListener, removeEventListener } from '../utils/events.js';
import { setText, removeClass, addClass, toggleClass } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { Range } from '../modules/range.js';
import { Timer } from '../utils/timers.js';
import { defineRange } from '../utils/define_range.js';
import { defineRender, defineRecalculation, defineMeasure, deferRender, deferMeasure } from '../renderer.js';

import { DragCapture } from '../modules/dragcapture.js';

const MODES = [
  'circular',
  'line-horizontal',
  'line-vertical',
  'block-top',
  'block-bottom',
  'block-left',
  'block-right',
  'block',
];
function normalize(v) {
  const n = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  v[0] /= n;
  v[1] /= n;
}

/* The following functions turn positioning options
 * into somethine we can calculate with */

function ROT(a) {
  return [+Math.sin(+a), +Math.cos(+a)];
}

const ZHANDLE_POSITION_circular = {
  top: ROT(Math.PI),
  center: [1e-10, 1e-10],
  'top-right': ROT((Math.PI * 3) / 4),
  right: ROT(Math.PI / 2),
  'bottom-right': ROT(Math.PI / 4),
  bottom: ROT(0),
  'bottom-left': ROT((Math.PI * 7) / 4),
  left: ROT((Math.PI * 3) / 2),
  'top-left': ROT((Math.PI * 5) / 4),
};

function getZHandlePositionMovable(O, X) {
  const vec = ZHANDLE_POSITION_circular[O.z_handle];
  const x = (X[0] + X[2]) / 2;
  const y = (X[1] + X[3]) / 2;
  const R = (X[2] - X[0] - O.z_handle_size) / 2;

  return [x + R * vec[0], y + R * vec[1]];
}

const Z_HANDLE_SIZE_corner = [1, 1, 0, 0];
const Z_HANDLE_SIZE_horiz = [1, 0, 0, 1];
const Z_HANDLE_SIZE_vert = [0, 1, 1, 0];

function Z_HANDLE_SIZE(pos) {
  switch (pos) {
    default:
      warn('Unsupported z_handle position:', pos);
      break;
    case 'top-right':
    case 'bottom-right':
    case 'bottom-left':
    case 'top-left':
    case 'center':
      return Z_HANDLE_SIZE_corner;
    case 'top':
    case 'bottom':
      return Z_HANDLE_SIZE_vert;
    case 'left':
    case 'right':
      return Z_HANDLE_SIZE_horiz;
  }
}

function getZHandleSize(O, X) {
  const vec = Z_HANDLE_SIZE(O.z_handle);
  const z_handle_size = O.z_handle_size;
  const z_handle_centered = O.z_handle_centered;
  let width = X[2] - X[0];
  let height = X[3] - X[1];

  if (z_handle_centered < 1) {
    width *= z_handle_centered;
    height *= z_handle_centered;
  } else {
    width = z_handle_centered;
    height = z_handle_centered;
  }

  width = vec[0] * z_handle_size + vec[2] * width;
  height = vec[1] * z_handle_size + vec[3] * height;

  if (width < z_handle_size) width = z_handle_size;
  if (height < z_handle_size) height = z_handle_size;

  return [width, height];
}

const Z_HANDLE_POS = {
  top: [0, -1],
  'top-right': [1, -1],
  right: [1, 0],
  'bottom-right': [1, 1],
  bottom: [0, 1],
  'bottom-left': [-1, 1],
  left: [-1, 0],
  'top-left': [-1, -1],
  center: [0, 0],
};

function getZHandlePosition(O, X, zhandle_size) {
  let x = +(+X[0] + X[2] - +zhandle_size[0]) / 2;
  let y = +(+X[1] + X[3] - +zhandle_size[1]) / 2;
  const width = +X[2] - +X[0];
  const height = +X[3] - +X[1];
  const vec = Z_HANDLE_POS[O.z_handle] || Z_HANDLE_POS['top-right'];

  x += (+vec[0] * +(width - +zhandle_size[0])) / 2;
  y += (+vec[1] * +(height - +zhandle_size[1])) / 2;

  return [x, y];
}

function modeToHandle(mode) {
  if (
    mode === 'block-left' ||
    mode === 'block-right' ||
    mode === 'block-top' ||
    mode === 'block-bottom'
  )
    return 'block';
  return mode;
}

const LABEL_ALIGN = {
  'line-vertical': {
    top: 'middle',
    bottom: 'middle',
    left: 'end',
    'top-left': 'end',
    'bottom-left': 'end',
    right: 'start',
    'top-right': 'start',
    'bottom-right': 'start',
    center: 'middle',
  },
  'line-horizontal': {
    top: 'middle',
    bottom: 'middle',
    left: 'start',
    'top-left': 'start',
    'bottom-left': 'start',
    right: 'end',
    'top-right': 'end',
    'bottom-right': 'end',
    center: 'middle',
  },
  circular: {
    top: 'middle',
    bottom: 'middle',
    left: 'end',
    'top-left': 'start',
    'bottom-left': 'start',
    right: 'start',
    'top-right': 'end',
    'bottom-right': 'end',
    center: 'middle',
  },
  block: {
    top: 'middle',
    bottom: 'middle',
    left: 'start',
    'top-left': 'start',
    'bottom-left': 'start',
    right: 'end',
    'top-right': 'end',
    'bottom-right': 'end',
    center: 'middle',
  },
};

function getLabelAlign(mode, pos) {
  return LABEL_ALIGN[modeToHandle(mode)][pos];
}

/* The following arrays contain multipliers, alternating x and y, starting with x.
 * The first pair is a multiplier for the handle width and height
 * The second pair is a multiplier for the label size
 * The third pair is a multiplier for the margin
 */

const LABEL_POSITION = {
  'line-vertical': {
    top: [0, -1, 0, 0, 0, 1],
    right: [1, 0, 0, -1 / 2, 1, 0],
    left: [-1, 0, 0, -1 / 2, -1, 0],
    bottom: [0, 1, 0, -1, 0, -1],
    'bottom-left': [-1, 1, 0, -1, -1, -1],
    'bottom-right': [1, 1, 0, -1, 1, -1],
    'top-right': [1, -1, 0, 0, 0, 1],
    'top-left': [-1, -1, 0, 0, -1, 1],
    center: [0, 0, 0, -1 / 2, 0, 0],
  },
  'line-horizontal': {
    top: [0, -1, 0, -1, 0, -1],
    right: [1, 0, 0, -1 / 2, 1, 0],
    left: [-1, 0, 0, -1 / 2, -1, 0],
    bottom: [0, 1, 0, 0, 0, 1],
    'bottom-left': [-1, 1, 0, 0, 1, 1],
    'bottom-right': [1, 1, 0, 0, -1, 1],
    'top-right': [1, -1, 0, -1, -1, -1],
    'top-left': [-1, -1, 0, -1, 1, -1],
    center: [0, 0, 0, -1 / 2, 0, 0],
  },
  circular: {
    top: [0, -1, 0, -1, 0, -1],
    right: [1, 0, 0, -1 / 2, 1, 0],
    left: [-1, 0, 0, -1 / 2, -1, 0],
    bottom: [0, 1, 0, 0, 0, 1],
    'bottom-left': [-1, 1, 0, 0, 0, 1],
    'bottom-right': [1, 1, 0, 0, 0, 1],
    'top-right': [1, -1, 0, -1, 0, -1],
    'top-left': [-1, -1, 0, -1, 0, -1],
    center: [0, 0, 0, -1 / 2, 0, 0],
  },
  block: {
    top: [0, -1, 0, 0, 0, 1],
    bottom: [0, 1, 0, -1, 0, -1],
    right: [1, 0, 0, -1 / 2, -1, 0],
    left: [-1, 0, 0, -1 / 2, 1, 0],
    'bottom-left': [-1, 1, 0, -1, 1, -1],
    'bottom-right': [1, 1, 0, -1, -1, -1],
    'top-right': [1, -1, 0, 0, -1, 1],
    'top-left': [-1, -1, 0, 0, 1, 1],
    center: [0, 0, 0, -1 / 2, 0, 0],
  },
};

function getLabelPosition(mode, margin, X, pos, label_size) {
  /* X: array containing [X0, Y0, X1, Y1] of the handle
   * pos: string describing the position of the label ("top", "bottom-right", ...)
   * label_size: array containing width and height of the label
   */

  // Pivot (x, y) is the center of the handle.
  let x = (X[0] + X[2]) / 2;
  let y = (X[1] + X[3]) / 2;

  // Size of handle
  const width = +X[2] - +X[0];
  const height = +X[3] - +X[1];

  // multipliers
  const vec = LABEL_POSITION[modeToHandle(mode)][pos];

  x += (vec[0] * width) / 2 + vec[2] * label_size[0] + vec[4] * margin;
  y += (vec[1] * height) / 2 + vec[3] * label_size[1] + vec[5] * margin;

  // result is [x, y] of the "real" label position. Please note that
  // the final x position depends on the LABEL_ALIGN value for pos.
  // Y value is the top border of the overall label.
  return [x, y];
}

function removeZHandle() {
  const E = this._zhandle;
  if (!E) return;
  this._zhandle = null;
  if (this.z_drag.get('node') === E) this.z_drag.set('node', null);

  E.remove();
}

function createZHandle() {
  const O = this.options;

  if (this._zhandle) removeZHandle.call(this);

  const E = makeSVG(O.mode === 'circular' ? 'circle' : 'rect', {
    class: 'aux-zhandle',
  });

  this._zhandle = E;
  if (this.z_drag.get('node') !== document) this.z_drag.set('node', E);
}

function createLine1() {
  if (this._line1) removeLine1.call(this);
  this._line1 = makeSVG('path', {
    class: 'aux-line aux-line1',
  });
}
function createLine2() {
  if (this._line2) removeLine2.call(this);
  this._line2 = makeSVG('path', {
    class: 'aux-line aux-line2',
  });
}
function removeLine1() {
  if (!this._line1) return;
  this._line1.remove();
  this._line1 = null;
}
function removeLine2() {
  if (!this._line2) return;
  this._line2.remove();
  this._line2 = null;
}

/* Prints a line, making sure that an offset of 0.5 px aligns them on
 * pixel boundaries */
const formatLine = FORMAT('M %.0f.5 %.0f.5 L %.0f.5 %.0f.5');

/* calculates the actual label positions based on given alignment
 * and dimensions */
function getLabelDimensions(align, X, label_size) {
  switch (align) {
    case 'start':
      return [X[0], X[1], X[0] + label_size[0], X[1] + label_size[1]];
    case 'middle':
      return [
        X[0] - label_size[0] / 2,
        X[1],
        X[0] + label_size[0] / 2,
        X[1] + label_size[1],
      ];
    case 'end':
      return [X[0] - label_size[0], X[1], X[0], X[1] + label_size[1]];
  }
}

function toInteger(value) {
  return Math.round(+value).toFixed(0);
}

function redrawZHandle(O, X) {
  let vec;
  let size;
  const zhandle = this._zhandle;

  if (!O.show_handle || O.z_handle === false) {
    if (zhandle) removeZHandle.call(this);
    return;
  }

  if (!zhandle.parentNode) this.element.appendChild(zhandle);

  if (this._handle && O.z_handle_below) this.element.appendChild(this._handle);

  if (O.mode === 'circular') {
    /*
     * position the z_handle on the circle.
     */
    vec = getZHandlePositionMovable(O, X);
    /* width and height are equal here */
    zhandle.setAttribute('cx', vec[0].toFixed(1));
    zhandle.setAttribute('cy', vec[1].toFixed(1));
    zhandle.setAttribute('r', (O.z_handle_size / 2).toFixed(1));

    this.zhandle_position = vec;
  } else if (O.mode === 'block') {
    /*
     * position the z_handle on the box.
     */
    vec = getZHandlePositionMovable(O, X);
    size = O.z_handle_size / 2;
    /* width and height are equal here */
    zhandle.setAttribute('x', vec[0].toFixed(0) - size);
    zhandle.setAttribute('y', vec[1].toFixed(0) - size);
    zhandle.setAttribute('width', O.z_handle_size);
    zhandle.setAttribute('height', O.z_handle_size);

    this.zhandle_position = vec;
  } else {
    // all other handle types (lines/blocks)
    this.zhandle_position = vec = getZHandleSize(O, X);

    zhandle.setAttribute('width', vec[0].toFixed(0));
    zhandle.setAttribute('height', vec[1].toFixed(0));

    vec = getZHandlePosition(O, X, vec);

    zhandle.setAttribute('x', vec[0].toFixed(0));
    zhandle.setAttribute('y', vec[1].toFixed(0));

    /* adjust to the center of the zhandle */
    this.zhandle_position[0] /= 2;
    this.zhandle_position[1] /= 2;
    this.zhandle_position[0] += vec[0];
    this.zhandle_position[1] += vec[1];
  }

  this.zhandle_position[0] -= (X[0] + X[2]) / 2;
  this.zhandle_position[1] -= (X[1] + X[3]) / 2;
  normalize(this.zhandle_position);
}

function preventDefault(e) {
  e.preventDefault();
  return false;
}

function createLabel() {
  let E;
  this._label = E = makeSVG('text', {
    class: 'aux-label',
  });
  addEventListener(E, 'wheel', this._onWheel);
  addEventListener(E, 'contextmenu', preventDefault);
}

function removeLabel() {
  const E = this._label;
  if (!E) return;
  this._label = null;
  E.remove();
  removeEventListener(E, 'wheel', this._onWheel);
  removeEventListener(E, 'contextmenu', preventDefault);

  this.label = [0, 0, 0, 0];
}

function removeHandle() {
  const E = this._handle;
  if (!E) return;
  this._handle = null;
  E.remove();
  removeEventListener(E, 'wheel', this._onWheel);
  removeEventListener(E, 'selectstart', preventDefault);
  removeEventListener(E, 'contextmenu', preventDefault);
}

function createHandle(mode) {
  if (this._handle) removeHandle.call(this);

  const E = makeSVG(mode === 'circular' ? 'circle' : 'rect', {
    class: 'aux-handle',
  });
  addEventListener(E, 'wheel', this._onWheel);
  addEventListener(E, 'selectstart', preventDefault);
  addEventListener(E, 'contextmenu', preventDefault);
  this._handle = E;
  this.element.appendChild(E);
}

function redrawLines(O, X) {
  if (!O.show_handle) {
    if (this._line1) removeLine1.call(this);
    if (this._line2) removeLine2.call(this);
    return;
  }

  const pos = this.label;
  const range_x = O.range_x;
  const range_y = O.range_y;

  const x = range_x.valueToPixel(O.x);
  const y = range_y.valueToPixel(O.y);
  switch (O.mode) {
    case 'circular':
    case 'block':
      if (O.show_axis) {
        this._line1.setAttribute(
          'd',
          formatLine(
            (y >= pos[1] && y <= pos[3] ? Math.max(X[2], pos[2]) : X[2]) +
              O.margin,
            y,
            range_x.options.basis,
            y
          )
        );
        this._line2.setAttribute(
          'd',
          formatLine(
            x,
            (x >= pos[0] && x <= pos[2] ? Math.max(X[3], pos[3]) : X[3]) +
              O.margin,
            x,
            range_y.options.basis
          )
        );
      } else {
        if (this._line1) removeLine1.call(this);
        if (this._line2) removeLine2.call(this);
      }
      break;
    case 'line-vertical':
    case 'block-left':
    case 'block-right':
      this._line1.setAttribute('d', formatLine(x, X[1], x, X[3]));
      if (O.show_axis) {
        this._line2.setAttribute(
          'd',
          formatLine(0, y, range_x.options.basis, y)
        );
      } else if (this._line2) {
        removeLine2.call(this);
      }
      break;
    case 'line-horizontal':
    case 'block-top':
    case 'block-bottom':
      this._line1.setAttribute('d', formatLine(X[0], y, X[2], y));
      if (O.show_axis) {
        this._line2.setAttribute(
          'd',
          formatLine(x, 0, x, range_y.options.basis)
        );
      } else if (this._line2) {
        removeLine2.call(this);
      }
      break;
    default:
      warn('Unsupported mode', O.mode);
  }

  if (this._line1 && !this._line1.parentNode)
    this.element.appendChild(this._line1);
  if (this._line2 && !this._line2.parentNode)
    this.element.appendChild(this._line2);
}

function startDrag() {
  this.drawOnce(function () {
    const e = this.element;
    const p = e.parentNode;
    addClass(e, 'aux-active');
    this.set('dragging', true);
    this.startInteracting();

    /* TODO: move this into the parent */
    addClass(this.parent.element, 'aux-dragging');

    setGlobalCursor('move');

    if (p.lastChild !== e) p.appendChild(e);
  });
}

function stopDrag() {
  this.drawOnce(function () {
    const e = this.element;
    removeClass(e, 'aux-active');
    this.set('dragging', false);
    this.stopInteracting();

    /* TODO: move this into the parent */
    removeClass(this.parent.element, 'aux-dragging');

    unsetGlobalCursor('move');
  });
}

/**
 * ChartHandle is a draggable SVG element, which can be used to represent and change
 * a value inside a {@link FrequencyResponse} and is drawn inside of a {@link Chart}.
 *
 * @class ChartHandle
 *
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} options.label - The name of the handle.
 * @property {Function|Object} options.range_x - Callback returning a {@link Range}
 *   for the x-axis or an object with options for a {@link Range}. This is usually
 *   the <code>x_range</code> of the parent chart.
 * @property {Function|Object} options.range_y - Callback returning a {@link Range}
 *   for the y-axis or an object with options for a {@link Range}. This is usually
 *   the <code>y_range</code> of the parent chart.
 * @property {Function|Object} options.range_z - Callback returning a {@link Range}
 *   for the z-axis or an object with options for a {@link Range}.
 * @property {String} [options.mode="circular"] - Type of the handle. Can be one of
 *   <code>circular</code>, <code>line-vertical</code>, <code>line-horizontal</code>,
 *   <code>block-left</code>, <code>block-right</code>, <code>block-top</code> or
 *   <code>block-bottom</code>.
 * @property {Number} [options.x] - Value of the x-coordinate.
 * @property {Number} [options.y] - Value of the y-coordinate.
 * @property {Number} [options.z] - Value of the z-coordinate.
 * @property {Number} [options.min_size=24] - Minimum size of the handle in px.
 * @property {Number} [options.max_size=100] - Maximum size of the handle in px.
 * @property {Function|Boolean} options.format_label - Label formatting function. Arguments are
 *   <code>label</code>, <code>x</code>, <code>y</code>, <code>z</code>. If set to <code>false</code>, no label is displayed.
 * @property {Array<String>}  [options.preferences=["left", "top", "right", "bottom"]] - Possible label
 *   positions by order of preference. Depending on the selected <code>mode</code> this can
 *   be a subset of <code>top</code>, <code>top-right</code>, <code>right</code>,
 *   <code>bottom-right</code>, <code>bottom</code>, <code>bottom-left</code>,
 *   <code>left</code>, <code>top-left</code> and <code>center</code>.
 * @property {Number} [options.margin=3] - Margin in px between the handle and the label.
 * @property {Boolean|String} [options.z_handle=false] - If not false, a small handle is drawn at the given position (`top`, `top-left`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right`), which can
 *   be dragged to change the value of the z-coordinate.
 * @property {Number} [options.z_handle_size=6] - Size in px of the z-handle.
 * @property {Number} [options.z_handle_centered=0.1] - Size of the z-handle in center positions.
 *   If this options is between 0 and 1, it is interpreted as a ratio, otherwise as a px size.
 * @property {Number} [options.z_handle_below=false] - Render the z-handle below the normal handle in the DOM. SVG doesn't know CSS attribute z-index, so this workaround is needed from time to time.
 * @property {Number} [options.x_min] - Minimum value of the x-coordinate.
 * @property {Number} [options.x_max] - Maximum value of the x-coordinate.
 * @property {Number} [options.y_min] - Minimum value of the y-coordinate.
 * @property {Number} [options.y_max] - Maximum value of the y-coordinate.
 * @property {Number} [options.z_min] - Minimum value of the z-coordinate.
 * @property {Number} [options.z_max] - Maximum value of the z-coordinate.
 * @property {Boolean} [options.show_axis=false] - If set to true,  additional lines are drawn at the coordinate values.
 *
 */

/**
 * @member {SVGText} ChartHandle#_label - The label. Has class <code>.aux-label</code>.
 */
/**
 * @member {SVGPath} ChartHandle#_line1 - The first line. Has class <code>.aux-line .aux-line1</code>.
 */
/**
 * @member {SVGPath} ChartHandle#_line2 - The second line. Has class <code>.aux-line .aux-line2</code>.
 */

function setMin(value, key) {
  const name = key.substr(0, 1);
  const O = this.options;
  if (value !== false && O[name] < value) this.set(name, value);
}

function setMax(value, key) {
  const name = key.substr(0, 1);
  const O = this.options;
  if (value !== false && O[name] > value) this.set(name, value);
}

function setRange(range, key) {
  const name = key.substr(6);
  this.set(name, range.snap(this.get(name)));
}

const movedDependencies = [ 'x', 'y', 'z', 'mode', 'show_handle', 'x_min', 'x_max', 'y_min', 'y_max', 'z_min', 'z_max' ];


/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the options <code>x</code>, <code>y</code> and <code>z</code>.
 *
 * @event ChartHandle#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action.
 * @param {mixed} value - The new value of the option.
 *
 */
export class ChartHandle extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), {
      range_x: 'mixed',
      range_y: 'mixed',
      range_z: 'mixed',
      intersect: 'function',
      mode: 'string',
      preferences: 'array',
      format_label: 'function|boolean',
      x: 'number',
      y: 'number',
      z: 'number',
      min_size: 'number',
      max_size: 'number',
      margin: 'number',
      z_handle: 'boolean|string',
      z_handle_size: 'number',
      z_handle_centered: 'number',
      z_handle_below: 'boolean',
      min_drag: 'number',
      x_min: 'number',
      x_max: 'number',
      y_min: 'number',
      y_max: 'number',
      z_min: 'number',
      z_max: 'number',
      show_axis: 'boolean',
      label: 'string',
      hover: 'boolean',
      dragging: 'boolean',
      show_handle: 'boolean',
    });
  }

  static get options() {
    return {
      range_x: {},
      range_y: {},
      range_z: {},
      intersect: function () {
        return { intersect: 0, count: 0 };
      },
      // NOTE: this is currently not a public API
      // callback function for checking intersections: function (x1, y1, x2, y2, id) {}
      // returns a value describing the amount of intersection with other handle elements.
      // intersections are weighted depending on the intersecting object. E.g. SVG borders have
      // a very high impact while intersecting in comparison with overlapping handle objects
      // that have a low impact on intersection
      mode: 'circular',
      preferences: ['left', 'top', 'right', 'bottom'],
      format_label: FORMAT('%s\n%d Hz\n%.2f dB\nQ: %.2f'),
      x: 0,
      y: 0,
      z: 0,
      min_size: 24,
      max_size: 100,
      margin: 3,
      z_handle: false,
      z_handle_size: 6,
      z_handle_centered: 0.1,
      z_handle_below: false,
      min_drag: 0,
      // NOTE: not yet a public API
      // amount of pixels the handle has to be dragged before it starts to move
      x_min: false,
      x_max: false,
      y_min: false,
      y_max: false,
      z_min: false,
      z_max: false,
      show_axis: false,
      hover: false,
      dragging: false,
      show_handle: true,
    };
  }

  static get static_events() {
    return {
      set_show_axis: function () {
        const O = this.options;
        if (O.mode === 'circular') createLine1.call(this);
        createLine2.call(this);
      },
      set_show_handle: function () {
        this.set('mode', this.options.mode);
        this.set('show_axis', this.options.show_axis);
        this.set('format_label', this.options.format_label);
      },
      set_mode: function (value) {
        const O = this.options;
        if (!O.show_handle) return;
        if (O.z_handle !== false) createZHandle.call(this);
        if (value !== 'circular') createLine1.call(this);
      },
      set_x_min: setMin,
      set_y_min: setMin,
      set_z_min: setMin,
      set_x_max: setMax,
      set_y_max: setMax,
      set_z_max: setMax,
      set_range_x: setRange,
      set_range_y: setRange,
      set_range_z: setRange,
      mouseenter: function () {
        this.set('hover', true);
      },
      mouseleave: function () {
        this.set('hover', false);
      },
      zchangestarted: function () {
        this.startInteracting();
      },
      zchangeended: function () {
        this.stopInteracting();
      },
      handlegrabbed: function () {
        this.startInteracting();
      },
      handlereleased: function () {
        this.stopInteracting();
      },
    };
  }

  static get renderers() {
    return [
      defineRender('hover', function (hover) {
        toggleClass(this.element, 'aux-hover', hover);
      }),
      defineRender('dragging', function (dragging) {
        toggleClass(this.element, 'aux-dragging', dragging);
      }),
      defineRender('mode', function (mode) {
        const E = this.element;

        MODES.forEach((mode) => removeClass(E, 'aux-' + mode));

        removeClass(E, 'aux-line');
        removeClass(E, 'aux-block');

        switch (mode) {
          case 'line-vertical':
          case 'line-horizontal':
            addClass(E, 'aux-line');
            break;
          case 'circular':
            break;
          case 'block-left':
          case 'block-right':
          case 'block-top':
          case 'block-bottom':
          case 'block':
            addClass(E, 'aux-block');
            break;
          default:
            warn('Unsupported mode:', mode);
            return;
        }

        addClass(E, 'aux-' + mode);
      }),
      defineRecalculation(
        [ 'show_handle', 'range_x', 'range_y', 'range_z', 'x', 'y', 'z', 'mode', 'min_size', 'max_size', 'x_min', 'x_max', 'y_min', 'y_max' ],
        function (show_handle, range_x, range_y, range_z, x, y, z, mode, min_size, max_size, x_min, x_max, y_min, y_max) {
          const xSize = range_x.options.basis;
          const ySize = range_y.options.basis;

          let X = null;

          if (show_handle && xSize && ySize) {
            const xPosition = range_x.valueToPixel(x);
            const yPosition = range_y.valueToPixel(y);
            const zPosition = range_z.valueToCoef(z) || 0;

            if (mode === 'circular') {
              const radius = (min_size + zPosition * (max_size - min_size)) / 2;
              X = [
                xPosition - radius,
                yPosition - radius,
                xPosition + radius,
                yPosition + radius
              ];
            } else if (mode === 'block') {
              const halfWidth = Math.max(min_size, zPosition) / 2;
              X = [
                xPosition - halfWidth,
                yPosition - halfWidth,
                xPosition + halfWidth,
                yPosition + halfWidth
              ];
            } else {
              let xMinPosition =
                x_min !== false ? range_x.valueToPixel(range_x.snap(x_min)) : 0;
              let xMaxPosition =
                x_max !== false
                  ? range_x.valueToPixel(range_x.snap(x_max))
                  : xSize;

              if (xMinPosition > xMaxPosition) {
                const tmp = xMinPosition;
                xMinPosition = xMaxPosition;
                xMaxPosition = tmp;
              }

              let yMinPosition =
                y_min !== false ? range_y.valueToPixel(range_y.snap(y_min)) : 0;
              let yMaxPosition =
                y_max !== false
                  ? range_y.valueToPixel(range_y.snap(y_max))
                  : ySize;

              if (yMinPosition > yMaxPosition) {
                const tmp = yMinPosition;
                yMinPosition = yMaxPosition;
                yMaxPosition = tmp;
              }

              const minHalfSize = min_size / 2;

              /* All other modes are drawn as rectangles */
              switch (mode) {
                case 'line-vertical': {
                  const tmp = Math.max(minHalfSize, (zPosition * max_size) / 2);
                  X = [
                    xPosition - tmp,
                    yMinPosition,
                    xPosition + tmp,
                    yMaxPosition
                  ];
                  break;
                }
                case 'line-horizontal': {
                  // line horizontal
                  const tmp = Math.max(minHalfSize, (zPosition * max_size) / 2);
                  X = [
                    xMinPosition,
                    yPosition - tmp,
                    xMaxPosition,
                    yPosition + tmp
                  ];
                  break;
                }
                case 'block-left':
                  // rect lefthand
                  X = [
                    0,
                    yMinPosition,
                    Math.max(xPosition, minHalfSize),
                    yMaxPosition
                  ];
                  break;
                case 'block-right':
                  // rect righthand
                  X = [
                    (xSize - xPosition < minHalfSize) ? (xSize - minHalfSize) : xPosition,
                    yMinPosition,
                    xSize,
                    yMaxPosition
                  ];
                  break;
                case 'block-top':
                  // rect top
                  X = [
                    xMinPosition,
                    0,
                    xMaxPosition,
                    Math.max(yPosition, minHalfSize)
                  ];
                  break;
                case 'block-bottom':
                  // rect bottom
                  X = [
                    (ySize - yPosition < minHalfSize) ? (ySize - minHalfSize) : xMinPosition,
                    yPosition,
                    xMaxPosition,
                    ySize
                  ];
                  break;
                default:
                  warn('Unsupported mode:', mode);
              }

            }

            // There are situations where the ranges are invalid (e.g. the
            // transformations are singular).
            if (X.some((v) => isNaN(v)))
              return;

            const currentPosition = this.get('_handle_position');

            if (currentPosition && X.every((element, i) => element === currentPosition[i]))
              return;
          }

          this.set('_handle_position', X);
        }),
      defineRender(
        [ 'mode', 'show_handle' ],
        function (mode, show_handle) {
          if (show_handle) {
            createHandle.call(this, mode);
          } else {
            removeHandle.call(this);
          }
        }),
      defineRender(
        [ '_handle_position', 'mode' ],
        function (_handle_position, mode) {
          const { _handle } = this;

          if (!_handle_position)
            return;

          const [ x1, y1, x2, y2 ] = _handle_position;

          if (mode === 'circular') {
            const radius = (x2 - x1) / 2;
            const cx = x1 + radius;
            const cy = y1 + radius;

            _handle.setAttribute('r', radius.toFixed(2));
            _handle.setAttribute('cx', cx.toFixed(2));
            _handle.setAttribute('cy', cy.toFixed(2));
          } else {
            /* All other modes are drawn as rectangles */
            _handle.setAttribute('x', toInteger(x1));
            _handle.setAttribute('y', toInteger(y1));
            _handle.setAttribute('width', toInteger(x2 - x1));
            _handle.setAttribute('height', toInteger(y2 - y1));
          }
        }),
      defineRender([ '_handle_position', 'z_handle' ],
        function (_handle_position, z_handle) {
          redrawZHandle.call(this, this.options, _handle_position);
        }),
      defineRecalculation(
        [ 'show_handle', 'format_label', 'x', 'y', 'z', 'label' ],
        function (show_handle, format_label, x, y, z, label) {
          let result = null;

          if (show_handle && format_label) {
            result = format_label.call(this, label, x, y, z);
          }

          this.set('_formatted_label', result);
        }),
      defineRender([ 'show_handle', 'mode' ], function (show_handle, mode) {
        if (!show_handle) {
          removeHandle.call(this);
        } else {
          createHandle.call(this, mode);
        }
      }),
      defineRender([ '_formatted_label' ], function (_formatted_label) {
        if (!this._label !== !_formatted_label) {
          if (_formatted_label) {
            createLabel.call(this);
          } else {
            removeLabel.call(this);
          }
        }

        const { _label, element } = this;

        // We unset both resulting sizes here
        // to prevent the positioning code below
        // to run twice if the label content changes.
        this.set('_label_width', 0);
        this.set('_label_height', 0);

        if (!_label)
          return;

        const lines = _formatted_label.split('\n');
        const tspans = _label.childNodes;

        while (tspans.length < lines.length) {
          _label.appendChild(makeSVG('tspan', { dy: '1.0em' }));
        }
        while (tspans.length > lines.length) {
          _label.removeChild(_label.lastChild);
        }

        lines.forEach((line, i) => setText(tspans[i], line));

        if (!_label.parentNode) element.appendChild(_label);

        return deferMeasure(() => {
          const width = Array.from(tspans).reduce((max, tspan) => Math.max(max, tspan.getComputedTextLength()), 0);

          this.set('_label_width', width);

          try {
            const height = _label.getBBox().height;
            this.set('_label_height', height);
          } catch (e) {
            /* _label is not in the DOM yet */
          }
        });
      }),
      defineRender(
        [ '_label_width', '_label_height', 'preferences', '_handle_position', 'mode', 'margin', 'intersect' ],
        function (_label_width, _label_height, preferences, _handle_position, mode, margin, intersect) {

          if (!_label_width || !_label_height || !_handle_position)
            return;

          const label_size = [ _label_width, _label_height ];
          let area = 0;
          let label_position;
          let text_position;
          let text_anchor;
          let tmp;

          /*
           * Calculate possible positions of the labels and calculate their intersections. Choose
           * that position which has the smallest intersection area with all other handles and labels
           */
          for (let i = 0; i < preferences.length; i++) {
            const preference = preferences[i];
            /* get alignment */
            const align = getLabelAlign(mode, preference);

            /* get label position */
            const LX = getLabelPosition(mode, margin, _handle_position, preference, label_size);

            /* calculate the label bounding box using anchor and dimensions */
            const pos = getLabelDimensions(align, LX, label_size);
            const intersectionArea = intersect(pos, this).intersect;

            /* We require at least one square px smaller intersection
             * to avoid flickering label positions */
            if (area === 0 || intersectionArea + 1 < area) {
              area = intersectionArea;
              label_position = pos;
              text_position = LX;
              text_anchor = align;

              /* there is no intersections, we are done */
              if (area === 0) break;
            }
          }

          const _label = this._label;

          this.label = label_position;
          const x = Math.round(text_position[0]) + 'px';
          const y = Math.round(text_position[1]) + 'px';
          _label.setAttribute('x', x);
          _label.setAttribute('y', y);
          _label.setAttribute('text-anchor', text_anchor);
          const cn = _label.childNodes;
          Array.from(_label.childNodes).forEach((tspan) => tspan.setAttribute('x', x));
          redrawLines.call(this, this.options, _handle_position);
        }),
    ];
  }

  onWheel(e) {
    {
      const result = this.emit('wheel', e);

      if (result !== void 0) return result;
    }

    if (e.deltaY === 0) return;

    e.preventDefault();
    e.stopPropagation();

    const direction = e.deltaY < 0 ? -1 : 1;
    const range = this.options.range_z;

    let diff = direction;

    if (e.getModifierState('Shift')) {
      diff *= range.get(
        e.getModifierState('Control') ? 'shift_down' : 'shift_up'
      );
    }

    let z = this.get('z');

    if (direction === 1) {
      z = range.snapUp(z + diff);
    } else {
      z = range.snapDown(z + diff);
    }

    this.userset('z', z);

    let timer = this._wheel_timer;

    if (timer === null) {
      this._wheel_timer = timer = new Timer(() => {
        this.set('dragging', false);
        removeClass(this.element, 'aux-active');
        this.emit('zchangeended', this.options.z);
      });
    }

    if (!timer.active) {
      this.emit('zchangestarted', this.options.z);
      this.set('dragging', true);
      addClass(this.element, 'aux-active');
    }

    timer.restart(250);
  }

  getHandlePosition() {
    return this.get('_handle_position') || new Array(4).fill(0);

  }

  initialize(options) {
    this.label = [0, 0, 0, 0];
    this._wheel_timer = null;
    if (!options.element) options.element = makeSVG('g');
    super.initialize(options);
    const O = this.options;

    /**
     * @member {Range} ChartHandle#range_x - The {@link Range} for the x axis.
     */
    /**
     * @member {Range} ChartHandle#range_y - The {@link Range} for the y axis.
     */
    /**
     * @member {Range} ChartHandle#range_z - The {@link Range} for the z axis.
     */
    defineRange(this, O.range_x, 'range_x');
    defineRange(this, O.range_y, 'range_y');
    defineRange(this, O.range_z, 'range_z');

    /**
     * @member {SVGGroup} ChartHandle#element - The main SVG group containing all handle elements. Has class <code>.aux-charthandle</code>.
     */
    /**
     * @member {SVGCircular} ChartHandle#_handle - The main handle.
     *      Has class <code>.aux-handle</code>.
     */

    /**
     * @member {SVGCircular} ChartHandle#_zhandle - The handle for manipulating z axis.
     *      Has class <code>.aux-zhandle</code>.
     */

    this._onWheel = (e) => this.onWheel(e);

    this._handle = this._zhandle = this._line1 = this._line2 = this._label = null;

    this.z_drag = new DragCapture(this, {
      node: null,
      onstartcapture: function (state) {
        const self = this.parent;
        const _O = self.options;
        state.z = _O.range_z.valueToPixel(O.z);

        const pstate = self.pos_drag.state();
        if (pstate) {
          const v = [
            state.current.clientX - pstate.prev.clientX,
            state.current.clientY - pstate.prev.clientY,
          ];
          normalize(v);
          state.vector = v;
        } else {
          state.vector = self.zhandle_position;
        }
        /**
         * Is fired when the user grabs the z-handle. The argument is the
         * actual z value.
         *
         * @event ChartHandle#zchangestarted
         *
         * @param {number} z - The z value.
         */
        self.emit('zchangestarted', O.z);
        startDrag.call(self);
        return true;
      },
      onmovecapture: function (state) {
        const self = this.parent;
        const _O = self.options;

        const zv = state.vector;
        const v = state.vDistance();

        const d = zv[0] * v[0] + zv[1] * v[1];

        /* ignore small movements */
        if (_O.min_drag > 0 && _O.min_drag > d) return;

        const range_z = _O.range_z;
        const z = range_z.pixelToValue(state.z + d);

        self.userset('z', z);
      },
      onstopcapture: function () {
        const self = this.parent;
        /**
         * Is fired when the user releases the z-handle. The argument is the
         * actual z value.
         *
         * @event ChartHandle#zchangeended
         *
         * @param {number} z - The z value.
         */
        self.emit('zchangeended', self.options.z);
        stopDrag.call(self);
      },
    });
    this.pos_drag = new DragCapture(this, {
      node: this.element,
      onstartcapture: function (state) {
        const self = this.parent;
        const _O = self.options;
        const ev = state.current;

        self.z_drag.set('node', document);

        /* right click triggers move to the back */
        if (ev.button === 2) {
          self.toBack.call(self);
          /* cancel everything else, but do not drag */
          ev.preventDefault();
          ev.stopPropagation();
          return false;
        }

        state.x = _O.range_x.valueToPixel(O.x);
        state.y = _O.range_y.valueToPixel(O.y);
        /**
         * Is fired when the main handle is grabbed by the user.
         * The argument is an object with the following members:
         * <ul>
         * <li>x: the actual value on the x axis</li>
         * <li>y: the actual value on the y axis</li>
         * <li>pos_x: the position in pixels on the x axis</li>
         * <li>pos_y: the position in pixels on the y axis</li>
         * </ul>
         *
         * @event ChartHandle#handlegrabbed
         *
         * @param {Object} positions - An object containing all relevant positions of the pointer.
         */
        self.emit('handlegrabbed', {
          x: _O.x,
          y: _O.y,
          pos_x: state.x,
          pos_y: state.y,
        });
        startDrag.call(self);
        return true;
      },
      onmovecapture: function (state) {
        const self = this.parent;
        const _O = self.options;

        /* ignore small movements */
        if (_O.min_drag > 0 && O.min_drag > state.distance()) return;

        /* we are changing z right now using a gesture, irgnore this movement */
        if (self.z_drag.dragging()) return;

        const v = state.vDistance();
        const range_x = _O.range_x;
        const range_y = _O.range_y;
        const ox = range_x.options;
        const oy = range_y.options;

        let x = Math.min(
          ox.max,
          Math.max(ox.min, range_x.pixelToValue(state.x + v[0]))
        );
        let y = Math.min(
          oy.max,
          Math.max(oy.min, range_y.pixelToValue(state.y + v[1]))
        );
        
        if (_O.x_min !== false && x < _O.x_min) x = _O.x_min;
        if (_O.x_max !== false && x > _O.x_max) x = _O.x_max;

        if (_O.y_min !== false && y < _O.y_min) y = _O.y_min;
        if (_O.y_max !== false && y > _O.y_max) y = _O.y_max;
        
        self.userset('x', _O.range_x.snap(x));
        self.userset('y', _O.range_y.snap(y));
      },
      onstopcapture: function () {
        /**
         * Is fired when the user releases the main handle.
         * The argument is an object with the following members:
         * <ul>
         * <li>x: the actual value on the x axis</li>
         * <li>y: the actual value on the y axis</li>
         * <li>pos_x: the position in pixels on the x axis</li>
         * <li>pos_y: the position in pixels on the y axis</li>
         * </ul>
         *
         * @event ChartHandle#handlereleased
         *
         * @param {Object} positions - An object containing all relevant positions of the pointer.
         */
        const self = this.parent;
        const _O = self.options;
        self.emit('handlereleased', {
          x: _O.x,
          y: _O.y,
          pos_x: _O.range_x.valueToPixel(O.x),
          pos_y: _O.range_y.valueToPixel(O.y),
        });
        stopDrag.call(self);
        self.z_drag.set('node', self._zhandle);
      },
    });

    this.set('mode', O.mode);
    this.set('show_handle', O.show_handle);
    this.set('show_axis', O.show_axis);
    this.set('x', O.x);
    this.set('y', O.y);
    this.set('z', O.z);
    this.set('z_handle', O.z_handle);
    this.set('format_label', O.format_label);
  }

  draw(O, element) {
    addClass(element, 'aux-charthandle');

    super.draw(O, element);
  }

  /**
   * Moves the handle to the front, i.e. add as last element to the containing
   * SVG group element.
   *
   * @method ChartHandle#toFront
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
   * Moves the handle to the back, i.e. add as first element to the containing
   * SVG group element.
   *
   * @method ChartHandle#toFront
   */
  toBack() {
    const E = this.element;
    const P = E.parentElement;
    if (P && E !== P.firstChild) {
      this.drawOnce(function () {
        const e = this.element;
        const _p = e.parentNode;
        if (_p && e !== _p.firstChild) _p.insertBefore(e, _p.firstChild);
      });
    }
  }

  set(key, value) {
    const O = this.options;

    switch (key) {
      case 'format_label':
        if (value !== false && typeof value !== 'function')
          throw new TypeError('Bad type.');
        break;
      case 'z_handle':
        if (value !== false && !ZHANDLE_POSITION_circular[value]) {
          warn('Unsupported z_handle option:', value);
          value = false;
        }
        if (value !== false) createZHandle.call(this);
        break;
      case 'x': {
        const { range_x, x_min, x_max } = O;

        if (range_x)
          value = range_x.snap(value);
        if (x_min !== false && value < x_min) value = x_min;
        if (x_max !== false && value > x_max) value = x_max;
        break;
      }
      case 'y': {
        const { range_y, y_min, y_max } = O;
        value = range_y.snap(value);
        if (y_min !== false && value < y_min) value = y_min;
        if (y_max !== false && value > y_max) value = y_max;
        break;
      }
      case 'z': {
        const { range_z, z_min, z_max } = O;

        if (z_min !== false && value < z_min) {
          value = z_min;
          warning(this.element);
        } else if (z_max !== false && value > z_max) {
          value = z_max;
          warning(this.element);
        }
        if (range_z) {
          if (value < range_z.options.min || value > range_z.options.max) {
            warning(this.element);
          }
          value = range_z.snap(value);
        }
        break;
      }

      case 'range_x':
      case 'range_y':
      case 'range_z':
        {
          if (typeof value === 'function') {
            value = value();
          } else if (
            typeof value === 'object' &&
            Object.getPrototypeOf(value) === Object.prototype
          ) {
            value = new Range(value);
          } else if (!(value instanceof Range)) {
            throw new Error('Bad argument.\n');
          }
        }
        break;
    }

    return super.set(key, value);
  }

  destroy() {
    removeZHandle.call(this);
    removeLine1.call(this);
    removeLine2.call(this);
    removeLabel.call(this);
    removeHandle.call(this);
    super.destroy();
  }
}

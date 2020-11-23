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

/* jshint -W018 */

import { defineClass, defineChildElement } from '../widget_helpers.js';
import { Widget } from './widget.js';
import { Ranged } from '../implements/ranged.js';
import {
  setContent,
  addClass,
  outerWidth,
  outerHeight,
  element,
  removeClass,
  toggleClass,
  empty,
  innerHeight,
  innerWidth,
  supports_transform,
} from '../utils/dom.js';
import { FORMAT } from '../utils/sprintf.js';
import { warn } from '../utils/log.js';
import { S } from '../dom_scheduler.js';

function getBase(O) {
  return Math.max(Math.min(O.max, O.base), O.min);
}
function vert(O) {
  return O.layout === 'left' || O.layout === 'right';
}
function fillInterval(range, levels, i, from, to, min_gap, result) {
  var level = levels[i];
  var x, j, pos, last_pos, last;
  var diff;

  var to_pos = range.valueToPixel(to);
  last_pos = range.valueToPixel(from);

  if (Math.abs(to_pos - last_pos) < min_gap) return;

  if (!result)
    result = {
      values: [],
      positions: [],
    };

  var values = result.values;
  var positions = result.positions;

  if (from > to) level = -level;
  last = from;

  for (
    j = ((to - from) / level) | 0, x = from + level;
    j > 0;
    x += level, j--
  ) {
    pos = range.valueToPixel(x);
    diff = Math.abs(last_pos - pos);
    if (Math.abs(to_pos - pos) < min_gap) break;
    if (diff >= min_gap) {
      if (i > 0 && diff >= min_gap * 2) {
        // we have a chance to fit some more labels in
        fillInterval(range, levels, i - 1, last, x, min_gap, result);
      }
      values.push(x);
      positions.push(pos);
      last_pos = pos;
      last = x;
    }
  }

  if (i > 0 && Math.abs(last_pos - to_pos) >= min_gap * 2) {
    fillInterval(range, levels, i - 1, last, to, min_gap, result);
  }

  return result;
}

function binaryContains(list, value) {
  const length = list.length;
  if (length === 0 || !(value >= list[0]) || !(value <= list[length - 1]))
    return false;

  for (let start = 0, end = length - 1; start <= end; ) {
    const mid = start + ((end - start) >> 1);
    const pivot = list[mid];

    if (value === pivot) return true;

    if (value < pivot) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return false;
}

// remove collisions from a with b given a minimum gap
function removeCollisions(a, b, min_gap, vert) {
  var pa = a.positions,
    pb = b.positions;
  var va = a.values;
  var dim;

  min_gap = +min_gap;

  if (typeof vert === 'boolean') dim = vert ? b.height : b.width;

  if (!(min_gap > 0)) min_gap = 1;

  if (!pb.length) return a;

  var i, j;
  var values = [];
  var positions = [];
  var pos_a, pos_b;
  var size;

  var last_pos = +pb[0],
    last_size = min_gap;

  if (dim) last_size += +dim[0] / 2;

  // If pb is just length 1, it does not matter
  var direction = pb.length > 1 && pb[1] < last_pos ? -1 : 1;

  for (i = 0, j = 0; i < pa.length && j < pb.length; ) {
    pos_a = +pa[i];
    pos_b = +pb[j];
    size = min_gap;

    if (dim) size += dim[j] / 2;

    if (
      Math.abs(pos_a - last_pos) < last_size ||
      Math.abs(pos_a - pos_b) < size
    ) {
      // try next position
      i++;
      continue;
    }

    if (j < pb.length - 1 && (pos_a - pos_b) * direction > 0) {
      // we left the current interval, lets try the next one
      last_pos = pos_b;
      last_size = size;
      j++;
      continue;
    }

    values.push(+va[i]);
    positions.push(pos_a);

    i++;
  }

  return {
    values: values,
    positions: positions,
  };
}
function createDOMNodes(data, create) {
  var nodes = [];
  var values, positions;
  var i;
  var E = this.element;
  var node;

  data.nodes = nodes;
  values = data.values;
  positions = data.positions;

  for (i = 0; i < values.length; i++) {
    nodes.push((node = create(values[i], positions[i])));
    E.appendChild(node);
  }
}
function createLabel(value, position) {
  var O = this.options;
  var elem = document.createElement('SPAN');
  elem.className = 'aux-label';
  if (vert(O)) {
    elem.style.bottom = (position / O.basis) * 100 + '%';
  } else {
    elem.style.left = (position / O.basis) * 100 + '%';
  }

  setContent(elem, O.labels(value));

  if (getBase(O) === value) addClass(elem, 'aux-base');
  if (O.max === value) addClass(elem, 'aux-max');
  if (O.min === value) addClass(elem, 'aux-min');

  return elem;
}
function createDot(value, position) {
  var O = this.options;
  var elem = document.createElement('DIV');
  elem.className = 'aux-dot';

  if (O.layout === 'left' || O.layout === 'right') {
    elem.style.bottom = (position / O.basis) * 100 + '%';
  } else {
    elem.style.left = (position / O.basis) * 100 + '%';
  }

  if (getBase(O) === value) addClass(elem, 'aux-base');
  if (O.max === value) addClass(elem, 'aux-max');
  if (O.min === value) addClass(elem, 'aux-min');

  return elem;
}
function measureDimensions(data) {
  var nodes = data.nodes;
  var width = [];
  var height = [];

  for (var i = 0; i < nodes.length; i++) {
    width.push(outerWidth(nodes[i]));
    height.push(outerHeight(nodes[i]));
  }

  data.width = width;
  data.height = height;
}
function handleEnd(O, labels, i) {
  var node = labels.nodes[i];
  var v = labels.values[i];

  if (v === O.min) {
    addClass(node, 'aux-min');
  } else if (v === O.max) {
    addClass(node, 'aux-max');
  } else return;
}
function generateScale(from, to, include_from, show_to) {
  var O = this.options;
  var labels;

  if (O.show_labels || O.show_markers)
    labels = {
      values: [],
      positions: [],
    };

  var dots = {
    values: [],
    positions: [],
  };
  var is_vert = vert(O);
  var tmp;

  if (include_from) {
    tmp = this.valueToPixel(from);

    if (labels) {
      labels.values.push(from);
      labels.positions.push(tmp);
    }

    dots.values.push(from);
    dots.positions.push(tmp);
  }

  var levels = O.levels;

  fillInterval(this, levels, levels.length - 1, from, to, O.gap_dots, dots);

  if (labels) {
    if (O.levels_labels) levels = O.levels_labels;

    fillInterval(
      this,
      levels,
      levels.length - 1,
      from,
      to,
      O.gap_labels,
      labels
    );

    tmp = this.valueToPixel(to);

    if (show_to || Math.abs(tmp - this.valueToPixel(from)) >= O.gap_labels) {
      labels.values.push(to);
      labels.positions.push(tmp);

      dots.values.push(to);
      dots.positions.push(tmp);
    }
  } else {
    dots.values.push(to);
    dots.positions.push(this.valueToPixel(to));
  }

  if (O.show_labels) {
    createDOMNodes.call(this, labels, createLabel.bind(this));

    if (labels.values.length && labels.values[0] === getBase(O)) {
      addClass(labels.nodes[0], 'aux-base');
    }
  }

  var render_cb = function () {
    var markers;

    if (O.show_markers) {
      markers = {
        values: labels.values,
        positions: labels.positions,
      };
      createDOMNodes.call(this, markers, createDot.bind(this));
      for (var i = 0; i < markers.nodes.length; i++)
        addClass(markers.nodes[i], 'aux-marker');
    }

    if (O.show_labels && labels.values.length > 1) {
      handleEnd(O, labels, 0);
      handleEnd(O, labels, labels.nodes.length - 1);
    }

    if (O.avoid_collisions && O.show_labels) {
      dots = removeCollisions(dots, labels, O.gap_dots, is_vert);
    } else if (markers) {
      dots = removeCollisions(dots, markers, O.gap_dots);
    }

    createDOMNodes.call(this, dots, createDot.bind(this));
  };

  if (O.show_labels && O.avoid_collisions)
    S.add(
      function () {
        measureDimensions(labels);
        S.add(render_cb.bind(this), 3);
      }.bind(this),
      2
    );
  else render_cb.call(this);
}
function markMarkers(labels, dots) {
  var i, j;

  var a = labels.values;
  var b = dots.values;
  var nodes = dots.nodes;

  for (i = j = 0; i < a.length && j < b.length; ) {
    if (a[i] < b[j]) i++;
    else if (a[i] > b[j]) j++;
    else {
      addClass(nodes[j], 'aux-marker');
      i++;
      j++;
    }
  }
}
/**
 * Interface for dots passed to the `fixed_dots` option of `Scale`.
 * @interface ScaleDot
 * @property {number} value - The value where the dot is located at.
 * @property {string|string[]} [class] - An optional class for the generated
 *      `div.aux-dot` element.
 */
/**
 * Interface for labels passed to the `fixed_labels` option of `Scale`.
 * @interface ScaleLabel
 * @property {number} value - The value where the dot is located at.
 * @property {string|string[]} [class] - An optional class string for the generated
 *      `span.aux-label` element.
 * @property {string} [label] - The label string. If omitted, the
 *      `options.labels(value)` is used.
 */
/**
 * Scale can be used to draw scales. It is used in {@link Meter} and
 * {@link Fader}. Scale draws labels and markers based on its parameters
 * and the available space. Scales can be drawn both vertically and horizontally.
 * Scale mixes in {@link Ranged} and inherits all its options.
 *
 * @extends Widget
 *
 * @mixes Ranged
 *
 * @class Scale
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} [options.layout="right"] - The layout of the Scale. <code>right</code> and
 *   <code>left</code> are vertical layouts with the labels being drawn right and left of the scale,
 *   respectively. <code>top</code> and <code>bottom</code> are horizontal layouts for which the
 *   labels are drawn on top and below the scale, respectively.
 * @property {Integer} [options.division=1] - Minimal step size of the markers.
 * @property {Array<Number>} [options.levels=[1]] - Array of steps for labels and markers.
 * @property {Number} [options.base=false]] - Base of the scale. If set to <code>false</code> it will
 *   default to the minimum value.
 * @property {Function} [options.labels=FORMAT("%.2f")] - Formatting function for the labels.
 * @property {Integer} [options.gap_dots=4] - Minimum gap in pixels between two adjacent markers.
 * @property {Integer} [options.gap_labels=40] - Minimum gap in pixels between two adjacent labels.
 * @property {Boolean} [options.show_labels=true] - If <code>true</code>, labels are drawn.
 * @property {Boolean} [options.show_max=true] - If <code>true</code>, display a label and a
 *   dot for the 'max' value.
 * @property {Boolean} [options.show_min=true] - If <code>true</code>, display a label and a
 *   dot for the 'min' value.
 * @property {Boolean} [options.show_base=true] - If <code>true</code>, display a label and a
 *   dot for the 'base' value.
 * @property {ScaleDot[]|number[]|Boolean} [options.fixed_dots] - This option can be used to specify fixed positions
 *   for the markers to be drawn at. <code>false</code> disables fixed dots.
 * @property {ScaleLabel[]|number[]|Boolean} [options.fixed_labels] - This option can be used to specify fixed positions
 *   for the labels to be drawn at. <code>false</code> disables fixed labels.
 * @property {Boolean} [options.show_markers=true] - If true, every dot which is located at the same
 *   position as a label has the <code>.aux-marker</code> class set.
 * @property {Number|Boolean} [options.pointer=false] - The value to set the pointers position to. Set to `false` to hide the pointer.
 * @property {Number|Boolean} [options.bar=false] - The value to set the bars height to. Set to `false` to hide the bar.
 */
export const Scale = defineClass({
  Extends: Widget,
  Implements: [Ranged],
  _options: Object.assign(
    Object.create(Widget.prototype._options),
    Ranged.prototype._options,
    {
      layout: 'string',
      division: 'number',
      levels: 'array',
      levels_labels: 'array',
      base: 'number',
      labels: 'function',
      gap_dots: 'number',
      gap_labels: 'number',
      show_labels: 'boolean',
      show_min: 'boolean',
      show_max: 'boolean',
      show_base: 'boolean',
      fixed_dots: 'boolean|array',
      fixed_labels: 'boolean|array',
      avoid_collisions: 'boolean',
      show_markers: 'boolean',
      bar: 'boolean|number',
      pointer: 'boolean|number',
    }
  ),
  options: {
    layout: 'right',
    division: 1,
    levels: [1],
    base: false,
    labels: FORMAT('%.2f'),
    avoid_collisions: false,
    gap_dots: 4,
    gap_labels: 40,
    show_labels: true,
    show_min: true,
    show_max: true,
    show_base: true,
    show_markers: true,
    fixed_dots: false,
    fixed_labels: false,
    bar: false,
    pointer: false,
  },

  initialize: function (options) {
    if (!options.element) options.element = element('div');
    Widget.prototype.initialize.call(this, options);
    /**
     * @member {HTMLDivElement} Scale#element - The main DIV element. Has class <code>.aux-scale</code>
     */
  },
  draw: function (O, element) {
    addClass(element, 'aux-scale');

    Widget.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    Widget.prototype.redraw.call(this);

    var I = this.invalid;
    var O = this.options;
    var E = this.element;

    if (I.layout) {
      I.layout = false;
      removeClass(
        E,
        'aux-vertical',
        'aux-horizontal',
        'aux-top',
        'aux-bottom',
        'aux-right',
        'aux-left'
      );
      if (this._bar) {
        this._bar.style.removeProperty('top');
        this._bar.style.removeProperty('bottom');
        this._bar.style.removeProperty('left');
        this._bar.style.removeProperty('right');
        I.bar = true;
      }
      switch (O.layout) {
        case 'left':
          addClass(E, 'aux-vertical', 'aux-left');
          break;
        case 'right':
          addClass(E, 'aux-vertical', 'aux-right');
          break;
        case 'top':
          addClass(E, 'aux-horizontal', 'aux-top');
          break;
        case 'bottom':
          addClass(E, 'aux-horizontal', 'aux-bottom');
          break;
        default:
          warn('Unsupported layout setting:', O.layout);
      }
    }

    if (I.reverse) {
      /* NOTE: reverse will be validated below */
      toggleClass(E, 'aux-reverse', O.reverse);
    }

    if (this._bar && (I.bar || I.basis || I.base || I.reverse)) {
      /* NOTE: options will be validated below */
      const tmpval = this.valueToPixel(this.snap(O.bar));
      const tmpbase = this.valueToPixel(O.base);
      const min = Math.min(tmpval, tmpbase);
      const max = Math.max(tmpval, tmpbase);

      if (vert(O)) {
        this._bar.style.top = ((O.basis - max) / O.basis) * 100 + '%';
        this._bar.style.bottom = (min / O.basis) * 100 + '%';
      } else {
        this._bar.style.right = ((O.basis - max) / O.basis) * 100 + '%';
        this._bar.style.left = (min / O.basis) * 100 + '%';
      }
    }

    if (
      I.validate(
        'base',
        'show_base',
        'gap_labels',
        'min',
        'show_min',
        'division',
        'max',
        'show_markers',
        'fixed_dots',
        'fixed_labels',
        'levels',
        'basis',
        'scale',
        'reverse',
        'show_labels',
        'labels'
      )
    ) {
      empty(E);
      const fixedDots = O.fixed_dots;
      const fixedLabels = O.fixed_labels;

      if (fixedDots && fixedLabels) {
        const dotNodes = this._createDots(fixedDots);

        if (O.show_labels) {
          const labelNodes = this._createLabels(fixedLabels);

          if (O.show_markers) {
            this._highlightMarkers(fixedLabels, fixedDots, dotNodes);
          }

          labelNodes.forEach((node) => E.appendChild(node));
        }

        dotNodes.forEach((node) => E.appendChild(node));
      } else {
        const base = getBase(O);

        if (base !== O.max)
          generateScale.call(this, base, O.max, true, O.show_max);
        if (base !== O.min)
          generateScale.call(this, base, O.min, base === O.max, O.show_min);
      }

      {
        const _bar = this._bar;
        const _pointer = this._pointer;
        if (_bar) E.appendChild(_bar);
        if (_pointer) E.appendChild(_pointer);
      }
    }
  },
  _highlightMarkers(labels, dots, dotNodes) {
    labels = labels
      .map((args) => (typeof args === 'number' ? args : args.value))
      .sort((a, b) => a - b);

    for (let i = 0; i < dots.length; i++) {
      const value = typeof dots[i] === 'number' ? dots[i] : dots[i].value;

      if (!binaryContains(labels, value)) continue;

      addClass(dotNodes[i], 'aux-marker');
    }
  },
  _createDot(args) {
    const O = this.options;
    const node = document.createElement('DIV');

    addClass(node, 'aux-dot');

    let value;

    if (typeof args === 'number') {
      value = args;
    } else {
      value = args.value;

      const cl = args.class;

      if (typeof cl === 'string') {
        addClass(node, cl);
      } else if (Array.isArray(cl)) {
        for (let i = 0; i < cl.length; i++) addClass(node, cl[i]);
      }
    }

    const position = this.valueToPixel(value);

    if (O.layout === 'left' || O.layout === 'right') {
      node.style.bottom = (position / O.basis) * 100 + '%';
    } else {
      node.style.left = (position / O.basis) * 100 + '%';
    }

    if (getBase(O) === value) addClass(node, 'aux-base');
    if (O.max === value) addClass(node, 'aux-max');
    if (O.min === value) addClass(node, 'aux-min');

    return node;
  },
  _createDots(values) {
    return values.map((value) => this._createDot(value));
  },
  _createLabel(args) {
    const O = this.options;

    let position, label;

    const node = document.createElement('SPAN');

    addClass(node, 'aux-label');

    let value;

    if (typeof args === 'number') {
      value = args;
      position = this.valueToPixel(value);

      label = O.labels(value);
    } else {
      value = args.value;

      position = this.valueToPixel(value);

      const cl = args.class;

      if (typeof cl === 'string') {
        addClass(node, cl);
      } else if (Array.isArray(cl)) {
        for (let i = 0; i < cl.length; i++) addClass(node, cl[i]);
      }

      if (args.label === void 0) {
        label = O.labels(value);
      } else {
        label = args.label;
      }
    }

    if (vert(O)) {
      node.style.bottom = (position / O.basis) * 100 + '%';
    } else {
      node.style.left = (position / O.basis) * 100 + '%';
    }

    setContent(node, label);

    if (getBase(O) === value) addClass(node, 'aux-base');
    if (O.max === value) addClass(node, 'aux-max');
    if (O.min === value) addClass(node, 'aux-min');

    return node;
  },
  _createLabels(values) {
    return values.map((value) => this._createLabel(value));
  },
  resize: function () {
    Widget.prototype.resize.call(this);
    var O = this.options;

    const basis = vert(O)
      ? innerHeight(this.element)
      : innerWidth(this.element);
    this.update('basis', basis);
  },

  // GETTER & SETTER
  set: function (key, value) {
    Widget.prototype.set.call(this, key, value);
    switch (key) {
      case 'division':
      case 'levels':
      case 'labels':
      case 'gap_dots':
      case 'gap_labels':
      case 'show_labels':
        /**
         * Gets fired when an option the rendering depends on was changed
         *
         * @event Scale#scalechanged
         *
         * @param {string} key - The name of the option which changed the {@link Scale}.
         * @param {mixed} value - The value of the option.
         */
        this.emit('scalechanged', key, value);
        break;
    }
  },
});

/**
 * @member {HTMLDivElement} Fader#_pointer - The DIV element of the pointer. It can be used to e.g. visualize the value set in the backend.
 */
defineChildElement(Scale, 'pointer', {
  show: false,
  toggle_class: true,
  option: 'pointer',
  draw_options: Object.keys(Ranged.prototype._options).concat([
    'pointer',
    'basis',
  ]),
  draw: function (O) {
    if (this._pointer) {
      var tmp = this.valueToCoef(this.snap(O.pointer)) * 100 + '%';
      if (vert(O)) {
        this._pointer.style.bottom = tmp;
      } else {
        this._pointer.style.left = tmp;
      }
    }
  },
});

/**
 * @member {HTMLDivElement} Fader#_bar - The DIV element of the bar. It can be used to e.g. visualize the value set in the backend or to draw a simple levelmeter.
 */
defineChildElement(Scale, 'bar', {
  show: false,
  toggle_class: true,
  option: 'bar',
});

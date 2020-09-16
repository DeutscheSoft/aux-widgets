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
import { FORMAT } from '../utils/sprintf.js';
import { error } from '../utils/log.js';
import { empty, addClass, getStyle } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { S } from '../dom_scheduler.js';
import { Warning } from '../implements/warning.js';
import { Ranged } from '../implements/ranged.js';
import { defineChildElement } from '../widget_helpers.js';
import { Widget } from './widget.js';

function interpretLabel(x) {
  if (typeof x === 'object') return x;
  if (typeof x === 'number') return { pos: x };
  error('Unsupported label type ', x);
}
var __rad = Math.PI / 180;
function _getCoords(deg, inner, outer, pos) {
  deg = +deg;
  inner = +inner;
  outer = +outer;
  pos = +pos;
  deg = deg * __rad;
  return {
    x1: Math.cos(deg) * outer + pos,
    y1: Math.sin(deg) * outer + pos,
    x2: Math.cos(deg) * inner + pos,
    y2: Math.sin(deg) * inner + pos,
  };
}
function _getCoordsSingle(deg, inner, pos) {
  deg = +deg;
  inner = +inner;
  pos = +pos;
  deg = deg * __rad;
  return {
    x: Math.cos(deg) * inner + pos,
    y: Math.sin(deg) * inner + pos,
  };
}
var formatPath = FORMAT(
  'M %f,%f ' + 'A %f,%f 0 %d,%d %f,%f ' + 'L %f,%f ' + 'A %f,%f 0 %d,%d %f,%f z'
);
var formatTranslate = FORMAT('translate(%f, %f)');
var formatTranslateRotate = FORMAT('translate(%f %f) rotate(%f %f %f)');
var formatRotate = FORMAT('rotate(%f %f %f)');

function drawDots() {
  // depends on dots, dot, min, max, size
  var _dots = this._dots;
  var O = this.options;
  var dots = O.dots;
  var dot = O.dots_defaults;
  var angle = O.angle;
  empty(_dots);
  for (var i = 0; i < dots.length; i++) {
    var m = dots[i];
    if (typeof m == 'number') m = { pos: m };

    var r = makeSVG('rect', { class: 'aux-dot' });

    var length = m.length === void 0 ? dot.length : m.length;
    var width = m.width === void 0 ? dot.width : m.width;
    var margin = m.margin === void 0 ? dot.margin : m.margin;
    var pos = Math.min(O.max, Math.max(O.min, m.pos));
    // TODO: consider adding them all at once
    _dots.appendChild(r);
    if (m['class']) addClass(r, m['class']);
    if (m.color) r.style.fill = m.color;

    r.setAttribute('x', O.size - length - margin);
    r.setAttribute('y', O.size / 2 - width / 2);

    r.setAttribute('width', length);
    r.setAttribute('height', width);

    r.setAttribute(
      'transform',
      'rotate(' +
        this.valueToCoef(this.snap(pos)) * angle +
        ' ' +
        O.size / 2 +
        ' ' +
        this.options.size / 2 +
        ')'
    );
  }
  /**
   * Is fired when dots are (re)drawn.
   * @event Circular#dotsdrawn
   */
  this.emit('dotsdrawn');
}
function drawMarkers() {
  // depends on size, markers, marker, min, max
  var O = this.options;
  var markers = O.markers;
  var marker = O.markers_defaults;
  empty(this._markers);

  var stroke = O._stroke_width;
  var outer = O.size / 2;
  var angle = O.angle;

  for (var i = 0; i < markers.length; i++) {
    var m = markers[i];
    var thick = m.thickness === void 0 ? marker.thickness : m.thickness;
    var margin = m.margin === void 0 ? marker.margin : m.margin;
    var inner = outer - thick;
    var outer_p = outer - margin - stroke / 2;
    var inner_p = inner - margin - stroke / 2;
    var from, to;

    if (m.from === void 0) from = O.min;
    else from = Math.min(O.max, Math.max(O.min, m.from));

    if (m.to === void 0) to = O.max;
    else to = Math.min(O.max, Math.max(O.min, m.to));

    var s = makeSVG('path', { class: 'aux-marker' });
    this._markers.appendChild(s);

    if (m['class']) addClass(s, m['class']);
    if (m.color) s.style.fill = m.color;
    if (!m.nosnap) {
      from = this.snap(from);
      to = this.snap(to);
    }
    from = this.valueToCoef(from) * angle;
    to = this.valueToCoef(to) * angle;

    drawSlice.call(this, from, to, inner_p, outer_p, outer, s);
  }
  /**
   * Is fired when markers are (re)drawn.
   * @event Circular#markersdrawn
   */
  this.emit('markersdrawn');
}
function drawLabels() {
  // depends on size, labels, label, min, max, start
  var _labels = this._labels;
  var O = this.options;
  var labels = O.labels;
  var label = O.labels_defaults;
  empty(this._labels);

  if (!labels.length) return;

  var outer = O.size / 2;
  var a = new Array(labels.length);
  var i;

  var l,
    p,
    positions = new Array(labels.length);

  for (i = 0; i < labels.length; i++) {
    l = labels[i];
    p = makeSVG('text', {
      class: 'aux-label',
      style: 'dominant-baseline: central;',
    });

    if (l['class']) addClass(p, l['class']);
    if (l.color) p.style.fill = l.color;

    if (l.label !== void 0) p.textContent = l.label;
    else p.textContent = label.format(l.pos);

    p.setAttribute('text-anchor', 'middle');

    _labels.appendChild(p);
    a[i] = p;
  }
  /* FORCE_RELAYOUT */

  S.add(
    function () {
      var j, q;
      for (j = 0; j < labels.length; j++) {
        l = labels[j];
        q = a[j];

        var margin = l.margin !== void 0 ? l.margin : label.margin;
        var align = (l.align !== void 0 ? l.align : label.align) === 'inner';
        var pos = Math.min(O.max, Math.max(O.min, l.pos));
        var bb = q.getBBox();
        var angle =
          (this.valueToCoef(this.snap(pos)) * O.angle + O.start) % 360;
        var outer_p = outer - margin;
        var coords = _getCoordsSingle(angle, outer_p, outer);

        var mx =
          (((coords.x - outer) / outer_p) * (bb.width + bb.height / 2.5)) /
          (align ? -2 : 2);
        var my =
          (((coords.y - outer) / outer_p) * bb.height) / (align ? -2 : 2);

        positions[j] = formatTranslate(coords.x + mx, coords.y + my);
      }

      S.add(
        function () {
          for (j = 0; j < labels.length; j++) {
            q = a[j];
            q.setAttribute('transform', positions[j]);
          }
          /**
           * Is fired when labels are (re)drawn.
           * @event Circular#labelsdrawn
           */
          this.emit('labelsdrawn');
        }.bind(this),
        1
      );
    }.bind(this)
  );
}
function drawSlice(a_from, a_to, r_inner, r_outer, pos, slice) {
  a_from = +a_from;
  a_to = +a_to;
  r_inner = +r_inner;
  r_outer = +r_outer;
  pos = +pos;
  // ensure from !== to
  if (a_from % 360 === a_to % 360) a_from += 0.001;
  // ensure from and to in bounds
  while (a_from < 0) a_from += 360;
  while (a_to < 0) a_to += 360;
  if (a_from > 360) a_from %= 360;
  if (a_to > 360) a_to %= 360;

  if (a_from > a_to) {
    let tmp = a_from;
    a_from = a_to;
    a_to = tmp;
  }

  // get large flag
  let large;
  if (Math.abs(a_from - a_to) >= 180) large = 1;
  else large = 0;
  // draw this slice
  var from = _getCoords(a_from, r_inner, r_outer, pos);
  var to = _getCoords(a_to, r_inner, r_outer, pos);

  var path = formatPath(
    from.x1,
    from.y1,
    r_outer,
    r_outer,
    large,
    1,
    to.x1,
    to.y1,
    to.x2,
    to.y2,
    r_inner,
    r_inner,
    large,
    0,
    from.x2,
    from.y2
  );
  slice.setAttribute('d', path);
}
export const Circular = defineClass({
  /**
   * Circular is a SVG group element containing two paths for displaying
   * numerical values in a circular manner. Circular is able to draw labels,
   * dots and markers and can show a hand. Circular e.g. is implemented by
   * {@link Clock} to draw hours, minutes and seconds.
   *
   * @class Circular
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Number} [options.value=0] - Sets the value on the hand and on the
   *   ring at the same time.
   * @property {Number} [options.value_hand=0] - Sets the value on the hand.
   * @property {Number} [options.value_ring=0] - Sets the value on the ring.
   * @property {Number} [options.size=100] - The diameter of the circle. This
   *   is the base value for all following layout-related parameters. Keeping
   *   it set to 100 offers percentual lenghts. Set the final size of the widget
   *   via CSS.
   * @property {Number} [options.thickness=3] - The thickness of the circle.
   * @property {Number} [options.margin=0] - The margin between base and value circles.
   * @property {Boolean} [options.show_hand=true] - Draw the hand.
   * @property {Object} [options.hand] - Dimensions of the hand.
   * @property {Number} [options.hand.width=2] - Width of the hand.
   * @property {Number} [options.hand.length=30] - Length of the hand.
   * @property {Number} [options.hand.margin=10] - Margin of the hand.
   * @property {Number} [options.start=135] - The starting point in degrees.
   * @property {Number} [options.angle=270] - The maximum degree of the rotation when
   *   <code>options.value === options.max</code>.
   * @property {Number|Boolean} [options.base=false] - If a base value is set in degrees,
   *   circular starts drawing elements from this position.
   * @property {Boolean} [options.show_base=true] - Draw the base ring.
   * @property {Boolean} [options.show_value=true] - Draw the value ring.
   * @property {Number} [options.x=0] - Horizontal displacement of the circle.
   * @property {Number} [options.y=0] - Vertical displacement of the circle.
   * @property {Boolean} [options.show_dots=true] - Show/hide all dots.
   * @property {Object} [options.dots_defaults] - This option acts as default values for the individual dots
   *   specified in <code>options.dots</code>.
   * @property {Number} [options.dots_defaults.width=2] - Width of the dots.
   * @property {Number} [options.dots_defaults.length=2] - Length of the dots.
   * @property {Number} [options.dots_defaults.margin=5] - Margin of the dots.
   * @property {Array<Object|Number>} [options.dots=[]] - An array of objects describing where dots should be placed
   *   along the circle. Members are position <code>pos</code> in the value range and optionally
   *   <code>color</code> and <code>class</code> and any of the properties of <code>options.dot</code>.
   *   Optionally a number defining the position can be set.
   * @property {Boolean} [options.show_markers=true] - Show/hide all markers.
   * @property {Object} [options.markers_defaults] - This option acts as default values of the individual markers
   *   specified in <code>options.markers</code>.
   * @property {Number} [options.markers_defaults.thickness=3] - Thickness of the marker.
   * @property {Number} [options.markers_defaults.margin=3] - Margin of the marker.
   * @property {Array<Object>} [options.markers=[]] - An array containing objects which describe where markers
   *   are to be places. Members are the position as <code>from</code> and <code>to</code> and optionally
   *   <code>color</code>, <code>class</code> and any of the properties of <code>options.marker</code>.
   * @property {Boolean} [options.show_labels=true] - Show/hide all labels.
   * @property {Object} [options.labels_defaults] - This option acts as default values for the individual labels
   *   specified in <code>options.labels</code>.
   * @property {Integer} [options.labels_defaults.margin=8] - Distance of the label from the circle of diameter
   *   <code>options.size</code>.
   * @property {String} [options.labels_defaults.align="outer"] - This option controls if labels are positioned
   *   inside or outside of the circle with radius <code>options.size/2 - margin</code>.
   * @property {Function} [options.labels_defaults.format] - Optional formatting function for the label.
   *   Receives the label value as first argument.
   * @property {Array<Object>} [options.labels=[]] - An array containing objects which describe labels
   *   to be displayed. Either a value or an object whose members are the position <code>pos</code>
   *   inside the value range and optionally <code>label</code>, <code>color</code>, <code>class</code> and any of the
   *   properties of <code>options.labels_defaults</code>.
   *
   * @extends Widget
   *
   * @mixes Warning
   * @mixes Ranged
   */
  Extends: Widget,
  Implements: [Warning, Ranged],
  _options: Object.assign(
    Object.create(Widget.prototype._options),
    Ranged.prototype._options,
    {
      _stroke_width: 'number',
      value: 'number',
      value_hand: 'number',
      value_ring: 'number',
      size: 'number',
      thickness: 'number',
      margin: 'number',
      hand: 'object',
      start: 'number',
      angle: 'number',
      base: 'number|boolean',
      show_base: 'boolean',
      show_value: 'boolean',
      show_hand: 'boolean',
      x: 'number',
      y: 'number',
      dots_defaults: 'object',
      dots: 'array',
      markers_defaults: 'object',
      markers: 'array',
      labels_defaults: 'object',
      labels: 'array',
    }
  ),
  static_events: {
    set_value: function (value) {
      this.set('value_hand', value);
      this.set('value_ring', value);
    },
    initialized: function () {
      // calculate the stroke here once. this happens before
      // the initial redraw
      this.set('value', this.options.value);
    },
    rangedchanged: function () {
      let I = this.invalid;
      I.size = I.markers = I.dots = I.labels = true;
      this.triggerDraw();
    },
  },
  options: {
    _stroke_width: 0,
    value: 0,
    value_hand: 0,
    value_ring: 0,
    size: 100,
    thickness: 3,
    margin: 0,
    hand: { width: 2, length: 30, margin: 10 },
    start: 135,
    angle: 270,
    base: false,
    show_base: true,
    show_value: true,
    show_hand: true,
    x: 0,
    y: 0,
    dots_defaults: { width: 1, length: 3, margin: 0.5 },
    dots: [],
    markers_defaults: { thickness: 3, margin: 0 },
    markers: [],
    labels_defaults: {
      margin: 8,
      align: 'inner',
      format: function (val) {
        return val;
      },
    },
    labels: [],
  },

  initialize: function (options) {
    if (!options.element) options.element = makeSVG('g');
    Widget.prototype.initialize.call(this, options);

    /**
     * @member {SVGImage} Circular#element - The main SVG element.
     *      Has class <code>.aux-circular</code>
     */
    /**
     * @member {SVGPath} Circular#_base - The base of the ring.
     *      Has class <code>.aux-base</code>
     */
    this._base = makeSVG('path', { class: 'aux-base' });

    /**
     * @member {SVGPath} Circular#_value - The ring showing the value.
     *      Has class <code>.aux-value</code>
     */
    this._value = makeSVG('path', { class: 'aux-value' });

    /**
     * @member {SVGRect} Circular#_hand - The hand of the knob.
     *      Has class <code>.aux-hand</code>
     */
    this._hand = makeSVG('rect', { class: 'aux-hand' });

    if (this.options.labels) this.set('labels', this.options.labels);
  },

  resize: function () {
    this.update('_stroke_width', this.getStroke());
    this.invalid.labels = true;
    this.triggerDraw();
    Widget.prototype.resize.call(this);
  },

  draw: function (O, element) {
    addClass(element, 'aux-circular');
    element.insertBefore(this._value, this._markers);
    element.insertBefore(this._base, this._value);
    element.appendChild(this._hand);

    Widget.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    Widget.prototype.redraw.call(this);
    var I = this.invalid;
    var O = this.options;
    var E = this.element;
    var outer = O.size / 2;
    var tmp;

    if (I.validate('x', 'y') || I.start || I.size) {
      E.setAttribute(
        'transform',
        formatTranslateRotate(O.x, O.y, O.start, outer, outer)
      );
      if (this._labels)
        this._labels.setAttribute(
          'transform',
          formatRotate(-O.start, outer, outer)
        );
    }

    if (
      O.show_labels &&
      (I.validate('show_labels', 'labels', 'label') ||
        I.size ||
        I.min ||
        I.max ||
        I.start ||
        I.angle)
    ) {
      drawLabels.call(this);
    }

    if (
      O.show_dots &&
      (I.validate('show_dots', 'dots', 'dot') ||
        I.min ||
        I.max ||
        I.size ||
        I.base ||
        I.angle)
    ) {
      drawDots.call(this);
    }

    if (
      O.show_markers &&
      (I.validate('show_markers', 'markers', 'marker') ||
        I.size ||
        I.min ||
        I.max ||
        I.start ||
        I.angle)
    ) {
      drawMarkers.call(this);
    }

    var stroke = O._stroke_width;
    var inner = outer - O.thickness;
    var outer_p = outer - stroke / 2 - O.margin;
    var inner_p = inner - stroke / 2 - O.margin;

    if (
      I.show_value ||
      I.value_ring ||
      I.size ||
      I._stroke_width ||
      I.base ||
      I.angle
    ) {
      I.show_value = I.value_ring = false;
      if (O.show_value) {
        drawSlice.call(
          this,
          this.valueToCoef(this.snap(O.base)) * O.angle,
          this.valueToCoef(this.snap(O.value_ring)) * O.angle,
          inner_p,
          outer_p,
          outer,
          this._value
        );
      } else {
        this._value.removeAttribute('d');
      }
    }

    if (I.show_base || I.size || I._stroke_width || I.base || I.angle) {
      I.show_base = false;
      if (O.show_base) {
        drawSlice.call(this, 0, O.angle, inner_p, outer_p, outer, this._base);
      } else {
        /* TODO: make this a child element */
        this._base.removeAttribute('d');
      }
    }
    if (I.show_hand || I.size || I.base || I.angle) {
      I.show_hand = false;
      if (O.show_hand) {
        this._hand.style.display = 'block';
      } else {
        this._hand.style.display = 'none';
      }
    }
    if (
      I.validate(
        'size',
        'value_hand',
        'hand',
        'min',
        'max',
        'start',
        'base',
        'angle'
      )
    ) {
      tmp = this._hand;
      tmp.setAttribute('x', O.size - O.hand.length - O.hand.margin);
      tmp.setAttribute('y', (O.size - O.hand.width) / 2.0);
      tmp.setAttribute('width', O.hand.length);
      tmp.setAttribute('height', O.hand.width);
      tmp.setAttribute(
        'transform',
        formatRotate(
          this.valueToCoef(this.snap(O.value_hand)) * O.angle,
          O.size / 2,
          O.size / 2
        )
      );
    }
    I._stroke_width = false;
  },

  destroy: function () {
    this._dots.remove();
    this._markers.remove();
    this._base.remove();
    this._value.remove();
    Widget.prototype.destroy.call(this);
  },
  getStroke: function () {
    if (this.hasOwnProperty('_stroke')) return this._stroke;
    var strokeb = parseInt(getStyle(this._base, 'stroke-width')) || 0;
    var strokev = parseInt(getStyle(this._value, 'stroke-width')) || 0;
    this._stroke = Math.max(strokeb, strokev);
    return this._stroke;
  },

  /**
   * Adds a label.
   *
   * @method Circular#addLabel
   * @param {Object|Number} label - The label. Please refer to the `options`
   *   to learn more about possible values.
   * @returns {Object} label - The interpreted object to build the label from.
   */
  addLabel: function (label) {
    var O = this.options;

    if (!O.labels) {
      O.labels = [];
    }

    label = interpretLabel(label);

    if (label) {
      O.labels.push(label);
      this.invalid.labels = true;
      this.triggerDraw();
      return label;
    }
  },

  /**
   * Removes a label.
   *
   * @method Circular#removeLabel
   * @param {Object} label - The label object as returned from `addLabel`.
   * @returns {Object} label - The removed label object.
   */
  removeLabel: function (label) {
    var O = this.options;

    if (!O.labels) return;

    var i = O.labels.indexOf(label);

    if (i === -1) return;

    O.labels.splice(i);
    this.invalid.labels = true;
    this.triggerDraw();
  },

  // GETTERS & SETTERS
  set: function (key, value) {
    var O = this.options;
    switch (key) {
      case 'dots_defaults':
      case 'markers_defaults':
      case 'labels_defaults':
        value = Object.assign(O[key], value);
        break;
      case 'base':
        if (value === false) value = O.min;
        break;
      case 'value':
        if (value > O.max || value < O.min) this.warning(this.element);
        value = this.snap(Math.max(O.min, Math.min(O.max, value)));
        break;
      case 'labels':
        if (value)
          for (var i = 0; i < value.length; i++) {
            value[i] = interpretLabel(value[i]);
          }
        break;
    }

    return Widget.prototype.set.call(this, key, value);
  },
});
/**
 * @member {SVGGroup} Circular#_markers - A group containing all markers.
 *      Has class <code>.aux-markers</code>
 */
defineChildElement(Circular, 'markers', {
  //option: "markers",
  //display_check: function(v) { return !!v.length; },
  show: true,
  create: function () {
    return makeSVG('g', { class: 'aux-markers' });
  },
});
/**
 * @member {SVGGroup} Circular#_dots - A group containing all dots.
 *      Has class <code>.aux-dots</code>
 */
defineChildElement(Circular, 'dots', {
  //option: "dots",
  //display_check: function(v) { return !!v.length; },
  show: true,
  create: function () {
    return makeSVG('g', { class: 'aux-dots' });
  },
});
/**
 * @member {SVGGroup} Circular#_labels - A group containing all labels.
 *      Has class <code>.aux-labels</code>
 */
defineChildElement(Circular, 'labels', {
  //option: "labels",
  //display_check: function(v) { return !!v.length; },
  show: true,
  create: function () {
    return makeSVG('g', { class: 'aux-labels' });
  },
});

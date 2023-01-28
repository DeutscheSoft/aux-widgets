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

import { FORMAT } from '../utils/sprintf.js';
import { error } from '../utils/log.js';
import { empty, addClass, getStyle } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { warning } from '../utils/warning.js';
import {
  rangedOptionsDefaults,
  rangedOptionsTypes,
  makeRanged,
} from '../utils/make_ranged.js';
import { defineChildElement } from '../widget_helpers.js';
import { SymResize, Widget } from './widget.js';
import {
  defineRender,
  defineMeasure,
  deferMeasure,
  deferRender,
} from '../renderer.js';

function interpretLabel(x) {
  if (typeof x === 'object') return x;
  if (typeof x === 'number') return { pos: x };
  error('Unsupported label type ', x);
}
const __rad = Math.PI / 180;
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
const formatPath = FORMAT(
  'M %f,%f ' + 'A %f,%f 0 %d,%d %f,%f ' + 'L %f,%f ' + 'A %f,%f 0 %d,%d %f,%f z'
);
const formatTranslate = FORMAT('translate(%f, %f)');
const formatTranslateRotate = FORMAT('translate(%f %f) rotate(%f %f %f)');
const formatRotate = FORMAT('rotate(%f %f %f)');

const SymLabelsChanged = Symbol('_labels changed');

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
    const tmp = a_from;
    a_from = a_to;
    a_to = tmp;
  }

  // get large flag
  let large;
  if (Math.abs(a_from - a_to) >= 180) large = 1;
  else large = 0;
  // draw this slice
  const from = _getCoords(a_from, r_inner, r_outer, pos);
  const to = _getCoords(a_to, r_inner, r_outer, pos);

  const path = formatPath(
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
/**
 * Circular is a SVG group element containing two paths for displaying
 * numerical values in a circular manner. Circular is able to draw labels,
 * dots and markers and can show a hand. Circular e.g. is implemented by
 * {@link Clock} to draw hours, minutes and seconds. Circular is based on {@link Range}.
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
 */
export class Circular extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), rangedOptionsTypes, {
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
      show_labels: 'boolean',
      show_dots: 'boolean',
      show_markers: 'boolean',
      x: 'number',
      y: 'number',
      dots_defaults: 'object',
      dots: 'array',
      markers_defaults: 'object',
      markers: 'array',
      labels_defaults: 'object',
      labels: 'array',
    });
  }

  static get static_events() {
    return {
      set_value: function (value) {
        this.set('value_hand', value);
        this.set('value_ring', value);
      },
      initialized: function () {
        // calculate the stroke here once. this happens before
        // the initial redraw
        this.set('value', this.options.value);
      },
    };
  }

  static get options() {
    return Object.assign({}, rangedOptionsDefaults, {
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
      show_labels: true,
      show_dots: true,
      show_markers: true,
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
    });
  }

  static get renderers() {
    return [
      defineRender('show_hand', function (show_hand) {
        this._hand.style.display = show_hand ? 'block' : 'none';
      }),
      defineMeasure(SymResize, function () {
        this.set('_stroke_width', this.getStroke());
        this.invalidate('labels');
      }),
      defineRender(
        [
          'show_dots',
          'dots',
          'dots_defaults',
          'angle',
          'transformation',
          'snap_module',
          'max',
          'min',
          'size',
        ],
        function (
          show_dots,
          dots,
          dots_defaults,
          angle,
          transformation,
          snap_module,
          max,
          min,
          size
        ) {
          const _dots = this._dots;

          if (!_dots) return;

          empty(_dots);

          if (!show_dots) return;

          // TODO: consider caching nodes

          for (let i = 0; i < dots.length; i++) {
            let m = dots[i];
            if (typeof m == 'number') m = { pos: m };

            const r = makeSVG('rect', { class: 'aux-dot' });

            const length =
              m.length === void 0 ? dots_defaults.length : m.length;
            const width = m.width === void 0 ? dots_defaults.width : m.width;
            const margin =
              m.margin === void 0 ? dots_defaults.margin : m.margin;
            const pos = Math.min(max, Math.max(min, m.pos));
            _dots.appendChild(r);
            if (m['class']) addClass(r, m['class']);
            if (m.color) r.style.fill = m.color;

            r.setAttribute('x', size - length - margin);
            r.setAttribute('y', size / 2 - width / 2);

            r.setAttribute('width', length);
            r.setAttribute('height', width);

            r.setAttribute(
              'transform',
              'rotate(' +
                transformation.valueToCoef(snap_module.snap(pos)) * angle +
                ' ' +
                size / 2 +
                ' ' +
                size / 2 +
                ')'
            );
          }
          /**
           * Is fired when dots are (re)drawn.
           * @event Circular#dotsdrawn
           */
          this.emit('dotsdrawn');
        }
      ),
      defineRender(
        [
          SymLabelsChanged,
          'show_labels',
          'labels',
          'labels_defaults',
          'transformation',
          'snap_module',
          'min',
          'max',
          'angle',
          'start',
          'size',
        ],
        function (
          show_labels,
          labels,
          labels_defaults,
          transformation,
          snap_module,
          min,
          max,
          angle,
          start,
          size
        ) {
          // depends on size, labels, label, min, max, start
          const _labels = this._labels;

          if (!_labels) return;

          empty(this._labels);

          if (!show_labels || !labels.length) return;

          const outerSize = size / 2;
          const a = new Array(labels.length);

          const elements = labels.map((l) => {
            const p = makeSVG('text', {
              class: 'aux-label',
              style: 'dominant-baseline: central;',
            });

            if (l['class']) addClass(p, l['class']);
            if (l.color) p.style.fill = l.color;

            if (l.label !== void 0) p.textContent = l.label;
            else p.textContent = labels_defaults.format(l.pos);

            p.setAttribute('text-anchor', 'middle');

            _labels.appendChild(p);
            return p;
          });
          /* FORCE_RELAYOUT */

          return deferMeasure(() => {
            const positions = labels.map((l, i) => {
              const element = elements[i];

              const margin =
                l.margin !== void 0 ? l.margin : labels_defaults.margin;
              const align =
                (l.align !== void 0 ? l.align : labels_defaults.align) ===
                'inner';
              const pos = Math.min(max, Math.max(min, l.pos));
              const bb = element.getBBox();
              const _angle =
                (transformation.valueToCoef(snap_module.snap(pos)) * angle +
                  start) %
                360;
              const outer_p = outerSize - margin;
              const coords = _getCoordsSingle(_angle, outer_p, outerSize);

              const mx =
                (((coords.x - outerSize) / outer_p) *
                  (bb.width + bb.height / 2.5)) /
                (align ? -2 : 2);
              const my =
                (((coords.y - outerSize) / outer_p) * bb.height) /
                (align ? -2 : 2);

              return formatTranslate(coords.x + mx, coords.y + my);
            });

            return deferRender(() => {
              elements.forEach((element, i) => {
                element.setAttribute('transform', positions[i]);
              });
              /**
               * Is fired when labels are (re)drawn.
               * @event Circular#labelsdrawn
               */
              this.emit('labelsdrawn');
            });
          });
        }
      ),
      defineRender(['x', 'y', 'start', 'size'], function (x, y, start, size) {
        const outerSize = size / 2;
        this.element.setAttribute(
          'transform',
          formatTranslateRotate(x, y, start, outerSize, outerSize)
        );
      }),
      defineRender(['start', 'size'], function (start, size) {
        const _labels = this._labels;
        const outerSize = size / 2;
        if (!_labels) return;
        _labels.setAttribute(
          'transform',
          formatRotate(-start, outerSize, outerSize)
        );
      }),
      defineRender(
        [
          'show_markers',
          'markers',
          'markers_defaults',
          'transformation',
          'snap_module',
          'size',
          'angle',
          'min',
          'max',
          '_stroke_width',
        ],
        function (
          show_markers,
          markers,
          markers_defaults,
          transformation,
          snap_module,
          size,
          angle,
          min,
          max,
          _stroke_width
        ) {
          const _markers = this._markers;

          if (!_markers) return;

          empty(this._markers);

          if (!show_markers) return;

          const outerSize = size / 2;

          for (let i = 0; i < markers.length; i++) {
            const m = markers[i];
            const thick =
              m.thickness === void 0 ? markers_defaults.thickness : m.thickness;
            const margin =
              m.margin === void 0 ? markers_defaults.margin : m.margin;
            const inner = outerSize - thick;
            const outer_p = outerSize - margin - _stroke_width / 2;
            const inner_p = inner - margin - _stroke_width / 2;
            let from, to;

            if (m.from === void 0) from = min;
            else from = Math.min(max, Math.max(min, m.from));

            if (m.to === void 0) to = max;
            else to = Math.min(max, Math.max(min, m.to));

            const s = makeSVG('path', { class: 'aux-marker' });

            if (m['class']) addClass(s, m['class']);
            if (m.color) s.style.fill = m.color;
            if (!m.nosnap) {
              from = snap_module.snap(from);
              to = snap_module.snap(to);
            }
            from = transformation.valueToCoef(from) * angle;
            to = transformation.valueToCoef(to) * angle;

            drawSlice(from, to, inner_p, outer_p, outerSize, s);
            this._markers.appendChild(s);
          }
          /**
           * Is fired when markers are (re)drawn.
           * @event Circular#markersdrawn
           */
          this.emit('markersdrawn');
        }
      ),
      defineRender(
        [
          'show_value',
          'transformation',
          'snap_module',
          'base',
          'angle',
          'value_ring',
          '_stroke_width',
          'thickness',
          'margin',
          'size',
        ],
        function (
          show_value,
          transformation,
          snap_module,
          base,
          angle,
          value_ring,
          _stroke_width,
          thickness,
          margin,
          size
        ) {
          const _value = this._value;

          if (show_value) {
            const outerSize = size / 2;
            const inner = outerSize - thickness;
            const outer_p = outerSize - _stroke_width / 2 - margin;
            const inner_p = inner - _stroke_width / 2 - margin;

            drawSlice(
              transformation.valueToCoef(snap_module.snap(base)) * angle,
              transformation.valueToCoef(snap_module.snap(value_ring)) * angle,
              inner_p,
              outer_p,
              outerSize,
              _value
            );
          } else {
            _value.removeAttribute('d');
          }
        }
      ),
      defineRender(
        [
          'show_base',
          'size',
          'base',
          'margin',
          '_stroke_width',
          'thickness',
          'angle',
        ],
        function (
          show_base,
          size,
          base,
          margin,
          _stroke_width,
          thickness,
          angle
        ) {
          const _base = this._base;

          if (show_base) {
            const outerSize = size / 2;
            const inner = outerSize - thickness;
            const outer_p = outerSize - _stroke_width / 2 - margin;
            const inner_p = inner - _stroke_width / 2 - margin;

            drawSlice(0, angle, inner_p, outer_p, outerSize, _base);
          } else {
            _base.removeAttribute('d');
          }
        }
      ),
      defineRender(
        [
          'size',
          'value_hand',
          'hand',
          'transformation',
          'snap_module',
          'angle',
        ],
        function (size, value_hand, hand, transformation, snap_module, angle) {
          const _hand = this._hand;
          _hand.setAttribute('x', size - hand.length - hand.margin);
          _hand.setAttribute('y', (size - hand.width) / 2.0);
          _hand.setAttribute('width', hand.length);
          _hand.setAttribute('height', hand.width);
          _hand.setAttribute(
            'transform',
            formatRotate(
              transformation.valueToCoef(snap_module.snap(value_hand)) * angle,
              size / 2,
              size / 2
            )
          );
        }
      ),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = makeSVG('g');
    super.initialize(options);

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

    /**
     * @member {SVGGroup} Circular#_markers - A group containing all markers.
     *      Has class <code>.aux-markers</code>
     */
    this._markers = makeSVG('g', { class: 'aux-markers' });

    /**
     * @member {SVGGroup} Circular#_dots - A group containing all dots.
     *      Has class <code>.aux-dots</code>
     */
    this._dots = makeSVG('g', { class: 'aux-dots' });

    if (this.options.labels) this.set('labels', this.options.labels);
  }

  draw(O, element) {
    addClass(element, 'aux-circular');
    element.appendChild(this._base);
    element.appendChild(this._value);
    element.appendChild(this._markers);
    element.appendChild(this._dots);
    element.appendChild(this._hand);

    super.draw(O, element);
  }

  destroy() {
    this._dots.remove();
    this._markers.remove();
    this._base.remove();
    this._value.remove();
    this._hand.remove();
    super.destroy();
  }

  getStroke() {
    if (Object.prototype.hasOwnProperty.call(this, '_stroke'))
      return this._stroke;
    const strokeb = parseInt(getStyle(this._base, 'stroke-width')) || 0;
    const strokev = parseInt(getStyle(this._value, 'stroke-width')) || 0;
    this._stroke = Math.max(strokeb, strokev);
    return this._stroke;
  }

  /**
   * Adds a label.
   *
   * @method Circular#addLabel
   * @param {Object|Number} label - The label. Please refer to the `options`
   *   to learn more about possible values.
   * @returns {Object} label - The interpreted object to build the label from.
   */
  addLabel(label) {
    const O = this.options;

    if (!O.labels) {
      O.labels = [];
    }

    label = interpretLabel(label);

    if (label) {
      O.labels.push(label);
      this.invalidate('labels');
      return label;
    }
  }

  /**
   * Removes a label.
   *
   * @method Circular#removeLabel
   * @param {Object} label - The label object as returned from `addLabel`.
   * @returns {Object} label - The removed label object.
   */
  removeLabel(label) {
    const O = this.options;

    if (!O.labels) return;

    const i = O.labels.indexOf(label);

    if (i === -1) return;

    O.labels.splice(i);
    this.invalidate('labels');
  }

  // GETTERS & SETTERS
  set(key, value) {
    const O = this.options;
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
        if (value > O.max || value < O.min) warning(this.element);
        value = O.snap_module.snap(Math.max(O.min, Math.min(O.max, value)));
        break;
      case 'labels':
        if (value)
          for (let i = 0; i < value.length; i++) {
            value[i] = interpretLabel(value[i]);
          }
        break;
    }

    return super.set(key, value);
  }
}
makeRanged(Circular);
/**
 * @member {SVGGroup} Circular#_labels - A group containing all labels.
 *      Has class <code>.aux-labels</code>
 */
defineChildElement(Circular, 'labels', {
  //option: "labels",
  //display_check: function(v) { return !!v.length; },
  show: true,
  dependency: SymLabelsChanged,
  create: function () {
    return makeSVG('g', { class: 'aux-labels' });
  },
});

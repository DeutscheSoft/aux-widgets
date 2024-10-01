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
import { empty, addClass, getStyle } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import {
  warningRenderers,
  warningEvents,
  warningOptionsTypes,
  warningOptionsDefaults,
} from '../utils/warning.js';
import { mergeObjects } from '../utils/merge_objects.js';
import {
  rangedOptionsDefaults,
  rangedOptionsTypes,
  rangedRenderers,
  rangedEvents,
} from '../utils/ranged.js';
import { defineChildElement, mergeStaticEvents } from '../widget_helpers.js';
import { SymResize, Widget } from './widget.js';
import {
  defineRender,
  defineMeasure,
  deferMeasure,
  deferRender,
  defineRecalculation,
} from '../renderer.js';

function createInternalDot(dot, dotDefaults) {
  const tmp =
    typeof dot === 'object'
      ? dot
      : typeof dot === 'number'
      ? { pos: dot }
      : null;

  if (tmp === null) return null;

  return mergeObjects(dotDefaults, tmp);
}

function createInternalLabel(label, labelDefaults) {
  const internalLabel = createInternalDot(label, labelDefaults);

  if (internalLabel && internalLabel.label === void 0) {
    const label = internalLabel.format(internalLabel.pos);
    return { label, ...internalLabel };
  } else {
    return internalLabel;
  }
}

function createInternalMarker(marker, markerDefaults) {
  return createInternalDot(marker, markerDefaults);
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
 *   If it is a number, it is equivalent to an object containing just <code>pos</code>.
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
    return [
      warningOptionsTypes,
      rangedOptionsTypes,
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
        presets: 'object',
        preset: 'string',
      },
    ];
  }

  static get static_events() {
    return mergeStaticEvents(rangedEvents, warningEvents, {
      set_value: function (value) {
        this.set('value_hand', value);
        this.set('value_ring', value);
      },
      initialized: function () {
        // calculate the stroke here once. this happens before
        // the initial redraw
        this.set('value', this.options.value);
      },
    });
  }

  static get options() {
    return [
      rangedOptionsDefaults,
      warningOptionsDefaults,
      {
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
      },
    ];
  }

  getPresetOption(presets, presetName, optionName, value) {
    const defaultValue = this.getDefault(optionName);
    if (value !== defaultValue) {
      return value;
    }

    if (presets && presetName) {
      const preset = presets[presetName];

      if (preset && optionName in preset) return preset[optionName];
    }

    return value;
  }

  getPresetOptionMerged(presets, presetName, optionName, value) {
    const defaultValue = this.getDefault(optionName);

    const preset = presets && presetName ? presets[presetName] : null;

    return mergeObjects(
      defaultValue,
      preset ? preset[optionName] : null,
      defaultValue !== value ? value : null
    );
  }

  static get renderers() {
    return [
      ...rangedRenderers,
      ...warningRenderers,
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
          '_dots',
          'angle',
          'transformation',
          'snap_module',
          'size',
        ],
        function (show_dots, dots, angle, transformation, snap_module, size) {
          const _dots = this._dots;

          if (!_dots) return;

          empty(_dots);

          if (!show_dots) return;

          // TODO: consider caching nodes

          if (dots)
            dots.forEach((dot) => {
              const r = makeSVG('rect', { class: 'aux-dot' });

              const { length, width, margin, color, class: cl } = dot;
              const pos = transformation.clampValue(dot.pos);
              if (cl) addClass(r, cl);
              if (color) r.style.fill = color;

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
              _dots.appendChild(r);
            });
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
          '_labels',
          'transformation',
          'snap_module',
          'angle',
          'start',
          'size',
          'presets',
          'preset',
        ],
        function (
          show_labels,
          labels,
          transformation,
          snap_module,
          angle,
          start,
          size,
          presets,
          preset
        ) {
          // depends on size, _labels, label, start
          const _labels = this._labels;

          if (!_labels) return;

          empty(this._labels);

          show_labels = this.getPresetOption(
            presets,
            preset,
            'show_labels',
            show_labels
          );

          if (!show_labels || !labels || !labels.length) return;

          const outerSize = size / 2;

          const elements = labels.map((l) => {
            const p = makeSVG('text', {
              class: 'aux-label',
              style: 'dominant-baseline: central;',
            });

            if (l['class']) addClass(p, l['class']);
            if (l.color) p.style.fill = l.color;

            if (l.label !== void 0) p.textContent = l.label;

            p.setAttribute('text-anchor', 'middle');

            _labels.appendChild(p);
            return p;
          });
          /* FORCE_RELAYOUT */

          return deferMeasure(() => {
            const positions = labels.map((l, i) => {
              const element = elements[i];

              const margin = l.margin;
              const alignOffset = l.align === 'inner' ? -2 : 2;

              const pos = transformation.clampValue(l.pos);
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
                alignOffset;
              const my =
                (((coords.y - outerSize) / outer_p) * bb.height) / alignOffset;

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
          '_markers',
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

          if (markers)
            markers.forEach((marker) => {
              const { thickness, margin, color, class: cl, nosnap } = marker;
              const inner = outerSize - thickness;
              const outer_p = outerSize - margin - _stroke_width / 2;
              const inner_p = inner - margin - _stroke_width / 2;

              let from = transformation.clampValue(
                marker.from === void 0 ? min : marker.from
              );
              let to = transformation.clampValue(
                marker.to === void 0 ? max : marker.to
              );

              const s = makeSVG('path', { class: 'aux-marker' });

              if (cl) addClass(s, cl);
              if (color) s.style.fill = color;
              if (!nosnap) {
                from = snap_module.snap(from);
                to = snap_module.snap(to);
              }
              from = transformation.valueToCoef(from) * angle;
              to = transformation.valueToCoef(to) * angle;

              drawSlice(from, to, inner_p, outer_p, outerSize, s);
              _markers.appendChild(s);
            });
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
          '_coef_base',
          'angle',
          '_coef_ring',
          '_stroke_width',
          'thickness',
          'margin',
          'size',
          'presets',
          'preset',
        ],
        function (
          show_value,
          _coef_base,
          angle,
          _coef_ring,
          _stroke_width,
          thickness,
          margin,
          size,
          presets,
          preset
        ) {
          const _value = this._value;

          margin = this.getPresetOption(presets, preset, 'margin', margin);
          thickness = this.getPresetOption(
            presets,
            preset,
            'thickness',
            thickness
          );

          if (show_value) {
            if (!isFinite(_coef_base) || !isFinite(_coef_ring)) return;

            const outerSize = size / 2;
            const inner = outerSize - thickness;
            const outer_p = outerSize - _stroke_width / 2 - margin;
            const inner_p = inner - _stroke_width / 2 - margin;

            drawSlice(
              _coef_base * angle,
              _coef_ring * angle,
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
          'margin',
          '_stroke_width',
          'thickness',
          'angle',
          'presets',
          'preset',
        ],
        function (
          show_base,
          size,
          margin,
          _stroke_width,
          thickness,
          angle,
          presets,
          preset
        ) {
          const _base = this._base;

          margin = this.getPresetOption(presets, preset, 'margin', margin);
          thickness = this.getPresetOption(
            presets,
            preset,
            'thickness',
            thickness
          );

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
        ['size', '_coef_hand', 'hand', 'angle', 'presets', 'preset'],
        function (size, _coef_hand, hand, angle, presets, preset) {
          const _hand = this._hand;

          const hand_angle = _coef_hand * angle;

          if (isNaN(hand_angle) || !isFinite(hand_angle)) return;

          hand = this.getPresetOptionMerged(presets, preset, 'hand', hand);
          _hand.setAttribute('x', size - hand.length - hand.margin);
          _hand.setAttribute('y', (size - hand.width) / 2.0);
          _hand.setAttribute('width', hand.length);
          _hand.setAttribute('height', hand.width);
          _hand.setAttribute(
            'transform',
            formatRotate(hand_angle, size / 2, size / 2)
          );
        }
      ),
      defineRecalculation(['value', 'transformation', 'snap_module'], function (
        value,
        transformation,
        snap_module
      ) {
        const _value = snap_module.snap(transformation.clampValue(value));
        this.update('_value', _value);
      }),
      defineRecalculation(
        ['value_hand', 'transformation', 'snap_module'],
        function (value_hand, transformation, snap_module) {
          const value = transformation.valueToCoef(
            snap_module.snap(transformation.clampValue(value_hand))
          );
          this.update('_coef_hand', value);
        }
      ),
      defineRecalculation(
        ['value_ring', 'transformation', 'snap_module'],
        function (value_ring, transformation, snap_module) {
          const value = transformation.valueToCoef(
            snap_module.snap(transformation.clampValue(value_ring))
          );
          this.update('_coef_ring', value);
        }
      ),
      defineRecalculation(
        ['base', 'min', 'transformation', 'snap_module'],
        function (base, min, transformation, snap_module) {
          const value = base === false ? min : base;
          const _coef_base = transformation.valueToCoef(
            snap_module.snap(transformation.clampValue(value))
          );
          this.update('_coef_base', _coef_base);
        }
      ),
      defineRecalculation(
        ['labels', 'labels_defaults', 'presets', 'preset'],
        function (labels, labels_defaults, presets, preset) {
          let _labels = null;

          labels_defaults = this.getPresetOptionMerged(
            presets,
            preset,
            'labels_defaults',
            labels_defaults
          );

          if (Array.isArray(labels) && labels.length) {
            _labels = labels.map((entry) =>
              createInternalLabel(entry, labels_defaults)
            );

            if (_labels.includes(null))
              _labels = _labels.filter((label) => label !== null);
          }

          this.update('_labels', _labels);
        }
      ),
      defineRecalculation(
        ['dots', 'dots_defaults', 'presets', 'preset'],
        function (dots, dots_defaults, presets, preset) {
          let _dots = null;
          dots_defaults = this.getPresetOptionMerged(
            presets,
            preset,
            'dots_defaults',
            dots_defaults
          );

          if (Array.isArray(dots) && dots.length) {
            _dots = dots.map((entry) =>
              createInternalDot(entry, dots_defaults)
            );

            if (_dots.includes(null))
              _dots = _dots.filter((dot) => dot !== null);
          }

          this.update('_dots', _dots);
        }
      ),
      defineRecalculation(
        ['markers', 'markers_defaults', 'presets', 'preset'],
        function (markers, markers_defaults, presets, preset) {
          let _markers = null;

          markers_defaults = this.getPresetOptionMerged(
            presets,
            preset,
            'markers_defaults',
            markers_defaults
          );

          if (Array.isArray(markers) && markers.length) {
            _markers = markers.map((entry) =>
              createInternalMarker(entry, markers_defaults)
            );

            if (_markers.includes(null))
              _markers = _markers.filter((marker) => marker !== null);
          }

          this.update('_markers', _markers);
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
}

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

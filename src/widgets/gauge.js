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

import { Widget } from './widget.js';
import { Circular } from './circular.js';
import { element, addClass } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { FORMAT } from '../utils/sprintf.js';
import { objectAnd, objectSub } from '../utils/object.js';
import { defineRender, deferMeasure, deferRender } from '../renderer.js';

function getCoordsSingle(deg, inner, pos) {
  deg = (deg * Math.PI) / 180;
  return {
    x: Math.cos(deg) * inner + pos,
    y: Math.sin(deg) * inner + pos,
  };
}
const formatTranslate = FORMAT('translate(%f, %f)');
const formatViewbox = FORMAT('0 0 %d %d');
/**
 * Gauge draws a single {@link Circular} into a SVG image. It inherits
 * all options of {@link Circular}.
 *
 * @class Gauge
 *
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.x=0] - Displacement of the {@link Circular}
 *   in horizontal direction. This allows drawing gauges which are only
 *   represented by a segment of a circle.
 * @property {Number} [options.y=0] - Displacement of the {@link Circular}
 *   in vertical direction.
 * @property {Object} [options.label] - Optional gauge label.
 * @property {Number} [options.label.pos] - Position inside of the circle in
 *   degrees.
 * @property {String} [options.label.label] - label string.
 * @property {Number} [options.label.margin] - Margin of the label string.
 * @property {String} [options.label.align] - Alignment of the label, either
 *   <code>inner</code> or <code>outer</code>.
 */
export class Gauge extends Widget {
  static get _options() {
    return Object.assign({}, Circular.getOptionTypes(), {
      width: 'number',
      height: 'number',
      label: 'object',
    });
  }

  static get options() {
    return Object.assign({}, Circular.getDefaultOptions(), {
      width: 100, // width of the element
      height: 100, // height of the svg
      size: 100,
      label: { pos: 90, margin: 0, align: 'inner', label: '' },
    });
  }

  static get renderers() {
    return [
      defineRender(['width', 'height'], function (width, height) {
        this.svg.setAttribute('viewBox', formatViewbox(width, height));
      }),
      defineRender(['label', 'x', 'y', 'size'], function (label, x, y, size) {
        const _label = this._label;
        const O = this.options;

        _label.textContent = label.label;

        /**
         * Is fired when the label changed.
         *
         * @event Gauge#labeldrawn
         */
        this.emit('labeldrawn');

        if (!label.label) return;

        return deferMeasure(() => {
          const outer = O.size / 2;
          const margin = label.margin;
          const align = label.align === 'inner';
          const bb = _label.getBoundingClientRect();
          const angle = label.pos % 360;
          const outer_p = outer - margin;
          const coords = getCoordsSingle(angle, outer_p, outer);

          let mx =
            (((coords.x - outer) / outer_p) * (bb.width + bb.height / 2.5)) /
            (align ? -2 : 2);
          let my =
            (((coords.y - outer) / outer_p) * bb.height) / (align ? -2 : 2);

          mx += x;
          my += y;

          return deferRender(() => {
            _label.setAttribute(
              'transform',
              formatTranslate(coords.x + mx, coords.y + my)
            );
            _label.setAttribute('text-anchor', 'middle');
          });
        });
      }),
    ];
  }

  initialize(options) {
    super.initialize(options);

    const O = this.options;
    let S;

    if (typeof O.label === 'string') this.set('label', O.label);

    if (!this.element) this.element = element('div');

    /**
     * @member {SVGImage} Gauge#svg - The main SVG image.
     */
    this.svg = S = makeSVG('svg');

    /**
     * @member {HTMLDivElement} Gauge#element - The main DIV container.
     *   Has class <code>.aux-gauge</code>.
     */

    /**
     * @member {SVGText} Gauge#_label - The label of the gauge.
     *   Has class <code>.aux-label</code>.
     */
    this._label = makeSVG('text', { class: 'aux-label' });
    S.appendChild(this._label);

    let co = objectAnd(O, Circular.getOptionTypes());
    co = objectSub(co, Widget.getOptionTypes());
    co.container = S;

    /**
     * @member {Circular} Gauge#circular - The {@link Circular} module.
     */
    this.circular = new Circular(co);
    this.addChild(this.circular);
  }

  draw(O, element) {
    addClass(element, 'aux-gauge');
    element.appendChild(this.svg);

    super.draw(O, element);
  }

  destroy() {
    this.svg.remove();
    super.destroy();
  }

  // GETTERS & SETTERS
  set(key, value) {
    if (key === 'label') {
      if (typeof value === 'string') value = { label: value };
      value = Object.assign({}, this.options.label, value);
    }
    // Circular does the snapping
    if (!Widget.getOptionTypes()[key] && Circular.getOptionTypes()[key])
      value = this.circular.set(key, value);
    return super.set(key, value);
  }
}

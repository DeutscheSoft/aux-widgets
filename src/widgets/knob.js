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

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>value</code>.
 *
 * @event Knob#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { defineClass } from '../widget_helpers.js';
import { Widget } from './widget.js';
import { Circular } from './circular.js';
import { DragValue } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { element, addClass } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { FORMAT } from '../utils/sprintf.js';
import { objectAnd, objectSub } from '../utils/object.js';

const formatViewbox = FORMAT('0 0 %d %d');
function dblClick() {
  if (!this.get('bind_dblclick')) return;
  this.userset('value', this.options.reset);
  /**
   * Is fired when the knob receives a double click in order to reset to initial value.
   *
   * @event Knob#doubleclick
   *
   * @param {number} value - The value of the widget.
   */
  this.emit('doubleclick', this.options.value);
}
function moduleRange() {
  return this.parent.circular;
}
/**
 * Knob is a {@link Circular} inside of an SVG which can be
 * modified both by dragging and scrolling utilizing {@link DragValue}
 * and {@link ScrollValue}.
 * It inherits all options of {@link Circular} and {@link DragValue}.
 * The options listed below consist of options from the contained widgets,
 * only showing the default values.
 *
 * @class Knob
 * 
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {Number} [options.reset] - Reset to this value on double click.
 * @property {boolean} [options.bind_dblclick=true] - If true, bind the dblclick
 *      event to reset the value to the `reset` option.
 * @property {Object} [options.hand={width: 1, length: 12, margin: 24}]
 * @property {Number} [options.margin=13]
 * @property {Number} [options.thickness=6]
 * @property {Number} [options.step=1] 
 * @property {Number} [options.shift_up=4]
 * @property {Number} [options.shift_down=0.25]
 * @property {Object} [options.dots_defaults={length: 6, margin: 13, width: 2}]
 * @property {Object} [options.markers_defaults={thickness: 6, margin: 13}]
 * @property {Object} [options.labels_defaults={margin: 10, align: "outer", format: function(val){return val;}}]
 * @property {Number} [options.basis=300] - Distance to drag between <code>min</code> and <code>max</code>.
 * @property {String} [options.preset="medium"] - The preset to use. Presets
 *   are a functionality of {@link Widget}.
 * @property {Object} [options.presets={
            tiny: {margin:0, thickness:4, hand:{width: 1, length: 6, margin: 8}, dots_defaults:{length:4, margin:0, width:1}, markers_defaults: {thickness: 2, margin: 0}, show_labels:false},
            small: {margin:0, thickness:5, hand:{width: 1, length: 8, margin: 10}, dots_defaults: {length:5, margin:0,width:1}, markers_defaults: {thickness: 2, margin: 0}, show_labels:false},
            medium: {},
            large: {hand:{width:1.5, length:12, margin:26}},
            huge: {hand:{width:2, length:12, margin:28}},
        }] - A set of available presets. Presets
 *   are a functionality of {@link Widget}.
 */
export const Knob = defineClass({
  Extends: Widget,
  _options: Object.assign(
    {},
    Widget.getOptionTypes(),
    Circular.getOptionTypes(),
    DragValue.getOptionTypes(),
    {
      reset: 'number',
      bind_dblclick: 'boolean',
    }
  ),
  options: Object.assign({}, Circular.getDefaultOptions(), {
    hand: { width: 1, length: 10, margin: 25 },
    margin: 13,
    thickness: 6,
    step: 1,
    shift_up: 4,
    shift_down: 0.25,
    dots_defaults: { length: 6, margin: 13.5, width: 1 },
    markers_defaults: { thickness: 2, margin: 11 },
    labels_defaults: {
      margin: 12,
      align: 'outer',
      format: function (val) {
        return val;
      },
    },
    direction: 'polar',
    rotation: 45,
    blind_angle: 20,
    basis: 300,
    preset: 'medium',
    presets: {
      tiny: {
        margin: 0,
        thickness: 4,
        hand: { width: 1, length: 6, margin: 8 },
        dots_defaults: { length: 4, margin: 0.5, width: 1 },
        markers_defaults: { thickness: 2, margin: 0 },
        show_labels: false,
      },
      small: {
        margin: 8,
        thickness: 4.5,
        hand: { width: 1, length: 8, margin: 17 },
        dots_defaults: { length: 4.5, margin: 8.5, width: 1 },
        markers_defaults: { thickness: 2, margin: 8 },
        labels_defaults: { margin: 9 },
        show_labels: true,
      },
      medium: {
        margin: 13,
        thickness: 6,
        hand: { width: 1, length: 10, margin: 25 },
        dots_defaults: { length: 6, margin: 13.5, width: 1 },
        markers_defaults: { thickness: 2, margin: 11 },
        show_labels: true,
      },
      large: {
        margin: 13,
        thickness: 6,
        hand: { width: 1.5, length: 12, margin: 26 },
        dots_defaults: { length: 6, margin: 13.5, width: 1 },
        markers_defaults: { thickness: 2, margin: 11 },
        show_labels: true,
      },
      huge: {
        margin: 13,
        thickness: 6,
        hand: { width: 2, length: 12, margin: 28 },
        dots_defaults: { length: 6, margin: 13.5, width: 1 },
        markers_defaults: { thickness: 2, margin: 11 },
        show_labels: true,
      },
    },
    bind_dblclick: true,
  }),
  static_events: {
    dblclick: dblClick,
  },
  initialize: function (options) {
    if (!options.element) options.element = element('div');
    Widget.prototype.initialize.call(this, options);
    options = this.options;
    let S;
    /**
     * @member {HTMLDivElement} Knob#element - The main DIV container.
     *   Has class <code>.aux-knob</code>.
     */

    /**
     * @member {SVGImage} Knob#svg - The main SVG image.
     */
    this.svg = S = makeSVG('svg');

    let co = objectAnd(options, Circular.getOptionTypes());
    co = objectSub(co, Widget.getOptionTypes());
    co.container = S;

    /**
     * @member {Circular} Knob#circular - The {@link Circular} module.
     */
    this.circular = new Circular(co);

    /**
     * @member {DragValue} Knob#drag - Instance of {@link DragValue} used for the
     *   interaction.
     */
    this.drag = new DragValue(this, {
      node: S,
      classes: this.element,
      range: moduleRange,
      direction: options.direction,
      rotation: options.rotation,
      blind_angle: options.blind_angle,
      limit: true,
    });
    this.drag.on('startdrag', () => this.startInteracting());
    this.drag.on('stopdrag', () => this.stopInteracting());
    /**
     * @member {ScrollValue} Knob#scroll - Instance of {@link ScrollValue} used for the
     *   interaction.
     */
    this.scroll = new ScrollValue(this, {
      node: S,
      classes: this.element,
      range: moduleRange,
      limit: true,
    });
    this.scroll.on('scrollstarted', () => this.startInteracting());
    this.scroll.on('scrollended', () => this.stopInteracting());

    this.set('base', options.base);
    if (options.reset === void 0) options.reset = options.value;
    this.addChild(this.circular);
  },

  getRange: function () {
    return this.circular;
  },

  draw: function (O, element) {
    addClass(element, 'aux-knob');
    element.appendChild(this.svg);

    Widget.prototype.draw.call(this, O, element);
  },

  destroy: function () {
    this.drag.destroy();
    this.scroll.destroy();
    this.circular.destroy();
    Widget.prototype.destroy.call(this);
  },

  resize: function () {
    const rect = this.element.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    this.set('size', size);
  },

  redraw: function () {
    const I = this.invalid;
    const O = this.options;

    if (I.size) {
      I.size = false;
      this.svg.setAttribute('viewBox', formatViewbox(O.size, O.size));
    }

    Widget.prototype.redraw.call(this);
  },
  /**
   * This is an alias for {@link Circular#addLabel} of the internal
   * circular instance.
   *
   * @method Knob#addLabel
   */
  addLabel: function (x) {
    return this.circular.addLabel(x);
  },

  /**
   * This is an alias for {@link Circular#removeLabel} of the internal
   * circular instance.
   *
   * @method Knob#removeLabel
   */
  removeLabel: function (x) {
    this.circular.removeLabel(x);
  },

  set: function (key, value) {
    if (key === 'base') {
      if (value === false) value = this.options.min;
    }
    // Circular does the snapping
    if (!Widget.getOptionTypes()[key]) {
      if (Circular.getOptionTypes()[key]) value = this.circular.set(key, value);
      if (DragValue.getOptionTypes()[key]) this.drag.set(key, value);
    }
    return Widget.prototype.set.call(this, key, value);
  },
});

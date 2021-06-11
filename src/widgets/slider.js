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
 * @event Slider#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { defineClass } from '../widget_helpers.js';
import { Widget } from './widget.js';
import { DragValue } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { Ranged } from '../implements/ranged.js';
import { warning } from '../utils/warning.js';
import { element, addClass, outerWidth, outerHeight } from '../utils/dom.js';
import { warn } from '../utils/log.js';

function dblClick() {
  this.userset('value', this.options.reset);
  /**
   * Is fired when the slider receives a double click in order to reset to initial value.
   *
   * @event Slider#doubleclick
   *
   * @param {number} value - The value of the widget.
   */
  this.emit('doubleclick', this.options.value);
}

function setBackground(horiz, vert, size) {
  const E = this.element;
  E.style['background-position'] = '-' + horiz + 'px -' + vert + 'px';

  E.style['-webkit-background-size'] = size;
  E.style['-moz-background-size'] = size;
  E.style['-ms-background-size'] = size;
  E.style['-o-background-size'] = size;
  E.style['background-size'] = size;
}
/**
 * Slider is a {@link Widget} moving its background image
 * according to its value. It can be used to show strips of
 * e.g. 3D-rendered faders or knobs. It's important to set the
 * width and height of the widget in CSS according to the frames in
 * the background file. If alignment is `horizontal` the background image
 * is as height as the widget, the width keeps the ratio intact. Overall
 * width of the image should be frames * width. If alignment is `vertical`
 * the background image is as wide as the widget and the height of the
 * image keeps the ratio intact. The height should be height of widget
 * times the number of frames.
 * Slider uses {@link DragValue} and {@link ScrollValue}
 * for setting its value.
 * It inherits all options of {@link DragValue} and {@link Ranged}.
 *
 * @class Slider
 *
 * @extends Widget
 *
 * @mixes Ranged
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.value=0] - The current value.
 * @property {Integer} [options.frames=1] - The amount of frames contained
 *     in the background image.
 * @property {String} [options.alignment="horizontal"] - The direction
 *     of the frames in the image, next to (`horizontal`) or among each other (`vertical`).
 * @property {String|Booelan} [options.image=false] - The image containing all frames for the slider.
 *     Set to `false` to set the background image via external CSS.
 *
 */
export const Slider = defineClass({
  Extends: Widget,
  Implements: Ranged,
  _options: Object.assign(
    Object.create(Widget.prototype._options),
    Ranged.prototype._options,
    DragValue.prototype._options,
    {
      value: 'number',
      frames: 'int',
      alignment: 'string',
      image: 'string|boolean',
      _width: 'number',
      _height: 'number',
    }
  ),
  options: {
    value: 0,
    frames: 1,
    alignment: 'horizontal',
    image: false,

    direction: 'polar',
    rotation: 45,
    blind_angle: 20,
    basis: 300,
  },
  static_events: {
    dblclick: dblClick,
  },
  initialize: function (options) {
    if (!options.element) options.element = element('div');
    Widget.prototype.initialize.call(this, options);
    options = this.options;

    const E = this.element;

    /**
     * @member {HTMLDivElement} Slider#element - The main DIV container.
     *   Has class <code>.aux-slider</code>.
     */
    /**
     * @member {DragValue} Knob#drag - Instance of {@link DragValue} used for
     *   interaction.
     */
    this.drag = new DragValue(this, {
      node: E,
      classes: E,
      direction: this.options.direction,
      rotation: this.options.rotation,
      blind_angle: this.options.blind_angle,
    });
    /**
     * @member {ScrollValue} Knob#scroll - Instance of {@link ScrollValue} used for
     *   interaction.
     */
    this.scroll = new ScrollValue(this, {
      node: E,
      classes: E,
    });

    if (options.reset === void 0) options.reset = options.value;
  },

  destroy: function () {
    this.drag.destroy();
    this.scroll.destroy();
    Widget.prototype.destroy.call(this);
  },

  draw: function (O, element) {
    addClass(element, 'aux-slider');

    Widget.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    const I = this.invalid;
    const O = this.options;

    if (I.image) {
      I.image = false;
      if (O.image)
        this.element.style['background-image'] = "url('" + O.image + "')";
      else this.element.style['background-image'] = void 0;
      I.value = true;
    }

    if (I.value || I.alignment || O.frames) {
      I.value = false;
      I.alignment = false;
      I.frames = false;
      const transformation = O.transformation;
      const coef = transformation.valueToCoef(O.value);
      const frame = Math.round(Math.max(0, O.frames - 1) * coef);
      switch (O.alignment) {
        default:
          warn(
            "Unknown alignment, only 'vertical' and 'horizontal' are allowed"
          );
          break;
        case 'vertical':
          setBackground.call(this, 0, frame * O._width, '100% auto');
          break;
        case 'horizontal':
          setBackground.call(this, frame * O._height, 0, 'auto 100%');
          break;
      }
    }

    Widget.prototype.redraw.call(this);
  },

  resize: function () {
    this.set('_width', outerWidth(this.element));
    this.set('_height', outerHeight(this.element));
  },

  set: function (key, value) {
    switch (key) {
      case 'value':
        if (value > this.options.max || value < this.options.min)
          warning(this.element);
        value = this.snap_module.snap(value);
        break;
    }
    if (DragValue.prototype._options[key]) this.drag.set(key, value);
    return Widget.prototype.set.call(this, key, value);
  },
});

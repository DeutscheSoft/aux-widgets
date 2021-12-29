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
import { Widget } from './widget.js';
import { DragValue } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { warning } from '../utils/warning.js';
import { element, addClass, outerWidth, outerHeight } from '../utils/dom.js';
import {
  rangedOptionsDefaults,
  rangedOptionsTypes,
  makeRanged,
} from '../utils/make_ranged.js';
import { focusMoveDefault, announceFocusMoveKeys } from '../utils/keyboard.js';
import { warn } from '../utils/log.js';
import { defineRender } from '../renderer.js';

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

function setBackground(style, horiz, vert, size) {
  style['background-position'] = '-' + horiz + 'px -' + vert + 'px';
  style['-webkit-background-size'] = size;
  style['-moz-background-size'] = size;
  style['-ms-background-size'] = size;
  style['-o-background-size'] = size;
  style['background-size'] = size;
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
export class Slider extends Widget {
  static get _options() {
    return Object.assign(
      {},
      Widget.getOptionTypes(),
      rangedOptionsTypes,
      DragValue.getOptionTypes(),
      {
        value: 'number',
        frames: 'int',
        alignment: 'string',
        image: 'string|boolean',
        _width: 'number',
        _height: 'number',
      }
    );
  }

  static get options() {
    return Object.assign({}, rangedOptionsDefaults, {
      value: 0,
      frames: 1,
      alignment: 'horizontal',
      image: false,

      direction: 'polar',
      rotation: 45,
      blind_angle: 20,
      basis: 300,
      role: 'slider',
      tabindex: 0,
    });
  }

  static get static_events() {
    return {
      dblclick: dblClick,
      focus_move: focusMoveDefault(),
    };
  }

  static get renderers() {
    return [
      defineRender('image', function(image) {
        const style = this.element.style;
        if (image)
          style['background-image'] = "url('" + image + "')";
        else style['background-image'] = void 0;
      }),
      defineRender(
        [ 'value', 'alignment', 'frames', 'transformation', '_width', '_height', 'snap_module' ],
        function (value, alignment, frames, transformation, _width, _height, snap_module) {
          value = snap_module.snap(value);

          const coef = transformation.valueToCoef(value);
          const frame = Math.round(Math.max(0, frames - 1) * coef);
          const style = this.element.style;

          switch (alignment) {
            default:
              warn(
                "Unknown alignment, only 'vertical' and 'horizontal' are allowed"
              );
              break;
            case 'vertical':
              setBackground(style, 0, frame * _width, '100% auto');
              break;
            case 'horizontal':
              setBackground(style, frame * _height, 0, 'auto 100%');
              break;
          }
        }
      ),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
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
  }

  destroy() {
    this.drag.destroy();
    this.scroll.destroy();
    super.destroy();
  }

  draw(O, element) {
    addClass(element, 'aux-slider');
    announceFocusMoveKeys.call(this);

    super.draw(O, element);
  }

  resize() {
    const E = this.element;
    this.set('_width', outerWidth(E));
    this.set('_height', outerHeight(E));
  }

  set(key, value) {
    if (key === 'value') {
      if (value > this.options.max || value < this.options.min)
        warning(this.element);
    }
    if (DragValue.hasOption(key)) this.drag.set(key, value);
    return super.set(key, value);
  }
}
makeRanged(Slider);

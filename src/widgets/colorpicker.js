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

import { defineChildElement } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { Container } from './container.js';
import { Value } from './value.js';
import { ValueKnob } from './valueknob.js';
import { Button } from './button.js';
import { Range } from '../modules/range.js';
import { DragValue } from '../modules/dragvalue.js';
import { addClass } from '../utils/dom.js';
import { FORMAT } from '../utils/sprintf.js';
import {
  RGBToBW,
  RGBToHex,
  RGBToHSL,
  HSLToRGB,
  hexToRGB,
} from '../utils/colors.js';
import { defineRender } from '../renderer.js';

const color_options = [
  'rgb',
  'hsl',
  'hex',
  'hue',
  'saturation',
  'lightness',
  'red',
  'green',
  'blue',
];

function checkInput(e) {
  const I = this.hex.element;
  if (e.keyCode && e.keyCode === 13) {
    apply.call(this);
    return;
  }
  if (e.keyCode && e.keyCode === 27) {
    cancel.call(this);
    return;
  }
  if (I.value.substring(0, 1) === '#') I.value = I.value.substring(1);
  if (e.type === 'paste' && I.value.length === 3) {
    I.value =
      I.value[0] +
      I.value[0] +
      I.value[1] +
      I.value[1] +
      I.value[2] +
      I.value[2];
  }
  if (I.value.length === 6) {
    this.set('hex', I.value);
  }
}
function cancel() {
  /**
   * Is fired whenever the cancel button gets clicked or ESC is hit on input.
   *
   * @event ColorPicker#cancel
   */
  fEvent.call(this, 'cancel');
}
function apply() {
  /**
   * Is fired whenever the apply button gets clicked or return is hit on input.
   *
   * @event ColorPicker#apply
   * @param {object} colors - Object containing all color objects: `rgb`, `hsl`, `hex`, `hue`, `saturation`, `lightness`, `red`, `green`, `blue`
   */
  fEvent.call(this, 'apply', true);
}

function fEvent(e, useraction) {
  const O = this.options;
  if (useraction) {
    this.emit('userset', 'rgb', O.rgb);
    this.emit('userset', 'hsl', O.hsl);
    this.emit('userset', 'hex', O.hex);
    this.emit('userset', 'hue', O.hue);
    this.emit('userset', 'saturation', O.saturation);
    this.emit('userset', 'lightness', O.lightness);
    this.emit('userset', 'red', O.red);
    this.emit('userset', 'green', O.green);
    this.emit('userset', 'blue', O.blue);
  }
  this.emit(e, {
    rgb: O.rgb,
    hsl: O.hsl,
    hex: O.hex,
    hue: O.hue,
    saturation: O.saturation,
    lightness: O.lightness,
    red: O.red,
    green: O.green,
    blue: O.blue,
  });
}

const color_atoms = {
  hue: 'hsl',
  saturation: 'hsl',
  lightness: 'hsl',
  red: 'rgb',
  green: 'rgb',
  blue: 'rgb',
};

function setAtoms(key) {
  const O = this.options;
  const atoms = Object.keys(color_atoms);
  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i];
    if (key !== atom) {
      O[atom] = O[color_atoms[atom]][atom.substring(0, 1)];
      this[atom].set('value', O[atom]);
    }
  }
  if (key !== 'hex') O.hex = RGBToHex(O.rgb);
}

/**
 * ColorPicker provides a collection of widgets to select a color in
 * RGB or HSL color space.
 *
 * @class ColorPicker
 *
 * @extends Container
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {object} [hsl={h:0, s:0.5, l:0}] - An object containing members `h`ue, `s`aturation and `l`ightness as numerical values.
 * @property {object} [rgb={r:0, r:0, b:0}] - An object containing members `r`ed, `g`reen and `b`lue as numerical values.
 * @property {string} [hex=000000] - A HEX color value, either with or without leading `#`.
 * @property {number} [hue=0] - A numerical value 0..1 for the hue.
 * @property {number} [saturation=0] - A numerical value 0..1 for the saturation.
 * @property {number} [lightness=0] - A numerical value 0..1 for the lightness.
 * @property {number} [red=0] - A numerical value 0..255 for the amount of red.
 * @property {number} [green=0] - A numerical value 0..255 for the amount of green.
 * @property {number} [blue=0] - A numerical value 0..255 for the amount of blue.
 * @property {boolean} [show_hue=true] - Set to `false` to hide the {@link ValueKnob} for hue.
 * @property {boolean} [show_saturation=true] - Set to `false` to hide the {@link ValueKnob} for saturation.
 * @property {boolean} [show_lightness=true] - Set to `false` to hide the {@link ValueKnob} for lightness.
 * @property {boolean} [show_red=true] - Set to `false` to hide the {@link ValueKnob} for red.
 * @property {boolean} [show_green=true] - Set to `false` to hide the {@link ValueKnob} for green.
 * @property {boolean} [show_blue=true] - Set to `false` to hide the {@link ValueKnob} for blue.
 * @property {boolean} [show_hex=true] - Set to `false` to hide the {@link Value} for the HEX color.
 * @property {boolean} [show_apply=true] - Set to `false` to hide the {@link Button} to apply.
 * @property {boolean} [show_cancel=true] - Set to `false` to hide the {@link Button} to cancel.
 * @property {boolean} [show_canvas=true] - Set to `false` to hide the color canvas.
 * @property {boolean} [show_grayscale=true] - Set to `false` to hide the grayscale.
 * @property {boolean} [show_indicator=true] - Set to `false` to hide the color indicator.
 */

export class ColorPicker extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), {
      hsl: 'object',
      rgb: 'object',
      hex: 'string',
      hue: 'number',
      saturation: 'number',
      lightness: 'number',
      red: 'number',
      green: 'number',
      blue: 'number',
    });
  }

  static get options() {
    return {
      hsl: { h: 0, s: 0.5, l: 0 },
      rgb: { r: 0, g: 0, b: 0 },
      hex: '000000',
      hue: 0,
      saturation: 0.5,
      lightness: 0,
      red: 0,
      green: 0,
      blue: 0,
    };
  }

  static get renderers() {
    return [
      defineRender(
        [
          'saturation',
          'hue',
          'lightness',
          'hex',
          'rgb',
          'red',
          'green',
          'blue',
        ],
        function (saturation, hue, lightness, hex, rgb, red, green, blue) {
          const { _indicator } = this;
          const _hex = this.hex;

          const bw = RGBToBW(rgb);
          const bg =
            'rgb(' +
            parseInt(red) +
            ',' +
            parseInt(green) +
            ',' +
            parseInt(blue) +
            ')';

          _hex._input.style.backgroundColor = bg;
          _hex._input.style.color = bw;
          _hex.set('value', hex);

          _indicator.style.left = hue * 100 + '%';
          _indicator.style.top = lightness * 100 + '%';
          _indicator.style.backgroundColor = bg;
          _indicator.style.color = bw;
          this._grayscale.style.opacity = 1 - saturation;
        }
      ),
    ];
  }

  initialize(options) {
    super.initialize(options);
    options = this.options;

    /** @member {HTMLDivElement} ColorPicker#element - The main DIV container.
     * Has class <code>.aux-colorpicker</code>.
     */

    /**
     * @member {Range} ColorPicker#range_x - The {@link Range} for the x axis.
     */
    this.range_x = new Range({
      min: 0,
      max: 1,
    });

    /**
     * @member {Range} ColorPicker#range_y - The {@link Range} for the y axis.
     */
    this.range_y = new Range({
      min: 0,
      max: 1,
      reverse: true,
    });

    /**
     * @member {Range} ColorPicker#drag_x - The {@link DragValue} for the x axis.
     */
    this.drag_x = new DragValue(this, {
      range: function () {
        return this.range_x;
      }.bind(this),
      get: function () {
        return this.parent.options.hue;
      },
      set: function (v) {
        this.parent.userset('hue', this.parent.range_x.snap(v));
      },
      direction: 'horizontal',
      cursor: false,
      onstartcapture: function (e) {
        if (e.start.target.classList.contains('aux-indicator')) return;
        const ev = e.stouch ? e.stouch : e.start;
        const x = ev.clientX - this.parent._canvas.getBoundingClientRect().left;
        this.parent.set('hue', this.options.range().pixelToValue(x));
      },
    });
    /**
     * @member {Range} ColorPicker#drag_y - The {@link DragValue} for the y axis.
     */
    this.drag_y = new DragValue(this, {
      range: function () {
        return this.range_y;
      }.bind(this),
      get: function () {
        return this.parent.options.lightness;
      },
      set: function (v) {
        this.parent.userset('lightness', this.parent.range_y.snap(v));
      },
      direction: 'vertical',
      cursor: false,
      onstartcapture: function (e) {
        if (e.start.target.classList.contains('aux-indicator')) return;
        const ev = e.stouch ? e.stouch : e.start;
        const y = ev.clientY - this.parent._canvas.getBoundingClientRect().top;
        this.parent.set('lightness', 1 - this.options.range().pixelToValue(y));
      },
    });
  }

  getResizeTargets() {
    return [this._canvas];
  }

  resize() {
    const rect = this._canvas.getBoundingClientRect();
    this.range_x.set('basis', rect.width);
    this.range_y.set('basis', rect.height);
  }

  draw(O, element) {
    addClass(element, 'aux-colorpicker');

    super.draw(O, element);
  }

  destroy() {
    this.drag_x.destroy();
    this.drag_y.destroy();
    super.destroy();
  }

  set(key, value) {
    const O = this.options;
    if (color_options.indexOf(key) > -1) {
      switch (key) {
        case 'rgb':
          O.hsl = RGBToHSL(value);
          break;
        case 'hsl':
          O.rgb = HSLToRGB(value);
          break;
        case 'hex':
          O.rgb = hexToRGB(value);
          O.hsl = RGBToHSL(O.rgb);
          break;
        case 'hue':
          O.hsl = {
            h: Math.min(1, Math.max(0, value)),
            s: O.saturation,
            l: O.lightness,
          };
          O.rgb = HSLToRGB(O.hsl);
          break;
        case 'saturation':
          O.hsl = {
            h: O.hue,
            s: Math.min(1, Math.max(0, value)),
            l: O.lightness,
          };
          O.rgb = HSLToRGB(O.hsl);
          break;
        case 'lightness':
          O.hsl = {
            h: O.hue,
            s: O.saturation,
            l: Math.min(1, Math.max(0, value)),
          };
          O.rgb = HSLToRGB(O.hsl);
          break;
        case 'red':
          O.rgb = {
            r: Math.min(255, Math.max(0, value)),
            g: O.green,
            b: O.blue,
          };
          O.hsl = RGBToHSL(O.rgb);
          break;
        case 'green':
          O.rgb = { r: O.red, g: Math.min(255, Math.max(0, value)), b: O.blue };
          O.hsl = RGBToHSL(O.rgb);
          break;
        case 'blue':
          O.rgb = {
            r: O.red,
            g: O.green,
            b: Math.min(255, Math.max(0, value)),
          };
          O.hsl = RGBToHSL(O.rgb);
          break;
      }
      setAtoms.call(this, key, value);
    }
    return super.set(key, value);
  }
}

/**
 * @member {HTMLDivElement} ColorPicker#canvas - The color background.
 *   Has class .aux-canvas`,
 */
defineChildElement(ColorPicker, 'canvas', {
  show: true,
  append: function () {
    this.element.appendChild(this._canvas);
    this.drag_x.set('node', this._canvas);
    this.drag_y.set('node', this._canvas);
  },
});
/**
 * @member {HTMLDivElement} ColorPicker#grayscale - The grayscale background.
 *   Has class .aux-grayscale`,
 */
defineChildElement(ColorPicker, 'grayscale', {
  show: true,
  append: function () {
    this._canvas.appendChild(this._grayscale);
  },
});
/**
 * @member {HTMLDivElement} ColorPicker#indicator - The indicator element.
 *   Has class .aux-indicator`,
 */
defineChildElement(ColorPicker, 'indicator', {
  show: true,
  append: function () {
    this._canvas.appendChild(this._indicator);
  },
});

/**
 * @member {Value} ColorPicker#hex - The {@link Value} for the HEX color.
 *   Has class .aux-hex`,
 */
defineChildWidget(ColorPicker, 'hex', {
  create: Value,
  show: true,
  static_events: {
    userset: function (key, val) {
      if (key === 'value') this.parent.userset('hex', val);
    },
    keyup: function (e) {
      checkInput.call(this.parent, e);
    },
    paste: function (e) {
      checkInput.call(this.parent, e);
    },
  },
  default_options: {
    format: FORMAT('%s'),
    class: 'aux-hex',
    set: function (v) {
      let p = 0,
        tmp;
      if (v[0] === '#') v = v.substring(1);
      while (v.length < 6) {
        tmp = v.slice(0, p + 1);
        tmp += v[p];
        tmp += v.slice(p + 1);
        v = tmp;
        p += 2;
      }
      return v;
    },
    size: 7,
    maxlength: 7,
  },
  map_options: {
    hex: 'value',
  },
  inherit_options: true,
});

/**
 * @member {ValueKnob} ColorPicker#hue - The {@link ValueKnob} for the hue.
 *   Has class .aux-hue`,
 */
defineChildWidget(ColorPicker, 'hue', {
  create: ValueKnob,
  option: 'show_hsl',
  show: true,
  static_events: {
    userset: function (key, val) {
      if (key === 'value') this.parent.userset('hue', val);
    },
  },
  default_options: {
    label: 'Hue',
    min: 0,
    max: 1,
    class: 'aux-hue',
    'value.format': function (v) {
      return v.toFixed(2);
    },
    layout: 'left',
  },
  map_options: {
    hue: 'value',
  },
  inherit_options: true,
  blacklist_options: ['x', 'y', 'value'],
});
/**
 * @member {ValueKnob} ColorPicker#saturation - The {@link ValueKnob} for the saturation.
 *   Has class .aux-saturation`,
 */
defineChildWidget(ColorPicker, 'saturation', {
  create: ValueKnob,
  show: true,
  static_events: {
    userset: function (key, val) {
      if (key === 'value') this.parent.userset('saturation', val);
    },
  },
  default_options: {
    label: 'Saturation',
    min: 0,
    max: 1,
    class: 'aux-saturation',
    'value.format': function (v) {
      return v.toFixed(2);
    },
    layout: 'left',
  },
  map_options: {
    saturation: 'value',
  },
  inherit_options: true,
  blacklist_options: ['x', 'y', 'value'],
});
/**
 * @member {ValueKnob} ColorPicker#lightness - The {@link ValueKnob} for the lightness.
 *   Has class .aux-lightness`,
 */
defineChildWidget(ColorPicker, 'lightness', {
  create: ValueKnob,
  option: 'show_hsl',
  show: true,
  static_events: {
    userset: function (key, val) {
      if (key === 'value') this.parent.userset('lightness', val);
    },
  },
  default_options: {
    label: 'Lightness',
    min: 0,
    max: 1,
    class: 'aux-lightness',
    'value.format': function (v) {
      return v.toFixed(2);
    },
    layout: 'left',
  },
  map_options: {
    lightness: 'value',
  },
  inherit_options: true,
  blacklist_options: ['x', 'y', 'value'],
});
/**
 * @member {ValueKnob} ColorPicker#red - The {@link ValueKnob} for the red color.
 *   Has class .aux-red`,
 */
defineChildWidget(ColorPicker, 'red', {
  create: ValueKnob,
  option: 'show_rgb',
  show: true,
  static_events: {
    userset: function (key, val) {
      if (key === 'value') this.parent.userset('red', val);
    },
  },
  default_options: {
    label: 'Red',
    min: 0,
    max: 255,
    snap: 1,
    'value.format': function (v) {
      return parseInt(v);
    },
    set: function (v) {
      return Math.round(v);
    },
    class: 'aux-red',
    layout: 'right',
  },
  map_options: {
    red: 'value',
  },
  inherit_options: true,
  blacklist_options: ['x', 'y', 'value'],
});
/**
 * @member {ValueKnob} ColorPicker#green - The {@link ValueKnob} for the green color.
 *   Has class .aux-green`,
 */
defineChildWidget(ColorPicker, 'green', {
  create: ValueKnob,
  option: 'show_rgb',
  show: true,
  static_events: {
    userset: function (key, val) {
      if (key === 'value') this.parent.userset('green', val);
    },
  },
  default_options: {
    label: 'Green',
    min: 0,
    max: 255,
    snap: 1,
    'value.format': function (v) {
      return parseInt(v);
    },
    set: function (v) {
      return Math.round(v);
    },
    class: 'aux-green',
    layout: 'right',
  },
  map_options: {
    green: 'value',
  },
  inherit_options: true,
  blacklist_options: ['x', 'y', 'value'],
});
/**
 * @member {ValueKnob} ColorPicker#blue - The {@link ValueKnob} for the blue color.
 *   Has class .aux-blue`,
 */
defineChildWidget(ColorPicker, 'blue', {
  create: ValueKnob,
  option: 'show_rgb',
  show: true,
  static_events: {
    userset: function (key, val) {
      if (key === 'value') this.parent.userset('blue', val);
    },
  },
  default_options: {
    label: 'Blue',
    min: 0,
    max: 255,
    snap: 1,
    'value.format': function (v) {
      return parseInt(v);
    },
    set: function (v) {
      return Math.round(v);
    },
    class: 'aux-blue',
    layout: 'right',
  },
  map_options: {
    blue: 'value',
  },
  inherit_options: true,
  blacklist_options: ['x', 'y', 'value'],
});
/**
 * @member {Button} ColorPicker#apply - The {@link Button} to apply.
 *   Has class .aux-apply`,
 */
defineChildWidget(ColorPicker, 'apply', {
  create: Button,
  show: true,
  static_events: {
    click: function () {
      apply.call(this.parent);
    },
  },
  default_options: {
    label: 'Apply',
    class: 'aux-apply',
  },
});
/**
 * @member {Button} ColorPicker#cancel - The {@link Button} to cancel.
 *   Has class .aux-cancel`,
 */
defineChildWidget(ColorPicker, 'cancel', {
  create: Button,
  show: true,
  static_events: {
    click: function () {
      cancel.call(this.parent);
    },
  },
  default_options: {
    label: 'Cancel',
    class: 'aux-cancel',
  },
});

// This has to happen after all children are initialized
ColorPicker.addStaticEvent('initialized', function () {
  const options = {};
  color_options.forEach((name) => {
    if (this.options[name] !== this.getDefault(name)) {
      options[name] = this.options[name];
    }
  });
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key))
      this.set(key, options[key]);
  }
});

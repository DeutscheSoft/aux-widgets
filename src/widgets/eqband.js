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
import { Filter } from '../modules/filter.js';
import { ChartHandle } from './charthandle.js';
import { addClass, toggleClass } from '../utils/dom.js';
import { warn } from '../utils/log.js';

const type_to_mode = {
  parametric: 'circular',
  notch: 'line-vertical',
  lowpass1: 'block-right',
  lowpass2: 'block-right',
  lowpass3: 'block-right',
  lowpass4: 'block-right',
  highpass1: 'block-left',
  highpass2: 'block-left',
  highpass3: 'block-left',
  highpass4: 'block-left',
  'low-shelf': 'line-vertical',
  'high-shelf': 'line-vertical',
};

const type_to_pref = {
  parametric: ['left', 'top', 'right', 'bottom'],
  notch: ['left', 'right', 'top', 'bottom'],
  lowpass1: [
    'left',
    'top-left',
    'bottom-left',
    'right',
    'top-right',
    'bottom-right',
    'top',
    'bottom',
  ],
  lowpass2: [
    'left',
    'top-left',
    'bottom-left',
    'right',
    'top-right',
    'bottom-right',
    'top',
    'bottom',
  ],
  lowpass3: [
    'left',
    'top-left',
    'bottom-left',
    'right',
    'top-right',
    'bottom-right',
    'top',
    'bottom',
  ],
  lowpass4: [
    'left',
    'top-left',
    'bottom-left',
    'right',
    'top-right',
    'bottom-right',
    'top',
    'bottom',
  ],
  highpass1: [
    'right',
    'top-right',
    'bottom-right',
    'left',
    'top-left',
    'bottom-left',
    'top',
    'bottom',
  ],
  highpass2: [
    'right',
    'top-right',
    'bottom-right',
    'left',
    'top-left',
    'bottom-left',
    'top',
    'bottom',
  ],
  highpass3: [
    'right',
    'top-right',
    'bottom-right',
    'left',
    'top-left',
    'bottom-left',
    'top',
    'bottom',
  ],
  highpass4: [
    'right',
    'top-right',
    'bottom-right',
    'left',
    'top-left',
    'bottom-left',
    'top',
    'bottom',
  ],
  'low-shelf': ['left', 'right', 'top', 'bottom'],
  'high-shelf': ['left', 'right', 'top', 'bottom'],
};

export const EqBand = defineClass({
  /**
   * An EqBand extends a {@link ChartHandle} and holds a
   * dependent {@link Filter}. It is used as a fully functional representation
   * of a single equalizer band in {@link Equalizer} EqBand needs a {@link Chart}
   * or any other derivate to be drawn in.
   *
   * @class EqBand
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {String|Function} [options.type="parametric"] - The type of the filter.
   *   Possible values are <code>parametric</code>, <code>notch</code>,
   *   <code>low-shelf</code>, <code>high-shelf</code>, <code>lowpass[n]</code> or
   *   <code>highpass[n]</code>.
   * @property {Number} options.freq - Frequency setting. This is an alias for the option <code>x</code>
   *   defined by {@link ChartHandle}.
   * @property {Number} options.gain - Gain setting. This is an alias for the option <code>y</code>
   *   defined by {@link ChartHandle}.
   * @property {Number} options.q - Quality setting. This is an alias for the option <code>z</code>
   *   defined by {@link ChartHandle}.
   * @property {Boolean} [options.active=true] - Set to `false` to not take this filter into account when drawing the response graph.
   *
   * @extends ChartHandle
   */
  Extends: ChartHandle,
  _options: Object.assign(Object.create(ChartHandle.prototype._options), {
    type: 'string|function',
    gain: 'number',
    freq: 'number',
    x: 'number',
    y: 'number',
    z: 'number',
    q: 'number',
    active: 'boolean',
  }),
  options: {
    type: 'parametric',
    active: true,
  },
  static_events: {
    set_freq: function (v) {
      this.set('x', v);
    },
    set_gain: function (v) {
      this.set('y', v);
    },
    set_q: function (v) {
      this.set('z', v);
    },
    useraction: function (k, v) {
      if (k === 'x') this.set('freq', v);
      if (k === 'y') this.set('gain', v);
      if (k === 'z') this.set('q', v);
    },
  },

  initialize: function (options) {
    /**
     * @member {Filter} EqBand#filter - The filter providing the graphical calculations.
     */
    ChartHandle.prototype.initialize.call(this, options);

    this.filter = new Filter({
      type: this.get('type'),
    });

    const mode = this.get('mode');
    this.set('type', this.get('type'));
    if (mode) this.set('mode', this.get('mode'));

    /**
     * @member {HTMLDivElement} EqBand#element - The main SVG group.
     *   Has class <code>.aux-eqband</code>.
     */
    ['freq', 'gain', 'q'].forEach((name) => {
      if (name in options) {
        this.set(name, options[name]);
      }
    });
    this.filter.reset();
  },
  draw: function (O, element) {
    addClass(element, 'aux-eqband');

    ChartHandle.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    const I = this.invalid;
    const O = this.options;
    if (I.active) {
      I.active = false;
      toggleClass(this.element, 'aux-inactive', !O.active);
    }
    ChartHandle.prototype.redraw.call(this);
  },

  /**
   * Calculate the gain for a given frequency in Hz.
   *
   * @method EqBand#frequencyToGain
   *
   * @param {number} freq - The frequency.
   *
   * @returns {number} The gain at the given frequency.
   */
  frequencyToGain: function (freq) {
    return this.filter.getFrequencyToGain()(freq);
  },

  // GETTER & SETTER
  set: function (key, value) {
    switch (key) {
      case 'type':
        if (typeof value === 'string') {
          const mode = type_to_mode[value];
          const pref = type_to_pref[value];
          if (!mode) {
            warn('Unsupported type:', value);
            return;
          }
          this.set('mode', mode);
          this.set('preferences', pref);
          this.set('show_axis', mode === 'line-vertical');
        }
        this.filter.set('type', value);
        break;
      case 'freq':
      case 'gain':
      case 'q':
        value = this.filter.set(key, value);
        break;
      //case "x":
      //value = this.options.range_x.snap(value);
      //break;
      //case "y":
      //value = this.options.range_y.snap(value);
      //break;
      //case "z":
      //value = this.options.range_z.snap(value);
      //break;
    }
    return ChartHandle.prototype.set.call(this, key, value);
  },
});

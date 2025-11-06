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

import { Filter } from '../modules/filter.js';
import { ChartHandle } from './charthandle.js';
import { addClass, toggleClass } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import { defineRender } from '../renderer.js';

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
  null: 'circular',
};

const type_to_pref = {
  parametric: [
    'left',
    'top',
    'right',
    'bottom',
    'top-left',
    'top-right',
    'bottom-right',
    'bottom-left',
  ],
  notch: [
    'left',
    'right',
    'top',
    'bottom',
    'top-left',
    'top-right',
    'bottom-right',
    'bottom-left',
  ],
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
  null: ['left'],
};

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
export class EqBand extends ChartHandle {
  static get _options() {
    return {
      type: 'string|function',
      gain: 'number',
      freq: 'number',
      x: 'number',
      y: 'number',
      z: 'number',
      q: 'number',
      active: 'boolean',
    };
  }

  static get options() {
    return {
      type: 'parametric',
      active: true,
    };
  }

  static get static_events() {
    return {
      set_freq: function (v) {
        this.update('x', v);
      },
      set_gain: function (v) {
        this.update('y', v);
      },
      set_q: function (v) {
        this.update('z', v);
      },
      userset: function (k, v) {
        switch (k) {
          case 'x':
            this.userset('freq', v);
            return false;
          case 'y':
            this.userset('gain', v);
            return false;
          case 'z':
            this.userset('q', v);
            return false;
        }
      },
    };
  }

  static get renderer() {
    return [
      defineRender('active', function (active) {
        toggleClass(this.element, 'aux-inactive', !active);
      }),
    ];
  }

  initialize(options) {
    /**
     * @member {Filter} EqBand#filter - The filter providing the graphical calculations.
     */
    super.initialize(options);

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
  }

  draw(O, element) {
    addClass(element, 'aux-eqband');

    super.draw(O, element);
  }

  /**
   * Calculate the gain for a given frequency in Hz.
   *
   * @method EqBand#frequencyToGain
   *
   * @param {number} freq - The frequency.
   *
   * @returns {number} The gain at the given frequency.
   */
  frequencyToGain(freq) {
    return this.filter.getFrequencyToGain()(freq);
  }

  // GETTER & SETTER
  set(key, value) {
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
    }
    return super.set(key, value);
  }
}

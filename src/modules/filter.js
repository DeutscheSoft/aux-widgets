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

import { Base } from '../implements/base.js';
import { error } from '../utils/log.js';
import { standardBiquadFilters } from '../utils/biquad.js';

function triggerReset() {
  this.reset();
}

/**
 * Interface implemented by all Equalizer filters. This interface implements one
 * method which calculates the frequency response of the filter.
 *
 * @interface EqFilter
 */
/**
 * Calculates the frequency response of the filter, e.g. the effective change in
 * gain applied by this filter to a signal of a certain frequency.
 *
 * @method EqFilter#frequencyToGain
 *
 * @param {number} frequency - The frequency in Hz.
 * @returns {number} gain - The change in gain in dB.
 */
/**
 * @callback Filter~filter_factory
 *
 * Returns a EqFilter object for a given set of parameters. This method will be
 * called by the Equalizer to update the filter objects when its parameters
 * have changed.
 *
 * @param {Object} options - The filter parameters.
 * @param {number} options.freq - The current frequency, i.e. the x position in
 *      the equalizer graph.
 * @param {number} options.gain - The current gain, i.e. the y position in the
 *      equalizer graph.
 * @param {number} options.q - The Q of the filter, i.e. the z position in the
 *      equalizer graph.
 * @param {number} options.sample_rate - The sample rate.
 *
 * @return {EqFilter}
 */
/**
 * Filter provides the math for calculating a gain from
 * a given frequency for different types of biquad filters.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String|Function} [options.type="parametric"] - The type of
 *  filter. This can either be a function which implements the
 *  {@link Filter~filter_factory} interface or a string naming one of the
 *  standard filters in
 *  {@link module:utils/biquad.StandardBiquadFilters|StandardBiquadFilters}.
 * @property {Number} [options.freq=1000] - The initial frequency.
 * @property {Number} [options.gain=0] - The initial gain.
 * @property {Number} [options.q=1] - The initial Q of the filter.
 * @property {Number} [options.sample_rate=44100] - The sample rate.
 *
 * @class Filter
 *
 * @extends Base
 */

/**
 * Returns the gain for a given frequency
 *
 * @method Filter#frequencyToGain
 *
 * @param {number} frequency - The frequency to calculate the gain for.
 *
 * @returns {number} gain - The gain at the given frequency.
 */

export class Filter extends Base {
  static get _options() {
    return {
      type: 'string|function',
      freq: 'number',
      gain: 'number',
      q: 'number',
      sample_rate: 'number',
    };
  }

  static get options() {
    return {
      type: 'parametric',
      freq: 1000,
      gain: 0,
      q: 1,
      sample_rate: 44100,
    };
  }

  static get static_events() {
    return {
      set_freq: triggerReset,
      set_type: triggerReset,
      set_q: triggerReset,
      set_gain: triggerReset,
      initialized: triggerReset,
    };
  }

  createFrequencyToGain() {
    const O = this.options;
    let factory;

    if (typeof O.type === 'string') {
      factory = standardBiquadFilters[O.type];

      if (!factory) {
        error('Unknown standard filter: ' + O.type);
        return;
      }
    } else if (typeof O.type === 'function') {
      factory = O.type;
    } else {
      error("Unsupported option 'type'.");
      return;
    }

    let filter = factory(O);

    if (typeof filter === 'object') {
      filter = filter.freq2gain;
    }

    this.frequencyToGain = filter;
  }

  getFrequencyToGain() {
    if (this.frequencyToGain === null) this.createFrequencyToGain();
    return this.frequencyToGain;
  }

  reset() {
    this.frequencyToGain = null;
    /**
     * Is fired when a filters drawing function is reset.
     *
     * @event Filter#reset
     */
    this.emit('reset');
  }
}

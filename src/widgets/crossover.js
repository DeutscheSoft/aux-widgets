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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */
import { define_class } from '../widget_helpers.js';
import { add_class } from '../utils/dom.js';
import { error } from '../utils/log.js';
import { sprintf } from '../utils/sprintf.js';
import { EqualizerGraph, Equalizer } from './equalizer.js';
import { EqBand } from './eqband.js';
import { Filter } from '../modules/filter.js';

export const CrossoverBand = define_class({
  /**
   * CrossoverBand is a {@link EqBand} with an additional filter.
   *
   * @param {Object} [options={ }] - An object containing additional options.
   *
   * @property {String|Function} [lower="lowpass3"] - The type of filter for the range below cutoff frequency. See {@link EqBand} for more information.
   * @property {String|Function} [upper="highpass3"] - The type of filter for the range above cutoff frequency. See {@link EqBand} for more information.
   * @property {Function} [format_label=function (t, x, y, z) { return sprintf("%.2f Hz", x); }] - The function formatting the handles label.
   *
   * @class CrossoverBand
   *
   * @extends EqBand
   */
  Extends: EqBand,
  _options: Object.assign(Object.create(EqBand.prototype._options), {
    lower: 'string|function',
    upper: 'string|function',
  }),
  options: {
    lower: 'lowpass3',
    upper: 'highpass3',
    format_label: function (t, x /*, y, z*/) {
      return sprintf('%.2f Hz', x);
    },
    mode: 'line-vertical', // undocumented, just a default differing from ChartHandle
    preferences: [
      'top-right',
      'right',
      'bottom-right',
      'top-left',
      'left',
      'bottom-left',
    ], // undocumented, just a default differing from ChartHandle
  },
  static_events: {
    set_lower: function (val) {
      this.lower.set('type', val);
      this.set('mode', 'line-vertical');
    },
    set_upper: function (val) {
      this.upper.set('type', val);
      this.set('mode', 'line-vertical');
    },
  },
  initialize: function (options) {
    EqBand.prototype.initialize.call(this, options);
    /**
     * @member {Filter} CrossoverBand#upper - The filter providing the graphical calculations for the upper graph.
     */
    this.upper = new Filter();
    /**
     * @member {Filter} CrossoverBand#lower - The filter providing the graphical calculations for the lower graph.
     */
    this.lower = this.filter;
    this.filter.on('set_freq', (v) => {
      this.upper.set('freq', v);
    });
    this.filter.on('set_gain', (v) => {
      this.upper.set('gain', v);
    });
    this.filter.on('set_q', (v) => {
      this.upper.set('q', v);
    });
    this.upper.set('freq', this.lower.get('freq'));
    this.upper.set('gain', this.lower.get('gain'));
    this.upper.set('q', this.lower.get('q'));
    /**
     * @member {HTMLDivElement} CrossoverBand#element - The main SVG group.
     *   Has class <code>.aux-crossoverband</code>.
     */

    this.set('lower', this.options.lower);
    this.set('upper', this.options.upper);
  },
  draw: function (O, element) {
    add_class(element, 'aux-crossoverband');

    EqBand.prototype.draw.call(this, O, element);
  },
});

export const CrossoverGraph = define_class({
  Extends: EqualizerGraph,
  _options: Object.assign(Object.create(EqualizerGraph.prototype._options), {
    index: 'number',
  }),
  option: {
    index: -1,
  },
  getFilterFunctions: function () {
    const bands = this.options.bands;
    const index = this.options.index;

    // sort bands by frequency
    bands.sort(function (a, b) {
      return a.options.freq - b.options.freq;
    });

    const filters = [];

    if (index < bands.length) {
      filters.push(bands[index].lower.get_freq2gain());
    }

    if (index > 0) {
      filters.push(bands[index - 1].upper.get_freq2gain());
    }

    return filters;
  },
});

function sort_bands() {
  this.bands.sort(function (a, b) {
    return a.options.freq - b.options.freq;
  });
}

function unlimit_bands() {
  this.bands.forEach((band) => {
    band.set('x_min', false);
    band.set('x_max', false);
  });
}

/*
 * Limit the movement of bands based on the frequency in a given band.
 */
function limit_band(bands, i, distance) {
  const band = bands[i];
  const prev = i ? bands[i - 1] : null;
  const next = i + 1 < bands.length ? bands[i + 1] : null;

  if (prev) {
    const x_distance = distance * band.get('freq');
    const x_max = band.get('freq') - x_distance;
    prev.set('x_max', x_max);
    band.set('x_min', prev.get('freq') + x_distance);
  } else {
    band.set('x_min', false);
  }

  if (!next) {
    band.set('x_max', false);
  }
}

function limit_bands() {
  if (this.options.leap) return;
  sort_bands.call(this);

  const distance = Math.abs(this.get('distance'));
  for (var i = 0; i < this.bands.length; i++)
    limit_band(this.bands, i, distance);
}

function set_freq(band) {
  if (this.options.leap) return;
  var i = this.bands.indexOf(band);
  if (i < 0) {
    error('Band no member of crossover');
    return;
  }
  const distance = Math.abs(this.get('distance'));
  limit_band(this.bands, i, distance);
}

export const Crossover = define_class({
  /**
   * Crossover is a {@link Equalizer} displaying the response
   * of a multi-band crossover filter. Crossover  uses {@link CrossoverBand}
   * as response handles.
   *
   * @class Crossover
   *
   * @extends Equalizer
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Boolean} [options.leap=true] - Define if bands are allowed to leap over each other.
   * @property {Number} [options.distance=0] - Set a minimal distance between bands. This has no effect
   *   is `leap=true`. The value is interpreted as a factor of the frequency
   *   of the next band, e.g. if distance is `0.2` and a band is at `1kHz`, then a second lower
   *   band cannot be moved beyond `800Hz`.
   */
  Extends: Equalizer,
  _options: Object.assign(Object.create(Equalizer.prototype._options), {
    leap: 'boolean',
    distance: 'number',
  }),
  options: {
    range_y: { min: -60, max: 12, scale: 'linear' },
    leap: true,
    distance: 0,
  },
  static_events: {
    set_leap: function (v) {
      (v ? unlimit_bands : limit_bands).call(this);
    },
    set_distance: limit_bands,
    initialized: function () {
      this.set('leap', this.options.leap);
      this.set('distance', this.options.distance);
    },
  },
  initialize: function (options) {
    Equalizer.prototype.initialize.call(this, options);
    /**
     * @member {HTMLDivElement} Equalizer#element - The main DIV container.
     *   Has class <code>.aux-crossover</code>.
     */

    var self = this;
    this.set_freq_cb = function () {
      set_freq.call(self, this);
    };
    this.remove_child(this.baseline);
    const graph = this.add_graph(new CrossoverGraph({ index: 0 }));
    this.crossover_graphs = [graph];
  },
  draw: function (O, element) {
    add_class(element, 'aux-crossover');

    Equalizer.prototype.draw.call(this, O, element);
  },
  add_child: function (child) {
    Equalizer.prototype.add_child.call(this, child);
    if (child instanceof CrossoverBand) {
      // add this band to all crossover graphs
      this.crossover_graphs.forEach((g) => g.add_band(child));
      child.on('set_freq', this.set_freq_cb);
      limit_bands.call(this);
      // add an additional crossover graph
      const graph = this.add_graph(
        new CrossoverGraph({ index: this.crossover_graphs.length })
      );
      this.crossover_graphs.push(graph);
    } else if (child instanceof CrossoverGraph) {
      // add all bands to this crossover
      this.children
        .filter((child) => child instanceof CrossoverBand)
        .forEach((band) => child.add_band(band));
    }
  },
  remove_child: function (child) {
    Equalizer.prototype.remove_child.call(this, child);
    if (child instanceof CrossoverBand) {
      const graph = this.crossover_graphs.pop();
      this.remove_graph(graph);
      child.off('set_freq', this.set_freq_cb);
      limit_bands.call(this);
      this.crossover_graphs.forEach((g) => g.remove_band(child));
    } else if (child instanceof CrossoverGraph) {
      this.children
        .filter((child) => child instanceof CrossoverBand)
        .forEach((band) => child.remove_band(band));
    }
  },
  add_band: function (options, type) {
    let band;

    if (options instanceof CrossoverBand) {
      band = options;
    } else {
      type = type || CrossoverBand;
      band = new type(options);
    }
    this.add_child(band);
    return band;
  },
});

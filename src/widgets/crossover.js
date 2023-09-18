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

import { addClass } from '../utils/dom.js';
import { error } from '../utils/log.js';
import { sprintf } from '../utils/sprintf.js';
import { EqualizerGraph, Equalizer } from './equalizer.js';
import { EqBand } from './eqband.js';
import { Filter } from '../modules/filter.js';

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
export class CrossoverBand extends EqBand {
  static get _options() {
    return {
      lower: 'string|function',
      upper: 'string|function',
    };
  }

  static get options() {
    return {
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
    };
  }

  static get static_events() {
    return {
      set_lower: function (val) {
        this.lower.set('type', val);
        this.set('mode', 'line-vertical');
      },
      set_upper: function (val) {
        this.upper.set('type', val);
        this.set('mode', 'line-vertical');
      },
    };
  }

  initialize(options) {
    super.initialize(options);
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
  }

  draw(O, element) {
    addClass(element, 'aux-crossoverband');

    super.draw(O, element);
  }
}

export class CrossoverGraph extends EqualizerGraph {
  static get _options() {
    return {
      index: 'number',
    };
  }

  static get options() {
    return {
      index: -1,
    };
  }

  getFilterFunctions() {
    const { bands, index } = this.options;

    // sort bands by frequency
    bands.sort(function (a, b) {
      return a.options.freq - b.options.freq;
    });

    const filters = [];

    if (index < bands.length) {
      filters.push(bands[index].lower.getFrequencyToGain());
    }

    if (index > 0) {
      filters.push(bands[index - 1].upper.getFrequencyToGain());
    }

    return filters;
  }
}

function sortBands() {
  this.getBands().sort(function (a, b) {
    return a.options.freq - b.options.freq;
  });
}

function unlimitBands() {
  this.getBands().forEach((band) => {
    band.set('x_min', false);
    band.set('x_max', false);
  });
}

/*
 * Limit the movement of bands based on the frequency in a given band.
 */
function limitBand(bands, i, distance) {
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

function limitBands() {
  if (this.options.leap) return;
  sortBands.call(this);

  const distance = Math.abs(this.get('distance'));
  const bands = this.getBands();

  for (let i = 0; i < bands.length; i++) limitBand(bands, i, distance);
}

function setFreq(band) {
  if (this.options.leap) return;
  const bands = this.getBands();
  const i = bands.indexOf(band);
  if (i < 0) {
    error('Band no member of crossover');
    return;
  }
  const distance = Math.abs(this.get('distance'));
  limitBand(bands, i, distance);
}

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
export class Crossover extends Equalizer {
  static get _options() {
    return Object.assign({}, Equalizer.getOptionTypes(), {
      leap: 'boolean',
      distance: 'number',
    });
  }

  static get options() {
    return {
      range_y: { min: -60, max: 12, scale: 'linear' },
      leap: true,
      distance: 0,
    };
  }

  static get static_events() {
    return {
      set_leap: function (v) {
        (v ? unlimitBands : limitBands).call(this);
      },
      set_distance: limitBands,
      initialized: function () {
        this.set('leap', this.options.leap);
        this.set('distance', this.options.distance);
      },
    };
  }

  initialize(options) {
    super.initialize(options);
    /**
     * @member {HTMLDivElement} Equalizer#element - The main DIV container.
     *   Has class <code>.aux-crossover</code>.
     */

    const self = this;
    this.set_freq_cb = function () {
      setFreq.call(self, this);
    };
    this.removeChild(this.baseline);
    this.addGraph(new CrossoverGraph());
  }

  draw(O, element) {
    addClass(element, 'aux-crossover');

    super.draw(O, element);
  }

  getCrossoverBands() {
    return this.getChildren().filter((child) => child instanceof CrossoverBand);
  }

  getCrossoverGraphs() {
    return this.getChildren().filter(
      (child) => child instanceof CrossoverGraph
    );
  }

  addChild(child) {
    super.addChild(child);
    if (child instanceof CrossoverBand) {
      // add this band to all crossover graphs
      const bands = this.getCrossoverBands();
      this.getCrossoverGraphs().forEach((graph) => graph.set('bands', bands));
      child.on('set_freq', this.set_freq_cb);
      limitBands.call(this);
      // add an additional crossover graph
      this.addGraph(new CrossoverGraph());
    } else if (child instanceof CrossoverGraph) {
      child.set('bands', this.getCrossoverBands());
      child.set('index', this.getCrossoverGraphs().indexOf(child));
    }
  }

  removeChild(child) {
    if (this.isDestructed()) return;
    super.removeChild(child);
    if (child instanceof CrossoverBand) {
      const graphs = this.getCrossoverGraphs();
      const bands = this.getCrossoverBands();

      // Adjust the number of graphs to match.
      if (graphs.length > bands.length + 1) {
        const count = graphs.length - bands.length - 1;

        for (let i = graphs.length - count; i < graphs.length; i++) {
          this.removeChild(graphs[i]);
        }
      }

      child.off('set_freq', this.set_freq_cb);
      limitBands.call(this);
      this.getCrossoverGraphs().forEach((graph) => graph.set('bands', bands));
    } else if (child instanceof CrossoverGraph) {
      child.set('bands', []);
      child.set('index', this.getCrossoverGraphs().length - 1);
      this.getCrossoverGraphs().forEach((graph, index) =>
        graph.set('index', index)
      );
    }
  }

  addBand(options, type) {
    let band;

    if (options instanceof CrossoverBand) {
      band = options;
    } else {
      type = type || CrossoverBand;
      band = new type(options);
    }
    this.addChild(band);
    return band;
  }

  empty() {
    this.getCrossoverBands().forEach((band) => this.removeChild(band));
    super.empty();
    this.addGraph(new CrossoverGraph());
  }
}

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

import { Chart } from './chart.js';
import { addClass, removeClass } from '../utils/dom.js';
import { warn } from '../utils/log.js';

function rangeSet(value, key) {
  this.range_x.set(key, value);
  this.range_y.set(key, value);
}

function dragHandle(key, value) {
  if (key == 'z') {
    this.userset('ratio', value);
    return true;
  }
  if (key == 'y') {
    this.userset('threshold', value);
  }
  return false;
}

/**
 * Dynamics are based on {@link Chart} and display the characteristics of dynamic
 * processors. They are square widgets drawing a {@link Grid} automatically based on
 * the range.
 *
 * @class Dynamics
 *
 * @extends Chart
 *
 * @property {Number} [options.min=-96] - Minimum decibels to display.
 * @property {Number} [options.max=24] - Maximum decibels to display.
 * @property {String} [options.scale="linear"] - Scale of the display, see {@link Range} for details.
 * @property {String} [options.type=false] - Type of the dynamics: <code>compressor</code>, <code>expander</code>, <code>gate</code>, <code>limiter</code> or <code>false</code> to draw your own graph.
 * @property {Number} [options.threshold=0] - Threshold of the dynamics.
 * @property {Number} [options.ratio=1] - Ratio of the dynamics.
 * @property {Number} [options.makeup=0] - Makeup of the dynamics. This raises the whole graph after all other property are applied.
 * @property {Number} [options.range=0] - Range of the dynamics. Only used in type <code>expander</code>. The maximum gain reduction.
 * @property {Number} [options.gain=0] - Input gain of the dynamics.
 * @property {Number} [options.reference=0] - Input reference of the dynamics.
 * @property {Number} [options.knee=0] - Soft knee width of the compressor in dB.
 *   Replaces the hard knee of the compressor at the salient point by a
 *   quadratic curve.
 * @property {Function} [options.grid_labels=function (val) { return val + (!val ? "dB":""); }] - Callback to format the labels of the {@link Grid}.
 * @property {Number} [options.db_grid=12] - Draw a grid line every [n] decibels.
 * @property {Boolean} [options.show_handle=true] - Draw a handle to manipulate threshold and ratio.
 * @property {Boolean|Function} [options.format_label=false] - Function to format the handle label.
 */
export class Dynamics extends Chart {
  static get _options() {
    return Object.assign({}, Chart.getOptionTypes(), {
      min: 'number',
      max: 'number',
      scale: 'string',
      type: 'string',
      threshold: 'number',
      ratio: 'number',
      makeup: 'number',
      range: 'number',
      gain: 'number',
      reference: 'number',
      knee: 'number',
      grid_labels: 'function',
      db_grid: 'number',
      show_handle: 'boolean',
      handle_label: 'boolean|function',
    });
  }

  static get options() {
    return {
      db_grid: 12,
      min: -96,
      max: 24,
      scale: 'linear',
      type: false,
      threshold: 0,
      ratio: 1,
      makeup: 0,
      range: -200,
      gain: 0,
      reference: 0,
      knee: 0,
      grid_labels: function (val) {
        return val + (!val ? 'dB' : '');
      },
      show_handle: true,
      handle_label: false,
      square: true,
    };
  }

  static get static_events() {
    return {
      set_min: rangeSet,
      set_max: rangeSet,
      set_scale: rangeSet,
      set_threshold: function (v) {
        this.handle.set('x', v);
        this.handle.set('y', v);
      },
      set_ratio: function (v) {
        this.handle.set('z', v);
      },
      set_handle_label: function (v) {
        this.handle.set('format_label', v);
      },
      set_show_handle: function (v) {
        this.handle.set('visible', v);
      },
    };
  }

  initialize(options) {
    super.initialize(options, true);
    const O = this.options;
    /**
     * @member {HTMLDivElement} Dynamics#element - The main DIV container.
     *   Has class <code>.aux-dynamics</code>.
     */
    this.set('scale', O.scale);
    if (O.size) this.set('size', O.size);
    this.set('min', O.min);
    this.set('max', O.max);
    /**
     * @member {Graph} Dynamics#steady - The graph drawing the zero line. Has class <code>.aux-steady</code>
     */
    this.steady = this.addGraph({
      dots: [
        { x: O.min, y: O.min },
        { x: O.max, y: O.max },
      ],
      class: 'aux-steady',
      mode: 'line',
    });
    /**
     * @member {ChartHandle} Dynamics#handle - The handle to set threshold. Has class <code>.aux-handle</code>
     */
    this.handle = this.addHandle({
      range_x: this.range_x,
      range_y: this.range_y,
      range_z: this.range_z,
    });
    this.handle.addEventListener('userset', dragHandle.bind(this));

    this.set('handle_label', this.options.handle_label);
    this.set('show_handle', this.options.show_handle);
    this.set('ratio', this.options.ratio);
    this.set('threshold', this.options.threshold);
  }

  draw(O, element) {
    addClass(element, 'aux-dynamics');

    super.draw(O, element);
  }

  redraw() {
    const O = this.options;
    const I = this.invalid;

    super.redraw();

    if (I.validate('size', 'min', 'max', 'scale')) {
      const grid_x = [];
      const grid_y = [];
      const min = this.range_x.get('min');
      const max = this.range_x.get('max');
      const step = O.db_grid;
      let cls;
      for (let i = min; i <= max; i += step) {
        cls = i ? '' : 'aux-highlight';
        grid_x.push({
          pos: i,
          label: i === min ? '' : O.grid_labels(i),
          class: cls,
        });
        grid_y.push({
          pos: i,
          label: i === min ? '' : O.grid_labels(i),
          class: cls,
        });
      }
      if (this.grid) {
        this.grid.set('grid_x', grid_x);
        this.grid.set('grid_y', grid_y);
      }

      if (this.steady)
        this.steady.set('dots', [
          { x: O.min, y: O.min },
          { x: O.max, y: O.max },
        ]);
    }

    if (I.type) {
      if (O._last_type) removeClass(this.element, 'aux-' + O._last_type);
      addClass(this.element, 'aux-' + O.type);
    }

    if (
      I.validate(
        'ratio',
        'threshold',
        'range',
        'makeup',
        'gain',
        'reference',
        'type',
        'knee'
      )
    ) {
      this.drawGraph();
    }
  }

  drawGraph() {
    const O = this.options;
    if (O.type === false) return;
    if (!this.graph) {
      this.graph = this.addGraph({
        dots: [
          { x: O.min, y: O.min },
          { x: O.max, y: O.max },
        ],
      });
    }
    const curve = [];
    const range = O.range;
    const ratio = O.ratio;
    const thres = O.threshold;
    const gain = O.gain;
    const ref = O.reference;
    const makeup = O.makeup;
    const min = O.min;
    const max = O.max;
    let s;
    if (ref == 0) {
      s = 0;
    } else if (!isFinite(ratio)) {
      s = ref;
    } else {
      s = (1 / (Math.max(ratio, 1.001) - 1)) * ratio * ref;
    }
    const l = 5; // estimated width of line. dirty workaround for
    // keeping the line end out of sight in case
    // salient point is outside the visible area
    switch (O.type) {
      case 'compressor': {
        const knee = O.knee;
        const sx = thres + gain - s;
        const sy = thres + makeup - s + ref;

        // entry point
        curve.push({ x: min - l, y: min + makeup - gain + ref - l });
        if (knee > 0) {
          const dy0 = 1;
          const dy1 = isFinite(ratio) ? 1 / ratio : 0;
          const w = knee / 2;

          curve.push({
            x: Math.max(min, sx - w),
            y: sy - w * dy0,
          });

          curve.push({
            type: 'Q',
            x1: sx,
            y1: sy,
            x: Math.min(max, sx + w),
            y: sy + w * dy1,
          });
        } else {
          // salient point
          curve.push({
            x: sx,
            y: sy,
          });
        }
        // exit point
        if (isFinite(ratio) && ratio > 0) {
          curve.push({
            x: max,
            y: thres + makeup + (max - thres - gain) / ratio,
          });
        } else if (ratio === 0) {
          curve.push({ x: thres, y: max });
        } else {
          curve.push({ x: max, y: thres + makeup });
        }

        break;
      }
      case 'limiter':
        curve.push({ x: min, y: min + makeup - gain });
        curve.push({ x: thres + gain, y: thres + makeup });
        curve.push({ x: max, y: thres + makeup });
        break;
      case 'gate':
        curve.push({ x: thres, y: min });
        curve.push({ x: thres, y: thres + makeup });
        curve.push({ x: max, y: max + makeup });
        break;
      case 'expander':
        if (O.ratio !== 1) {
          curve.push({ x: min, y: min + makeup + range });

          const y = (ratio * range + (ratio - 1) * thres) / (ratio - 1);
          curve.push({ x: y - range, y: y + makeup });
          curve.push({ x: thres, y: thres + makeup });
        } else curve.push({ x: min, y: min + makeup });
        curve.push({ x: max, y: max + makeup });
        break;
      default:
        warn('Unsupported type', O.type);
    }
    this.graph.set('dots', curve);
  }

  set(key, val) {
    if (key == 'type') this.options._last_type = this.options.type;
    if (key == 'ratio') val = this.range_z.snap(val);
    return super.set(key, val);
  }
}

/**
 * Compressor is a pre-configured {@link Dynamics} widget.
 * @extends Dynamics
 * @class Compressor
 */
export class Compressor extends Dynamics {
  static get options() {
    return { type: 'compressor' };
  }

  draw(O, element) {
    /**
     * @member {HTMLDivElement} Compressor#element - The main DIV container.
     *   Has class <code>.aux-compressor</code>.
     */
    addClass(element, 'aux-compressor');
    super.draw(O, element);
  }
}
/**
 * Expander is a pre-configured {@link Dynamics} widget.
 * @extends Dynamics
 * @class Expander
 */
export class Expander extends Dynamics {
  static get options() {
    return { type: 'expander' };
  }

  draw(O, element) {
    /**
     * @member {HTMLDivElement} Expander#element - The main DIV container.
     *   Has class <code>.aux-expander</code>.
     */
    addClass(element, 'aux-expander');
    super.draw(O, element);
  }
}
/**
 * Gate is a pre-configured {@link Dynamics} widget.
 * @extends Dynamics
 * @class Gate
 */
export class Gate extends Dynamics {
  static get options() {
    return { type: 'gate', range_z: { min: 1, max: 1 } };
  }

  draw(O, element) {
    /**
     * @member {HTMLDivElement} Gate#element - The main DIV container.
     *   Has class <code>.aux-gate</code>.
     */
    addClass(element, 'aux-gate');
    super.draw(O, element);
  }
}
/**
 * Limiter is a pre-configured {@link Dynamics} widget.
 * @extends Dynamics
 * @class Limiter
 */
export class Limiter extends Dynamics {
  static get options() {
    return { type: 'limiter', range_z: { min: 1, max: 1 } };
  }

  draw(O, element) {
    /**
     * @member {HTMLDivElement} Limiter#element - The main DIV container.
     *   Has class <code>.aux-limiter</code>.
     */
    addClass(element, 'aux-limiter');
    super.draw(O, element);
  }
}

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
import { defineRender, defineMeasure } from '../renderer.js';
import { defineChildWidget } from '../child_widget.js';
import { ChartHandle } from './charthandle.js';
import { Graph } from './graph.js';

function rangeSet(value, key) {
  this.range_x.set(key, value);
  this.range_y.set(key, value);
}

function dragHandle(key, value) {
  if (key === 'z') {
    this.parent.userset('ratio', value);
    return true;
  }
  if (key === 'y') {
    this.parent.userset('threshold', value);
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
    return {
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
    };
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
      role: 'application',
    };
  }

  static get static_events() {
    return {
      set_min: rangeSet,
      set_max: rangeSet,
      set_scale: rangeSet,
    };
  }

  static get renderers() {
    return [
      defineRender('type', function (type) {
        const element = this.element;
        removeClass(
          element,
          'aux-compressor',
          'aux-expander',
          'aux-gate',
          'aux-limiter'
        );
        addClass(element, 'aux-' + type);
      }),
      defineMeasure(['min', 'max', 'grid_labels', 'db_grid'], function (
        min,
        max,
        grid_labels,
        db_grid
      ) {
        const grid_x = [];
        const grid_y = [];
        let cls;
        for (let i = min; i <= max; i += db_grid) {
          cls = i ? '' : 'aux-highlight';
          grid_x.push({
            pos: i,
            label: i === min ? '' : grid_labels(i),
            class: cls,
          });
          grid_y.push({
            pos: i,
            label: i === min ? '' : grid_labels(i),
            class: cls,
          });
        }
        if (this.grid) {
          this.grid.set('grid_x', grid_x);
          this.grid.set('grid_y', grid_y);
        }

        if (this.steady)
          this.steady.set('dots', [
            { x: min, y: min },
            { x: max, y: max },
          ]);
      }),
      defineMeasure(
        [
          'type',
          'min',
          'max',
          'range',
          'ratio',
          'threshold',
          'gain',
          'reference',
          'makeup',
          'knee',
        ],
        function (
          type,
          min,
          max,
          range,
          ratio,
          threshold,
          gain,
          reference,
          makeup,
          knee
        ) {
          this.drawGraph();
        }
      ),
    ];
  }

  initialize(options) {
    super.initialize(options, true);
    const O = this.options;
    /**
     * @member {HTMLDivElement} Dynamics#element - The main DIV container.
     *   Has class <code>.aux-dynamics</code>.
     */
    this.set('scale', O.scale);
    this.set('min', O.min);
    this.set('max', O.max);

    this.set('handle_label', this.options.handle_label);
    this.set('show_handle', this.options.show_handle);
    this.set('ratio', this.options.ratio);
    this.set('threshold', this.options.threshold);
  }

  draw(O, element) {
    addClass(element, 'aux-dynamics');

    super.draw(O, element);
  }

  drawGraph() {
    if (!this.response) return;
    const {
      type,
      min,
      max,
      range,
      ratio,
      threshold,
      gain,
      reference,
      makeup,
      knee,
    } = this.options;
    if (type === false) return;
    const curve = [];
    let slope;
    if (reference === 0) {
      slope = 0;
    } else if (!isFinite(ratio)) {
      slope = reference;
    } else {
      slope = (1 / (Math.max(ratio, 1.001) - 1)) * ratio * reference;
    }
    const l = 5; // estimated width of line. dirty workaround for
    // keeping the line end out of sight in case
    // salient point is outside the visible area
    switch (type) {
      case 'compressor': {
        const sx = threshold + gain - slope;
        const sy = threshold + makeup - slope + reference;

        // entry point
        curve.push({ x: min - l, y: min + makeup - gain + reference - l });
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
            y: threshold + makeup + (max - threshold - gain) / ratio,
          });
        } else if (ratio === 0) {
          curve.push({ x: threshold, y: max });
        } else {
          curve.push({ x: max, y: threshold + makeup });
        }

        break;
      }
      case 'limiter':
        curve.push({ x: min, y: min + makeup - gain });
        curve.push({ x: threshold + gain, y: threshold + makeup });
        curve.push({ x: max, y: threshold + makeup });
        break;
      case 'gate':
        curve.push({ x: threshold, y: min });
        curve.push({ x: threshold, y: threshold + makeup });
        curve.push({ x: max, y: max + makeup });
        break;
      case 'expander':
        if (ratio !== 1) {
          curve.push({ x: min, y: min + makeup + range });

          const y = (ratio * range + (ratio - 1) * threshold) / (ratio - 1);
          curve.push({ x: y - range, y: y + makeup });
          curve.push({ x: threshold, y: threshold + makeup });
        } else curve.push({ x: min, y: min + makeup });
        curve.push({ x: max, y: max + makeup });
        break;
      default:
        warn('Unsupported type', type);
    }
    this.response.set('dots', curve);
  }

  set(key, val) {
    if (key === 'type') this.options._last_type = this.options.type;
    if (key === 'ratio') val = this.range_z.snap(val);
    return super.set(key, val);
  }
}

/**
 * @member {ChartHandle} Dynamics#handle - The handle to set threshold. Has class <code>.aux-handle</code>
 */
defineChildWidget(Dynamics, 'handle', {
  create: ChartHandle,
  show: true,
  map_options: {
    threshold: ['x', 'y'],
    ratio: 'z',
    handle_label: 'format_label',
    show_handle: 'visible',
  },
  default_options: {
    class: 'aux-handle',
    min_size: 24,
    max_size: 80,
  },
  static_events: {
    userset: dragHandle,
  },
});
/**
 * @member {Graph} Dynamics#steady - The graph drawing the zero line. Has class <code>.aux-steady</code>
 */
defineChildWidget(Dynamics, 'steady', {
  create: Graph,
  show: true,
  default_options: {
    class: 'aux-steady',
    mode: 'line',
  },
});
/**
 * @member {Graph} Dynamics#response - The graph drawing the dynamics response. Has class <code>.aux-response</code>
 */
defineChildWidget(Dynamics, 'response', {
  create: Graph,
  show: true,
  default_options: {
    class: 'aux-response',
  },
});

function dragRatio(key, y) {
  if (key !== 'y') return;

  const parent = this.parent;
  const thres = parent.get('threshold');
  const ratio_x = parent.get('ratio_x');
  const max = parent.get('max');

  const num = max - thres - (max - ratio_x);
  const R = num / (y - thres);

  const r_min = parent.range_z.get('min');
  const r_max = parent.range_z.get('max');

  parent.userset('ratio', Math.min(r_max, Math.max(r_min, R)));

  return false;
}

function setRatio() {
  if (!this.ratio) return;

  const thres = this.get('threshold');
  const ratio = this.get('ratio');
  const ratio_x = this.get('ratio_x');
  const max = this.get('max');

  const num = max - thres - (max - ratio_x);
  const Y = thres + num / ratio;
  this.ratio.set('y', Y);
}

function setRatioLimits() {
  if (!this.ratio) return;

  const thres = this.get('threshold');
  const ratio_x = this.get('ratio_x');
  const max = this.get('max');
  const r_min = this.range_z.get('min');
  const r_max = this.range_z.get('max');

  const num = max - thres - (max - ratio_x);

  this.ratio.set('y_max', thres + num / r_min);
  this.ratio.set('y_min', thres + num / r_max);
}

/**
 * Compressor is a pre-configured {@link Dynamics} widget.
 * @extends Dynamics
 * @class Compressor
 * @property {Boolean} [options.show_ratio=true] - Show the ratio handle.
 * @property {Boolean|Function} [options.ratio_label=false] - Function to format the label of the ratio. False for no label.
 * @property {Number} [options.ratio_x=12] - X position of the ratio handle.
 */
export class Compressor extends Dynamics {
  static get _options() {
    return {
      show_ratio: 'boolean',
      ratio_label: 'boolean|function',
      ratio_x: 'number',
    };
  }

  static get options() {
    return {
      type: 'compressor',
      show_ratio: true,
      ratio_label: false,
      ratio_x: 12,
    };
  }

  static get static_events() {
    return {
      set_ratio_x: function (v) {
        setRatio.call(this);
        setRatioLimits.call(this);
      },
      set_threshold: function (v) {
        setRatio.call(this);
        setRatioLimits.call(this);
      },
      set_ratio: function (v) {
        setRatio.call(this);
      },
      set_min: function (v) {
        setRatio.call(this);
        setRatioLimits.call(this);
      },
      set_max: function (v) {
        setRatio.call(this);
        setRatioLimits.call(this);
      },
    };
  }

  initialize(options) {
    super.initialize(options);
    this.set('ratio_label', this.options.ratio_label);
    this.set('show_ratio', this.options.show_ratio);
    this.set('ratio_x', this.options.ratio_x);
    setRatio.call(this);
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
 * @member {ChartHandle} Compressor#ratio - The handle to set ratio. Has class <code>.aux-ratio</code>
 */
defineChildWidget(Compressor, 'ratio', {
  create: ChartHandle,
  show: true,
  map_options: {
    ratio_label: 'format_label',
    show_ratio: 'visible',
    ratio_x: ['x_min', 'x_max'],
  },
  default_options: {
    class: 'aux-ratio',
    min_size: 24,
    max_size: 24,
    range_z: { min: 1, max: 1 },
  },
  static_events: {
    userset: dragRatio,
  },
});

/**
 * Expander is a pre-configured {@link Dynamics} widget.
 * @extends Dynamics
 * @class Expander
 */
export class Expander extends Dynamics {
  static get _options() {
    return Dynamics.getOptionTypes();
  }
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
  static get _options() {
    return Dynamics.getOptionTypes();
  }
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
  static get _options() {
    return Dynamics.getOptionTypes();
  }
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

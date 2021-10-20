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
import { Graph } from './graph.js';
import { ChartHandle } from './charthandle.js';
import { addClass } from '../utils/dom.js';
import { defineChildWidget } from '../child_widget.js';
import { sprintf } from '../utils/sprintf.js';
import { defineRecalculation } from '../define_recalculation.js';

function setInputMode() {
  const O = this.options;
  let mode = 'circular';
  if (O.delay === false) mode = 'line-horizontal';
  if (O.input === false) mode = 'line-vertical';
  this.set('input_handle.mode', mode);
  this.input.set(
    'visible',
    O.show_input && O.delay !== false && O.input !== false
  );
}

function drawInput() {
  const O = this.options;
  this.input.set('dots', [
    {
      x: Math.min(O.delay_max, Math.max(O.delay_min, O.delay)),
      y: Math.min(O.gain_max, Math.min(O.gain_min, this.range_y.get('min'))),
    },
    {
      x: Math.min(O.delay_max, Math.max(O.delay_min, O.delay)),
      y: Math.min(O.gain_max, Math.max(O.gain_min, O.gain)),
    },
  ]);
}

function drawReverb() {
  const O = this.options;
  const rstart = O.delay + O.predelay;
  let x0 = rstart;
  const attack = Math.min(O.attack, O.predelay);

  Math.min(O.delay_max, Math.max(O.delay_min, O.delay));

  if (O.attack) {
    const rate = O.noisefloor / attack;
    x0 -= this.range_y.get('min') / rate;
  }
  const y0 = this.range_y.get('min');

  const x1 = rstart;
  const y1 = O.rlevel + O.gain;

  const rate = O.reference / O.rtime;

  const x2 =
    (this.range_y.get('min') - O.gain - O.rlevel) / rate + O.delay + O.predelay;
  const y2 = this.range_y.get('min');

  this.reverb.set('dots', [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ]);
}

function initValues(type, O) {
  this.set(type, O[type]);
  this.set(type + '_min', O[type + '_min']);
  this.set(type + '_max', O[type + '_max']);
}

function setReflections(reflections) {
  let R = [];

  if (Array.isArray(reflections)) {
    // reflections already is an array
    R = reflections;
  } else if (reflections) {
    // build reflections array from options object
    for (let i = 0, m = reflections.amount; i < m; ++i) {
      if (i) {
        R.push({
          time: reflections.spread * Math.random(),
          level: -reflections.randomness * Math.random(),
        });
      } else {
        R.push({
          time: reflections.spread,
          level: -reflections.randomness * Math.random(),
        });
      }
    }
  } else {
    // no reflections given
    R = [];
  }

  adjustReflections.call(this, R);
}

function adjustReflections(reflections) {
  const O = this.options;
  const R = O._reflections;

  for (let i = reflections.length, m = R.length; i < m; ++i) {
    const G = R[i].graph;
    this.removeGraph(G);
    G.destroy();
  }

  R.length = reflections.length;

  for (let i = 0, m = R.length; i < m; ++i) {
    if (typeof R[i] !== 'object') {
      R[i] = {
        level: 0,
        time: 0,
        graph: null,
      };
    }
    if (!R[i].graph) {
      R[i].graph = new Graph({
        range_x: this.range_x,
        range_y: this.range_y,
        class: 'aux-reflection',
      });
      this.addGraph(R[i].graph);
    }
    R[i].level = reflections[i].level;
    R[i].time = reflections[i].time;
  }

  this.invalidate('_reflections');
  this.triggerDraw();
}

function drawReflections() {
  const O = this.options;
  const R = O._reflections;

  for (let i = 0, m = R.length; i < m; ++i) {
    const y = this.range_y.get('min');
    const x = R[i].time + O.delay;
    R[i].graph.set('dots', [
      { x: x, y: y },
      { x: x, y: R[i].level + O.gain + O.erlevel },
    ]);
  }
}

/**
 * Reverb is a {@link Chart} with various handles to set and display
 * parameters of a typical classic reverb.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.timeframe=10000] - An alias for `range_x.max`, defining the maximum time of the chart.
 * @property {Number} [options.delay=0] - The initial delay of the input signal, not to be confused with predelay.
 * @property {Number} [options.delay_min=0] - The minimum delay.
 * @property {Number} [options.delay_max=2000] - The maximum delay.
 * @property {Number} [options.gain=0] - The gain for the input signal.
 * @property {Number} [options.gain_min=-60] - The minimum gain.
 * @property {Number} [options.gain_max=0] - The maximum gain.
 * @property {Number} [options.predelay=0] - The predelay of the diffuse reverb.
 * @property {Number} [options.predelay_min=0] - The minimum predelay.
 * @property {Number} [options.predelay_max=2000] - The maximum predelay.
 * @property {Number} [options.rlevel=0] - The level of the diffuse reverb.
 * @property {Number} [options.rlevel_min=-60] - The minimum reverb level.
 * @property {Number} [options.rlevel_max=0] - The maximum reverb level.
 * @property {Number} [options.rtime=0] - The duration of the diffuse reverb. This acts in conjunction with the `reference` option.
 * @property {Number} [options.rtime_min=0] - The minimum reverb time.
 * @property {Number} [options.rtime_max=5000] - The maximum reverb time.
 * @property {Number} [options.erlevel=0] - The level of the early reflections.
 * @property {Number} [options.erlevel_min=-60] - The minimum level of early reflections.
 * @property {Number} [options.erlevel_max=0] - The maximum level of early reflections.
 * @property {Number} [options.attack=0] - The attack time for the diffuse reverb.
 * @property {Number} [options.noisefloor=-96] - The noisefloor at which attack starts from.
 * @property {Number} [options.reference=-60] - The reference level for calculating the reverb time.
 * @property {Boolean} [options.show_input=true] - Draw the line showing the input signal.
 * @property {Boolean} [options.show_input_handle=true] - Show the handle defining input level and initial delay.
 * @property {Boolean} [options.show_rlevel_handle=true] - Show the handle defining reverb level and predelay.
 * @property {Boolean} [options.show_rtime_handle=true] - Show the handle defining the reverb time.
 * @property {Array|Object|Boolean} [options.reflections={amount: 0, spread: 0, randomness: 4}] - Defines reflections
 *   to be displayed. Either an array of objects `{time: n, level:n}` where time is in milliseconds,
 *   level in decibel or an object `{amount: n, spread: n, randomness: n}` where spread is a time
 *   in milliseconds to spread the reflections, randomness in decibels to randomize the levels and
 *   amount the number of reflections to be created. `false` disables drawing of the reflections.
 * @extends Chart
 *
 * @class Reverb
 */

export class Reverb extends Chart {
  static get _options() {
    return Object.assign({}, Chart.getOptionTypes(), {
      timeframe: 'number',

      delay: 'number',
      delay_min: 'number',
      delay_max: 'number',

      gain: 'number',
      gain_min: 'number',
      gain_max: 'number',

      predelay: 'number',
      predelay_min: 'number',
      predelay_max: 'number',

      rlevel: 'number',
      rlevel_min: 'number',
      rlevel_max: 'number',

      rtime: 'number',
      rtime_min: 'number',
      rtime_max: 'number',

      erlevel: 'number',
      erlevel_min: 'number',
      erlevel_max: 'number',

      attack: 'number',
      noisefloor: 'number',
      reference: 'number',

      show_input: 'boolean',

      reflections: 'boolean|array|object',
      _reflections: 'array',
    });
  }

  static get options() {
    return {
      range_x: { min: 0, max: 5000 },
      range_y: { min: -90, max: 10 },
      range_z: { min: 1, max: 1 },

      grid_x: [
        { pos: 0, label: '0ms' },
        { pos: 500, label: '500ms' },
        { pos: 1000, label: '1s' },
        { pos: 1500, label: '1.5s' },
        { pos: 2000, label: '2s' },
        { pos: 2500, label: '2.5s' },
        { pos: 3000, label: '3s' },
        { pos: 3500, label: '3.5s' },
        { pos: 4000, label: '4s' },
        { pos: 4500, label: '4.5s' },
        { pos: 5000, label: '5s' },
        { pos: 5500, label: '5.5s' },
        { pos: 6000, label: '6s' },
        { pos: 6500, label: '6.5s' },
        { pos: 7000, label: '7s' },
        { pos: 7500, label: '7.5s' },
        { pos: 8000, label: '8s' },
        { pos: 8500, label: '8.5s' },
        { pos: 9000, label: '9s' },
        { pos: 9500, label: '9.5s' },
        { pos: 10000, label: '10s' },
      ],

      grid_y: [
        { pos: -120, label: '-120dB' },
        { pos: -110, label: '-110dB' },
        { pos: -100, label: '-100dB' },
        { pos: -90, label: '-90dB' },
        { pos: -80, label: '-80dB' },
        { pos: -70, label: '-70dB' },
        { pos: -60, label: '-60dB' },
        { pos: -50, label: '-50dB' },
        { pos: -40, label: '-40dB' },
        { pos: -30, label: '-30dB' },
        { pos: -20, label: '-20dB' },
        { pos: -10, label: '-10dB' },
        { pos: 0, label: '0dB' },
      ],

      timeframe: 10000,

      delay: 0,
      delay_min: 0,
      delay_max: 2000,

      gain: 0,
      gain_min: -60,
      gain_max: 0,

      predelay: 0,
      predelay_min: 0,
      predelay_max: 2000,

      rlevel: 0,
      rlevel_min: -60,
      rlevel_max: 0,

      rtime: 0,
      rtime_min: 0,
      rtime_max: 5000,

      erlevel: 0,
      erlevel_min: -60,
      erlevel_max: 0,

      attack: 0,
      noisefloor: -96,
      reference: -60,

      show_predelay_handle: true,
      show_input: true,
      show_input_handle: true,
      show_rtime_handle: true,
      show_rlevel_handle: true,

      reflections: { amount: 0, spread: 0, randomness: 0 },
      _reflections: [],

      role: 'application',
    };
  }

  static get static_events() {
    return {
      set_timeframe: (v) => this.range_x.set('max', v),
      set_reflections: setReflections,
      set_delay: function (v) {
        setInputMode.call(this);
      },
      set_gain: function (v) {
        setInputMode.call(this);
      },
      set_predelay: function (v) {
        setInputMode.call(this);
      },
      set_rlevel: function (v) {
        setInputMode.call(this);
      },
      set_rtime: function (v) {
        setInputMode.call(this);
      },
    };
  }

  initialize(options) {
    super.initialize(options);

    /**
     * @member {Graph} Reverb#input - The {@link Graph} displaying the
     * input signal as a vertical bar.
     */
    this.input = new Graph({
      range_x: this.range_x,
      range_y: this.range_y,
      class: 'aux-input',
    });
    this.addGraph(this.input);

    /**
     * @member {Graph} Reverb#reverb - The {@link Graph} displaying the
     * reverb signal as a triagle.
     */
    this.reverb = new Graph({
      range_x: this.range_x,
      range_y: this.range_y,
      class: 'aux-reverb',
      mode: 'bottom',
    });
    this.addGraph(this.reverb);
  }

  draw(O, element) {
    addClass(element, 'aux-reverb');

    super.draw(O, element);

    initValues.call(this, 'delay', O);
    initValues.call(this, 'gain', O);
    initValues.call(this, 'predelay', O);
    initValues.call(this, 'rlevel', O);
    initValues.call(this, 'rtime', O);
    initValues.call(this, 'erlevel', O);

    this.set('reflections', O.reflections);
    this.set('show_input', O.show_input);
  }

  redraw() {
    const O = this.options;
    const I = this.invalid;

    super.redraw();

    if (I.show_input) {
      I.show_input = false;
      this.input.set('visible', O.show_input);
    }

    if (I.input || I.delay) {
      I.input = false; //keep delay for further tests
      drawInput.call(this);
      drawReverb.call(this);
    }

    if (I.validate('predelay', 'rlevel', 'rtime', 'attack') || I.gain) {
      drawReverb.call(this);
    }

    if (I.validate('reflections', 'erlevel', 'delay', 'gain')) {
      drawReflections.call(this);
    }
  }

  set(key, value) {
    if (key == 'reflections') {
      if (
        typeof value == 'object' &&
        typeof this.options.reflections == 'object'
      ) {
        value = this.options.reflections.concat(value);
      }
    }
    return super.set(key, value);
  }
}

function onInteractingChanged(value) {
  if (value) {
    this.parent.startInteracting();
  } else {
    this.parent.stopInteracting();
  }
}

/**
 * @member {ChartHandle} Reverb#input_handle - The {@link ChartHandle}
 *   displaying/setting the initial delay and gain.
 */
defineChildWidget(Reverb, 'input_handle', {
  create: ChartHandle,
  show: true,
  default_options: {
    format_label: function (label, x, y, z) {
      const O = this.options;
      const output = [];
      if (label) output.push(label);
      if (O.delay !== false) {
        if (x >= 1000) output.push(sprintf('%.2fs', x / 1000));
        else output.push(sprintf('%dms', x));
      }
      if (O.input !== false) {
        output.push(sprintf('%.2fdB', y));
      }
      return output.join('\n');
    },
    label: 'Input',
    mode: 'circular',
    active: true,
  },
  static_events: {
    set_interacting: onInteractingChanged,
    userset: function (key, value) {
      if (key == 'x') {
        this.parent.userset('delay', value);
        return false;
      }
      if (key == 'y') {
        this.parent.userset('gain', value);
        return false;
      }
    },
  },
});

/**
 * @member {ChartHandle} Reverb#rlevel_handle - The {@link ChartHandle}
 *   displaying/setting the pre delay and reverb level.
 */
defineChildWidget(Reverb, 'rlevel_handle', {
  create: ChartHandle,
  show: true,
  default_options: {
    format_label: function (label, x, y, z) {
      const O = this.parent.options;
      const output = [];
      if (label) output.push(label);
      if (O.delay !== false) {
        if (x >= 1000) output.push(sprintf('%.2fs', (x - O.delay) / 1000));
        else output.push(sprintf('%dms', x - O.delay));
      }
      if (O.rlevel !== false) {
        output.push(sprintf('%.2fdB', y - O.gain));
      }
      return output.join('\n');
    },
    label: 'Reverb',
    mode: 'circular',
    active: true,
  },
  static_events: {
    set_interacting: onInteractingChanged,
    userset: function (key, value) {
      const O = this.parent.options;
      if (key == 'x') {
        this.parent.userset('predelay', value - O.delay);
        return false;
      }
      if (key == 'y') {
        this.parent.userset('rlevel', value - O.gain);
        return false;
      }
    },
  },
});

/**
 * @member {ChartHandle} Reverb#rtime_handle - The {@link ChartHandle}
 *   displaying/setting the reverb time.
 */
defineChildWidget(Reverb, 'rtime_handle', {
  create: ChartHandle,
  show: true,
  default_options: {
    format_label: function (label, x, y, z) {
      const O = this.parent.options;
      const output = [];
      if (label) output.push(label);
      if (O.delay !== false) {
        if (x >= 1000)
          output.push(sprintf('%.2fs', (x - O.delay - O.predelay) / 1000));
        else output.push(sprintf('%dms', x - O.delay - O.predelay));
      }
      return output.join('\n');
    },
    label: 'Time',
    mode: 'line-vertical',
    active: true,
  },
  static_events: {
    set_interacting: onInteractingChanged,
    userset: function (key, value) {
      const O = this.parent.options;
      if (key == 'x') {
        this.parent.userset('rtime', value - O.delay - O.predelay);
        return false;
      }
    },
  },
});

function clip(min, max, value) {
  if (!(value >= min)) return min;

  if (!(value <= max)) return max;

  return value;
}

function defineClipCalculation(name) {
  defineRecalculation(Reverb, [name + '_min', name + '_max', name], function (
    O
  ) {
    this.update(name, clip(O[name + '_min'], O[name + '_max'], O[name]));
  });
}

defineClipCalculation('delay');
defineClipCalculation('predelay');
defineClipCalculation('rtime');
defineClipCalculation('gain');
defineClipCalculation('rlevel');

defineRecalculation(Reverb, ['delay', 'predelay', 'rtime'], function (O) {
  const { delay, predelay, rtime } = O;
  this.update('input_handle.x', delay);
  this.update('rlevel_handle.x', delay + predelay);
  this.update('rtime_handle.x', delay + predelay + rtime);
});
defineRecalculation(Reverb, ['gain', 'rlevel'], function (O) {
  const { gain, rlevel } = O;

  this.update('input_handle.y', gain);
  this.update('rlevel_handle.y', gain + rlevel);
});

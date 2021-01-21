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
import { Chart } from './chart.js';
import { Graph } from './graph.js';
import { ChartHandle } from './charthandle.js';
import { addClass, removeClass } from '../utils/dom.js';
import { defineChildWidget } from '../child_widget.js';
import { warn } from '../utils/log.js';
import { sprintf } from '../utils/sprintf.js';
import { defineRecalculation } from '../define_recalculation.js';

function setInputMode() {
  const O = this.options;
  let mode = 'circular';
  if (O.delay === false) mode = 'line-horizontal';
  if (O.input === false) mode = 'line-vertical';
  this.input_handle.set('mode', mode);
  this.input.set('visible', O.delay !== false && O.input !== false);
}

function dragInput(key, value) {
  const O = this.options;
  if (key == 'x') {
    this.userset('delay', value);
    return false;
  }
  if (key == 'y') {
    this.userset('gain', value);
    return false;
  }
}

function dragRLevel(key, value) {
  const O = this.options;
  if (key == 'x') {
    this.userset('predelay', value - O.delay);
    return false;
  }
  if (key == 'y') {
    this.userset('rlevel', value - O.gain);
    return false;
  }
}

function dragRTime(key, value) {
  const O = this.options;
  if (key == 'x') {
    this.userset('rtime', value - O.delay - O.predelay);
    return false;
  }
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
  const O = this.options;
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
  let R = O._reflections;

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
export const Reverb = defineClass({
  Extends: Chart,
  _options: Object.assign(Object.create(Chart.prototype._options), {
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

    show_input_handle: 'boolean',
    show_input: 'boolean',
    show_rlevel_handle: 'boolean',
    show_rtime_handle: 'boolean',

    reflections: 'boolean|array|object',
    _reflections: 'array',
  }),
  options: {
    range_x: { min: 0, max: 5000 },
    range_y: { min: -90, max: 10 },
    range_z: { min: 1, max: 1 },

    grid_x: [
      { pos: 0, label: '0ms' },
      { pos: 500, label: '500ms' },
      { pos: 1000, label: '1s' },
      { pos: 1500, label: '1.5ms' },
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

    show_input_handle: true,
    show_predelay_handle: true,
    show_input: true,
    show_rtime_handle: true,
    show_rlevel_handle: true,

    reflections: { amount: 0, spread: 0, randomness: 0 },
    _reflections: [],
  },
  static_events: {
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
  },
  initialize: function (options) {
    Chart.prototype.initialize.call(this, options);

    /**
     * @member {ChartHandle} Reverb#input_handle - The {@link ChartHandle}
     *   displaying/setting the initial delay and gain.
     */
    this.input_handle = new ChartHandle({
      format_label: function (label, x, y, z) {
        const O = this.options;
        let output = [];
        if (label) output.push(label);
        if (O.delay !== false) {
          if (x >= 1000) output.push(sprintf('%.2fs', x / 1000));
          else output.push(sprintf('%dms', x));
        }
        if (O.input !== false) {
          output.push(sprintf('%.2fdB', y));
        }
        return output.join('\n');
      }.bind(this),
      label: 'Input',
      mode: 'circular',
      active: true,
    });
    this.input_handle.addEventListener('userset', dragInput.bind(this));
    this.addHandle(this.input_handle);

    /**
     * @member {ChartHandle} Reverb#rlevel_handle - The {@link ChartHandle}
     *   displaying/setting the pre delay and reverb level.
     */
    this.rlevel_handle = new ChartHandle({
      format_label: function (label, x, y, z) {
        const O = this.options;
        let output = [];
        if (label) output.push(label);
        if (O.delay !== false) {
          if (x >= 1000) output.push(sprintf('%.2fs', (x - O.delay) / 1000));
          else output.push(sprintf('%dms', x - O.delay));
        }
        if (O.rlevel !== false) {
          output.push(sprintf('%.2fdB', y - O.gain));
        }
        return output.join('\n');
      }.bind(this),
      label: 'Reverb',
      mode: 'circular',
      active: true,
    });
    this.rlevel_handle.addEventListener('userset', dragRLevel.bind(this));
    this.addHandle(this.rlevel_handle);

    /**
     * @member {ChartHandle} Reverb#rtime_handle - The {@link ChartHandle}
     *   displaying/setting the reverb time.
     */
    this.rtime_handle = new ChartHandle({
      format_label: function (label, x, y, z) {
        const O = this.options;
        let output = [];
        if (label) output.push(label);
        if (O.delay !== false) {
          if (x >= 1000)
            output.push(sprintf('%.2fs', (x - O.delay - O.predelay) / 1000));
          else output.push(sprintf('%dms', x - O.delay - O.predelay));
        }
        return output.join('\n');
      }.bind(this),
      label: 'Time',
      mode: 'line-vertical',
      active: true,
    });
    this.rtime_handle.addEventListener('userset', dragRTime.bind(this));
    this.addHandle(this.rtime_handle);

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
  },
  initialized: function () {
    Chart.prototype.initialized.call(this);
    var O = this.options;
  },
  draw: function (O, element) {
    addClass(element, 'aux-reverb');

    Chart.prototype.draw.call(this, O, element);

    initValues.call(this, 'delay', O);
    initValues.call(this, 'gain', O);
    initValues.call(this, 'predelay', O);
    initValues.call(this, 'rlevel', O);
    initValues.call(this, 'rtime', O);
    initValues.call(this, 'erlevel', O);

    this.set('reflections', O.reflections);
    this.set('show_input', O.show_input);
  },
  redraw: function () {
    const O = this.options;
    const I = this.invalid;

    Chart.prototype.redraw.call(this);

    if (I.show_input_handle) {
      I.show_input_handle = false;
      this.input_handle.set('visible', O.show_input_handle);
    }

    if (I.show_rlevel_handle) {
      I.show_rlevel_handle = false;
      this.rlevel_handle.set('visible', O.show_rlevel_handle);
    }

    if (I.show_rtime_handle) {
      I.show_rtime_handle = false;
      this.rtime_handle.set('visible', O.show_rtime_handle);
    }

    if (I.show_input) {
      I.show_input = false;
      this.input.set('visible', O.show_input);
      console.log(O.show_input)
    }

    if (I.input || I.delay) {
      I.input = false; //keep delay for further tests
      drawInput.call(this);
      drawReverb.call(this);
    }

    if (I.validate('predelay', 'rlevel', 'rtime', 'attack')) {
      drawReverb.call(this);
    }

    if (I.validate('reflections', 'erlevel', 'delay')) {
      drawReflections.call(this);
    }
  },
  set: function (key, value) {
    if (key == 'reflections') {
      if (
        typeof value == 'object' &&
        typeof this.options.reflections == 'object'
      ) {
        value = { ...this.options.reflections, ...value };
      }
    }
    Chart.prototype.set.call(this, key, value);
  },
});

defineRecalculation(Reverb, ['delay', 'predelay', 'rtime'], function (O) {
  O.delay = Math.min(O.delay_max, Math.max(O.delay_min, O.delay));
  O.predelay = Math.min(O.predelay_max, Math.max(O.predelay_min, O.predelay));
  O.rtime = Math.min(O.rtime_max, Math.max(O.rtime_min, O.rtime));
  this.input_handle.update('x', O.delay);
  this.rlevel_handle.update('x', O.delay + O.predelay);
  this.rtime_handle.update('x', O.delay + O.predelay + O.rtime);
});
defineRecalculation(Reverb, ['gain', 'rlevel'], function (O) {
  O.gain = Math.min(O.gain_max, Math.max(O.gain_min, O.gain));
  O.rlevel = Math.min(O.rlevel_max, Math.max(O.rlevel_min, O.rlevel));
  this.input_handle.update('y', O.gain);
  this.rlevel_handle.update('y', O.gain + O.rlevel);
});

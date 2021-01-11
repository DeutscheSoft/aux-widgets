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

function setInputMode () {
  const O = this.options;
  let mode = "circular";;
  if (O.delay === false) mode = "line-horizontal";
  if (O.input === false) mode = "line-vertical";
  this.input_handle.set("mode", mode);
  this.input.set("visible", O.delay !==false && O.input !== false);
}

function dragInput (key, value) {
  const O = this.options;
  if (key == 'x') {
    this.userset('delay', Math.min(O.delay_max, Math.max(O.delay_min, value)));
    return O.sync;
  }
  if (key == 'y') {
    this.userset('gain', Math.min(O.gain_max, Math.max(O.gain_min, value)));
    return O.sync;
  }
  return true;
}

function dragRLevel (key, value) {
  const O = this.options;
  if (key == 'x') {
    this.userset('predelay', Math.min(O.predelay_max + O.delay, Math.max(O.predelay_min + O.delay, value)) - O.delay);
    return O.sync;
  }
  if (key == 'y') {
    this.userset('rlevel', Math.min(O.rlevel_max - O.gain, Math.max(O.rlevel_min - O.gain, value)));
    return O.sync;
  }
  return true;
}

function dragRTime (key, value) {
  const O = this.options;
  if (key == 'x') {
    this.userset('rtime', Math.min(O.rtime_max + O.predelay + O.delay, Math.max(O.rtime_min + O.delay + O.predelay, value)) - O.delay - O.predelay);
    return O.sync;
  }
  return true;
}

function drawInput () {
  const O = this.options;
  this.input.set("dots", [
    {x: Math.min(O.delay_max, Math.max(O.delay_min, O.delay)), y: Math.min(O.gain_max, Math.min(O.gain_min, this.range_y.get("min")))},
    {x: Math.min(O.delay_max, Math.max(O.delay_min, O.delay)), y: Math.min(O.gain_max, Math.max(O.gain_min, O.gain))},
  ]);
}

function drawReverb () {
  const O = this.options;
  const rstart = O.delay + O.predelay;
  let x0 = rstart;
  const attack = Math.min(O.attack, O.predelay);
  
  Math.min(O.delay_max, Math.max(O.delay_min, O.delay))
  
  if (O.attack) {
    const rate = O.noisefloor / attack;
    x0 -= this.range_y.get('min') / rate;
  }
  const y0 = this.range_y.get("min");
  
  const x1 = rstart;
  const y1 = O.rlevel + O.gain;
  
  const rate = -60 / O.rtime;
  
  const x2 = (this.range_y.get('min') - O.gain - O.rlevel) / rate + O.delay + O.predelay;
  const y2 = this.range_y.get("min");
  
  this.reverb.set("dots", [
    {x: x0, y: y0},
    {x: x1, y: y1},
    {x: x2, y: y2},
  ]);
  
}

function initValues (type, O) {
  this.set(type, O[type]);
  this.set(type + "_min", O[type + "_min"]);
  this.set(type + "_max", O[type + "_max"]);
}

function setReflections (reflections) {
  console.log(arguments)
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
        })
      } else {
        R.push({
          time: reflections.spread,
          level: -reflections.randomness * Math.random(),
        })
      }
    }
  } else {
    // no reflections given
    R = [];
  }
  
  adjustReflections.call(this, R);
}

function adjustReflections (reflections) {
  const O = this.options;
  const R = O._reflections;
  
  for (let i = reflections.length, m = R.length; i < m; ++i) {
    const G = R[i].graph;
    this.removeGraph(G);
    G.destroy();
  }
  
  R.length = reflections.length;
  
  for (let i = 0, m = R.length; i < m; ++i) {
    if (typeof R[i] !== "object") {
      R[i] = {
        level: 0,
        time: 0,
        graph: null,
      }
    }
    if (!R[i].graph) {
      R[i].graph = new Graph({
        range_x: this.range_x,
        range_y: this.range_y,
        class: "aux-reflection",
      });
      this.addGraph(R[i].graph);
    }
    R[i].level = reflections[i].level;
    R[i].time = reflections[i].time;
  }
  
  this.invalidate("_reflections");
  this.triggerDraw();
}

function drawReflections() {
  const O = this.options;
  let R = O._reflections;
  
  for (let i = 0, m = R.length; i < m; ++i) {
    const y = this.range_y.get("min");
    const x = R[i].time + O.delay;
    R[i].graph.set("dots", [
      {x: x, y: y},
      {x: x, y: R[i].level + O.gain + O.erlevel},
    ]);
  }
}

/**
 * Reverb is a {@link Chart} with various handles to set and display
 * parameters of a typical classic reverb.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {options.timeframe=5000}
 * 
 * @extends Chart
 *
 * @class Reverb
 */
export const Reverb = defineClass({
  Extends: Chart,
  _options: Object.assign(Object.create(Chart.prototype._options), {
    timeframe: "number",
    
    delay: "integer",
    delay_min: "integer",
    delay_max: "integer",
    
    gain: "integer",
    gain_min: "integer",
    gain_max: "integer",
    
    predelay: "integer",
    predelay_min: "integer",
    predelay_max: "integer",
    
    rlevel: "integer",
    rlevel_min: "integer",
    rlevel_max: "integer",
    
    rtime: "integer",
    rtime_min: "integer",
    rtime_max: "integer",
    
    erlevel: "integer",
    erlevel_min: "integer",
    erlevel_max: "integer",
    
    attack: "number",
    noisefloor: "number",
    
    show_input_handle: "boolean",
    show_input: "boolean",
    rlevel_handle: "boolean",
    rtime_handle: "boolean",
    
    reflections: "boolean|array|object",
    _reflections: "array",
    
    sync: "boolean",
  }),
  options: {
    range_x: { min: 0, max: 5000 },
    range_y: { min: -90, max: 10 },
    range_z: { min: 1, max: 1 },
    
    grid_x: [{'pos': 0, 'label': '0ms'},
             {'pos': 500, 'label': '500ms'},
             {'pos': 1000, 'label': '1s'},
             {'pos': 1500, 'label': '1.5ms'},
             {'pos': 2000, 'label': '2s'},
             {'pos': 2500, 'label': '2.5s'},
             {'pos': 3000, 'label': '3s'},
             {'pos': 3500, 'label': '3.5s'},
             {'pos': 4000, 'label': '4s'},
             {'pos': 4500, 'label': '4.5s'},
             {'pos': 5000, 'label': '5s'},
             {'pos': 5500, 'label': '5.5s'},
             {'pos': 6000, 'label': '6s'},
             {'pos': 6500, 'label': '6.5s'},
             {'pos': 7000, 'label': '7s'},
             {'pos': 7500, 'label': '7.5s'},
             {'pos': 8000, 'label': '8s'},
             {'pos': 8500, 'label': '8.5s'},
             {'pos': 9000, 'label': '9s'},
             {'pos': 9500, 'label': '9.5s'},
             {'pos': 10000, 'label': '10s'},],
             
    grid_y: [{'pos': -120, 'label': '-120dB'},
             {'pos': -110, 'label': '-110dB'},
             {'pos': -100, 'label': '-100dB'},
             {'pos': -90, 'label': '-90dB'},
             {'pos': -80, 'label': '-80dB'},
             {'pos': -70, 'label': '-70dB'},
             {'pos': -60, 'label': '-60dB'},
             {'pos': -50, 'label': '-50dB'},
             {'pos': -40, 'label': '-40dB'},
             {'pos': -30, 'label': '-30dB'},
             {'pos': -20, 'label': '-20dB'},
             {'pos': -10, 'label': '-10dB'},
             {'pos': 0, 'label': '0dB'},],
             
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
    
    show_input_handle: true,
    show_predelay_handle: true,
    show_input: true,
    rtime_handle: true,
    rlevel_handle: true,
    
    reflections: { amount: 0, spread: 0, randomness: 0 },
    _reflections: [],
    
    sync: false,
  },
  static_events: {
    set_timeframe: v=>this.range_x.set("max", v),
    set_reflections: setReflections,
    
    set_delay: function (v) {
      const O = this.options;
      setInputMode.call(this);
      this.rlevel_handle.update("x_min", v + O.predelay_min);
      this.rlevel_handle.update("x_max", v + O.predelay_max);
      this.rtime_handle.update("x_min", v + O.predelay + O.rtime_min);
      this.rtime_handle.update("x_max", v + O.predelay + O.rtime_max);
    },
    set_delay_min: function (v) {
      this.input_handle.update('x_min', v);
    },
    set_delay_max: function (v) {
      this.input_handle.update('x_max', v);
    },
    
    set_gain: function (v) {
      const O = this.options;
      setInputMode.call(this);
      this.rlevel_handle.update('y_min', v + O.rlevel_min);
      this.rlevel_handle.update('y_max', v + O.rlevel_max);
    },
    set_gain_min: function (v) {
      this.input_handle.update('y_min', v);
    },
    set_gain_max: function (v) {
      this.input_handle.update('y_max', v);
    },
    
    set_predelay: function (v) {
      const O = this.options;
      setInputMode.call(this);
      this.rtime_handle.update("x_min", v + O.delay + O.rtime_min);
      this.rtime_handle.update("x_max", v + O.delay + O.rtime_max);
    },
    set_predelay_min: function (v) {
      const O = this.options;
      this.rlevel_handle.update('x_min', v + O.delay);
    },
    set_predelay_max: function (v) {
      const O = this.options;
      this.rlevel_handle.update('x_max', v + O.delay);
    },
    
    set_rlevel: function (v) {
      setInputMode.call(this);
    },
    set_rlevel_min: function (v) {
      const O = this.options;
      this.rlevel_handle.update('y_min', v + O.gain);
    },
    set_rlevel_max: function (v) {
      const O = this.options;
      this.rlevel_handle.update('y_max', v + O.gain);
    },
    
    set_rtime: function (v) {
      setInputMode.call(this);
    },
    set_rtime_min: function (v) {
      const O = this.options;
      this.rtime_handle.update('x_min', v + O.delay + O.predelay);
    },
    set_rtime_max: function (v) {
      const O = this.options;
      this.rtime_handle.update('x_max', v + O.delay + O.predelay);
    },
  },
  initialize: function (options) {
    Chart.prototype.initialize.call(this, options);
    
    /**
     * @member {ChartHandle} Reverb#input_handle - The {@link ChartHandle}
     *   displaying/setting the initial delay and gain.
     */
    this.input_handle = new ChartHandle({
      format_label: (function (label, x, y, z) {
        const O = this.options;
        let output = [];
        if (label)
          output.push(label);
        if (O.delay !== false) {
          if (x >= 1000)
            output.push(sprintf("%.2fs", x / 1000));
          else
            output.push(sprintf("%dms", x));
        }
        if (O.input !== false) {
          output.push(sprintf("%.2fdB", y));
        }
        return output.join("\n");
      }).bind(this),
      label: 'Input',
      mode: "circular",
      active: true,
    });
    this.input_handle.addEventListener('userset', dragInput.bind(this));
    this.addHandle(this.input_handle);
    
    /**
     * @member {ChartHandle} Reverb#rlevel_handle - The {@link ChartHandle}
     *   displaying/setting the pre delay and reverb level.
     */
    this.rlevel_handle = new ChartHandle({
      format_label: (function (label, x, y, z) {
        const O = this.options;
        let output = [];
        if (label)
          output.push(label);
        if (O.delay !== false) {
          if (x >= 1000)
            output.push(sprintf("%.2fs", (x - O.delay) / 1000));
          else
            output.push(sprintf("%dms", x - O.delay));
        }
        if (O.rlevel !== false) {
          output.push(sprintf("%.2fdB", y - O.gain));
        }
        return output.join("\n");
      }).bind(this),
      label: 'Reverb',
      mode: "circular",
      active: true,
    });
    this.rlevel_handle.addEventListener('userset', dragRLevel.bind(this));
    this.addHandle(this.rlevel_handle);
    
    /**
     * @member {ChartHandle} Reverb#rtime_handle - The {@link ChartHandle}
     *   displaying/setting the reverb time.
     */
    this.rtime_handle = new ChartHandle({
      format_label: (function (label, x, y, z) {
        const O = this.options;
        let output = [];
        if (label)
          output.push(label);
        if (O.delay !== false) {
          if (x >= 1000)
            output.push(sprintf("%.2fs", (x - O.delay - O.predelay) / 1000));
          else
            output.push(sprintf("%dms", x - O.delay - O.predelay));
        }
        return output.join("\n");
      }).bind(this),
      label: 'Time',
      mode: "line-vertical",
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
      class: "aux-input",
    });
    this.addGraph(this.input);
    
    /**
     * @member {Graph} Reverb#reverb - The {@link Graph} displaying the
     * reverb signal as a triagle.
     */
    this.reverb = new Graph({
      range_x: this.range_x,
      range_y: this.range_y,
      class: "aux-reverb",
      mode: "bottom",
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
    
    initValues.call(this, "delay", O);
    initValues.call(this, "gain", O);
    initValues.call(this, "predelay", O);
    initValues.call(this, "rlevel", O);
    initValues.call(this, "rtime", O);
    initValues.call(this, "erlevel", O);
    
    this.set("reflections", O.reflections);
  },
  redraw: function () {
    const O = this.options;
    const I = this.invalid;
    
    Chart.prototype.redraw.call(this);
    
    if (I.show_input_handle) {
      I.show_input_handle = false;
      this.input_handle.set("visible", O.show_input_handle);
    }
    
    if (I.rlevel_handle) {
      I.rlevel_handle = false;
      this.rlevel_handle.set("visible", O.rlevel_handle);
    }
    
    if (I.rtime_handle) {
      I.rtime_handle = false;
      this.rtime_handle.set("visible", O.rtime_handle);
    }
    
    if (I.show_input) {
      I.show_input = false;
      this.input.set("visible", O.show_input);
    }
    
    if (I.input || I.delay) {
      I.input = false; //keep delay for further tests
      drawInput.call(this);
      drawReverb.call(this);
    }
    
    if (I.validate("predelay", "rlevel", "rtime", "attack")) {
      drawReverb.call(this);
    }
    
    if (I.validate("reflections", "erlevel", "delay")) {
      drawReflections.call(this);
    }
  },
  set: function (key, value) {
    if (key == "reflections") {
      if (typeof value == "object" && typeof this.options.reflections == "object") {
        value = { ...this.options.reflections, ...value };
      }
    }
    Chart.prototype.set.call(this, key, value);
  },
});

defineRecalculation(Reverb, [ 'delay', 'predelay', 'rtime' ], function (O) {
  const { delay, predelay, rtime } = O;
  this.input_handle.update('x', delay);
  this.rlevel_handle.update('x', delay + predelay);
  this.rtime_handle.update('x', delay + predelay + rtime);
});
defineRecalculation(Reverb, [ 'gain', 'rlevel' ], function (O) {
  const { gain, rlevel } = O;
  this.input_handle.update('y', gain);
  this.rlevel_handle.update('y', gain + rlevel);
});

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

/* jshint -W018 */

import { defineClass, defineChildElement } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { Meter } from './meter.js';
import { State } from './state.js';
import { addClass, toggleClass, element } from '../utils/dom.js';
import { FORMAT } from '../utils/sprintf.js';
import { effectiveValue } from '../modules/range.js';

function vert(O) {
  return O.layout === 'left' || O.layout === 'right';
}

function clearTimeout(to) {
  if (to >= 0) window.clearTimeout(to);
}

function clipTimeout() {
  var O = this.options;
  if (!O.auto_clip || O.auto_clip < 0) return false;
  clearTimeout(this.__cto);
  this.__cto = window.setTimeout(this._reset_clip, O.auto_clip);
}
function valueTimeout() {
  var peak_value = 0 | this.options.peak_value;
  if (peak_value <= 0) return false;
  clearTimeout(this.__lto);
  this.__lto = window.setTimeout(this._reset_value, peak_value);
}
function topTimeout() {
  var O = this.options;
  if (!O.auto_hold || O.auto_hold < 0) return false;
  clearTimeout(this.__tto);
  this.__tto = window.setTimeout(this._reset_top, O.auto_hold);
}
function bottomTimeout() {
  var O = this.options;
  if (!O.auto_hold || O.auto_hold < 0) return false;
  clearTimeout(this.__bto);
  this.__bto = window.setTimeout(this._reset_bottom, O.auto_hold);
}

export const LevelMeter = defineClass({
  /**
   * LevelMeter is a fully functional meter bar displaying numerical values.
   * LevelMeter is an enhanced {@link Meter} containing a clip LED and hold markers.
   * In addition, LevelMeter has an optional falling animation, top and bottom peak
   * values and more.
   *
   * @class LevelMeter
   *
   * @extends Meter
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Boolean} [options.show_clip=false] - If set to <code>true</code>, show the clipping LED.
   * @property {Number} [options.clipping=0] - If clipping is enabled, this is the threshold for the
   *   clipping effect.
   * @property {Integer|Boolean} [options.auto_clip=false] - This is the clipping timeout. If set to
   *   <code>false</code> automatic clipping is disabled. If set to <code>n</code> the clipping effect
   *   times out after <code>n</code> ms, if set to <code>-1</code> it remains forever.
   * @property {Boolean} [options.clip=false] - If clipping is enabled, this option is set to
   *   <code>true</code> when clipping happens. When automatic clipping is disabled, it can be set to
   *   <code>true</code> to set the clipping state.
   * @property {Boolean} [options.show_hold=false] - If set to <code>true</code>, show the hold value LED.
   * @property {Integer} [options.hold_size=1] - Size of the hold value LED in the number of segments.
   * @property {Number|boolean} [options.auto_hold=false] - If set to <code>false</code> the automatic
   *   hold LED is disabled, if set to <code>n</code> the hold value is reset after <code>n</code> ms and
   *   if set to <code>-1</code> the hold value is not reset automatically.
   * @property {Number} [options.top=false] - The top hold value. If set to <code>false</code> it will
   *   equal the meter level.
   * @property {Number} [options.bottom=false] - The bottom hold value. This only exists if a
   *   <code>base</code> value is set and the value falls below the base.
   * @property {Integer|Boolean} [options.peak_value=false] - If set to <code>false</code> the automatic peak
   *   label is disabled, if set to <code>n</code> the peak label is reset after <code>n</code> ms and
   *   if set to <code>-1</code> it remains forever.
   * @property {Number} [options.falling=0] - If set to a positive number, activates the automatic falling
   *   animation. The meter level will fall by this amount over the time set via `options.falling_duration`.
   * @property {Number} [options.falling_duration=1000] - This is the time in milliseconds for the falling
   *   animation. The level falls by `options.falling` in this period of time.
   * @property {Number} [options.falling_init=50] - Initial falling delay in milliseconds. This option
   *   can be used to delay the start of the falling animation in order to avoid flickering if internal
   *   and external falling are combined.
   */
  Extends: Meter,
  _options: Object.assign(Object.create(Meter.prototype._options), {
    falling: 'number',
    falling_duration: 'int',
    falling_init: 'number',
    top: 'number',
    bottom: 'number',
    hold_size: 'int',
    show_hold: 'boolean',
    clipping: 'number',
    auto_clip: 'int|boolean',
    auto_hold: 'int|boolean',
    peak_value: 'int|boolean',
  }),
  options: {
    clip: false,
    falling: 0,
    falling_duration: 1000,
    falling_init: 50,
    top: false,
    bottom: false,
    hold_size: 1,
    show_hold: false,
    clipping: 0,
    auto_clip: false,
    auto_hold: false,
    peak_value: false,
  },
  static_events: {
    set_auto_clip: function (value) {
      if (this.__cto >= 0 && 0 | (value <= 0)) window.clearTimeout(this.__cto);
    },
    set_peak_value: function (value) {
      if (this.__lto >= 0 && 0 | (value <= 0)) window.clearTimeout(this.__lto);
      if (value === false) this.set('sync_value', this.options._sync_value);
      else this.set('sync_value', false);
    },
    set_sync_value: function (v) {
      this.set('_sync_value', v);
    },
    set_auto_hold: function (value) {
      if (this.__tto >= 0 && 0 | (value <= 0)) window.clearTimeout(this.__tto);
      if (this.__bto >= 0 && 0 | (value <= 0)) window.clearTimeout(this.__bto);
    },
  },

  initialize: function (options) {
    /* track the age of the value option */
    this.trackOption('value');
    Meter.prototype.initialize.call(this, options);
    this._reset_value = this.resetValue.bind(this);
    this._reset_clip = this.resetClip.bind(this);
    this._reset_top = this.resetTop.bind(this);
    this._reset_bottom = this.resetBottom.bind(this);

    /**
     * @member {HTMLDivElement} LevelMeter#element - The main DIV container.
     *   Has class <code>.aux-levelmeter</code>.
     */
    var O = this.options;

    if (O.top === false) O.top = O.value;
    if (O.bottom === false) O.bottom = O.value;
    if (O.falling < 0) O.falling = -O.falling;
  },

  draw: function (O, element) {
    addClass(element, 'aux-levelmeter');

    Meter.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    var O = this.options;
    var I = this.invalid;
    var E = this.element;

    if (I.show_hold) {
      I.show_hold = false;
      toggleClass(E, 'aux-has-hold', O.show_hold);
    }

    if (I.top || I.bottom) {
      /* top and bottom require a meter redraw, so lets invalidate
       * value */
      I.top = I.bottom = false;
      I.value = true;
    }

    if (I.base) I.value = true;

    Meter.prototype.redraw.call(this);

    if (I.clip) {
      I.clip = false;
      toggleClass(E, 'aux-clipping', O.clip);
    }
  },
  destroy: function () {
    Meter.prototype.destroy.call(this);
  },
  /**
   * Resets the value.
   *
   * @method LevelMeter#resetValue
   *
   * @emits LevelMeter#resetvalue
   */
  resetValue: function () {
    clearTimeout(this.__lto);
    this.set(
      'value_label',
      effectiveValue(
        +O.value,
        +O.base,
        +O.falling,
        +O.falling_duration,
        +O.falling_init,
        +this.value_time.value
      )
    );
    /**
     * Is fired when the value label was reset.
     *
     * @event LevelMeter#resetvalue
     */
    this.emit('resetvalue');
  },
  /**
   * Resets the clipping LED.
   *
   * @method LevelMeter#resetClip
   *
   * @emits LevelMeter#resetclip
   */
  resetClip: function () {
    clearTimeout(this.__cto);
    this.set('clip', false);
    /**
     * Is fired when the clipping LED was reset.
     *
     * @event LevelMeter#resetclip
     */
    this.emit('resetclip');
  },
  /**
   * Resets the top hold.
   *
   * @method LevelMeter#resetTop
   *
   * @emits LevelMeter#resettop
   */
  resetTop: function () {
    this.set(
      'top',
      effectiveValue(
        +O.value,
        +O.base,
        +O.falling,
        +O.falling_duration,
        +O.falling_init,
        +this.value_time.value
      )
    );
    /**
     * Is fired when the top hold was reset.
     *
     * @event LevelMeter#resettop
     */
    this.emit('resettop');
  },
  /**
   * Resets the bottom hold.
   *
   * @method LevelMeter#resetBottom
   *
   * @emits LevelMeter#resetbottom
   */
  resetBottom: function () {
    this.set(
      'bottom',
      effectiveValue(
        +O.value,
        +O.base,
        +O.falling,
        +O.falling_duration,
        +O.falling_init,
        +this.value_time.value
      )
    );
    /**
     * Is fired when the bottom hold was reset.
     *
     * @event LevelMeter#resetbottom
     */
    this.emit('resetbottom');
  },
  /**
   * Resets all hold features.
   *
   * @method LevelMeter#resetAll
   *
   * @emits LevelMeter#resetvalue
   * @emits LevelMeter#resetclip
   * @emits LevelMeter#resettop
   * @emits LevelMeter#resetbottom
   */
  resetAll: function () {
    this.resetValue();
    this.resetClip();
    this.resetTop();
    this.resetBottom();
  },

  /*
   * This is an _internal_ method, which calculates the non-filled regions
   * in the overlaying canvas as pixel positions. The canvas is only modified
   * using this information when it has _actually_ changed. This can save a lot
   * of performance in cases where the segment size is > 1 or on small devices where
   * the meter has a relatively small pixel size.
   */
  calculateMeter: function (to, value, i) {
    var O = this.options;
    var falling = +O.falling;
    var base = +O.base;
    value = +value;

    // this is a bit unelegant...
    if (falling) {
      value = effectiveValue(
        +O.value,
        +O.base,
        +O.falling,
        +O.falling_duration,
        +O.falling_init,
        +this.value_time.value
      );
      // continue animation
      if (value !== base) {
        this.invalid.value = true;
        // request another frame
        this.triggerDrawNext();
      }
    }

    i = Meter.prototype.calculateMeter.call(this, to, value, i);

    if (!O.show_hold) return i;

    // shorten things
    var hold = +O.top;
    var segment = O.segment | 0;
    var hold_size = O.hold_size * segment;
    var pos;

    if (!(hold_size > 0)) return i;

    var pos_base = +this.valueToPixel(base);

    if (hold > base) {
      /* TODO: lets snap in set() */
      pos = this.valueToPixel(hold) | 0;
      if (segment !== 1) pos = segment * (Math.round(pos / segment) | 0);

      if (pos > pos_base) {
        to[i++] = pos - hold_size;
        to[i++] = pos;
      } else {
        to[i++] = pos;
        to[i++] = pos + hold_size;
      }
    }

    hold = +O.bottom;

    if (hold < base) {
      pos = this.valueToPixel(hold) | 0;
      if (segment !== 1) pos = segment * (Math.round(pos / segment) | 0);

      if (pos > pos_base) {
        to[i++] = pos - hold_size;
        to[i++] = pos;
      } else {
        to[i++] = pos;
        to[i++] = pos + hold_size;
      }
    }

    return i;
  },

  // GETTER & SETTER
  set: function (key, value) {
    if (key === 'value') {
      var O = this.options;
      var base = O.base;

      // snap will enforce clipping
      value = this.snap(value);

      if (O.falling) {
        var v = effectiveValue(
          +O.value,
          +O.base,
          +O.falling,
          +O.falling_duration,
          +O.falling_init,
          +this.value_time.value
        );
        if (
          (v >= base && value >= base && value < v) ||
          (v <= base && value <= base && value > v)
        ) {
          /* NOTE: we are doing a falling animation, but maybe its not running */
          if (!this.invalid.value) {
            this.invalid.value = true;
            this.triggerDraw();
          }
          return;
        }
      }
      if (O.auto_clip !== false && value >= O.clipping && !this.hasBase()) {
        clearTimeout(this.__cto);
        this.set('clip', true);
      }
      if (O.auto_clip !== false && value < O.clipping && !this.hasBase()) {
        clipTimeout.call(this);
      }
      if (
        O.show_value &&
        O.peak_value !== false &&
        ((value > O.value_label && value > base) ||
          (value < O.value_label && value < base))
      ) {
        clearTimeout(this.__lto);
        this.set('value_label', value);
      }
      if (
        O.show_value &&
        O.peak_value !== false &&
        ((value < O.value_label && value > base) ||
          (value > O.value_label && value < base))
      ) {
        valueTimeout.call(this);
      }
      if (O.auto_hold !== false && O.show_hold && value > O.top) {
        clearTimeout(this.__tto);
        this.set('top', value);
      }
      if (O.auto_hold !== false && O.show_hold && value < O.top) {
        topTimeout.call(this);
      }
      if (
        O.auto_hold !== false &&
        O.show_hold &&
        value < O.bottom &&
        this.hasBase()
      ) {
        clearTimeout(this.__bto);
        this.set('bottom', value);
      }
      if (
        O.auto_hold !== false &&
        O.show_hold &&
        value > O.bottom &&
        this.hasBase()
      ) {
        bottomTimeout.call(this);
      }
    } else if (key === 'top' || key === 'bottom') {
      value = this.snap(value);
    }
    return Meter.prototype.set.call(this, key, value);
  },
});

/**
 * @member {State} LevelMeter#clip - The {@link State} instance for the clipping LED.
 * @member {HTMLDivElement} LevelMeter#clip.element - The DIV element of the clipping LED.
 *   Has class <code>.aux-clip</code>.
 */
defineChildWidget(LevelMeter, 'clip', {
  create: State,
  show: false,
  map_options: {
    clip: 'state',
  },
  default_options: {
    class: 'aux-clip',
  },
  toggle_class: true,
});

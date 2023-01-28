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

/* jshint -W018 */

import { defineChildWidget } from '../child_widget.js';
import { Meter } from './meter.js';
import { State } from './state.js';
import { addClass, toggleClass } from '../utils/dom.js';
import { effectiveValue } from '../modules/range.js';
import { defineRender, defineMeasure, deferRenderNext } from '../renderer.js';
import {
  createTimer,
  startTimer,
  destroyTimer,
  cancelTimer,
} from '../utils/timers.js';

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
export class LevelMeter extends Meter {
  static get _options() {
    return Object.assign({}, Meter.getOptionTypes(), {
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
    });
  }

  static get options() {
    return {
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
    };
  }

  static get static_events() {
    return {
      set_auto_clip: function (value) {
        if (!(value > 0)) this._clip_timer = destroyTimer(this._clip_timer);
      },
      set_peak_value: function (value) {
        if (!(value > 0)) this._value_timer = destroyTimer(this._value_timer);
        if (value !== false) this.set('sync_value', false);
      },
      set_auto_hold: function (value) {
        if (!(value > 0)) {
          this._top_timer = destroyTimer(this._top_timer);
          this._bottom_timer = destroyTimer(this._bottom_timer);
        }
      },
    };
  }

  static get renderers() {
    return [
      defineRender('show_hold', function (show_hold) {
        toggleClass(this.element, 'aux-has-hold', show_hold);
      }),
      defineMeasure(['top', 'bottom', 'base'], function () {
        /* top and bottom require a meter redraw, so lets invalidate
         * value */
        this.invalidate('value');
      }),
      defineRender('clip', function (clip) {
        toggleClass(this.element, 'aux-clipping', clip);
      }),
    ];
  }

  initialize(options) {
    /* track the age of the value option */
    super.initialize(options);
    this._value_timer = createTimer(this.resetValue.bind(this));
    this._clip_timer = createTimer(this.resetClip.bind(this));
    this._top_timer = createTimer(this.resetTop.bind(this));
    this._bottom_timer = createTimer(this.resetBottom.bind(this));

    /**
     * @member {HTMLDivElement} LevelMeter#element - The main DIV container.
     *   Has class <code>.aux-levelmeter</code>.
     */
    const O = this.options;

    if (O.top === false) O.top = O.value;
    if (O.bottom === false) O.bottom = O.value;
    if (O.falling < 0) O.falling = -O.falling;

    if (O.peak_value !== false) this.set('peak_value', O.peak_value);
  }

  draw(O, element) {
    addClass(element, 'aux-levelmeter');

    super.draw(O, element);
  }

  drawMeter() {
    super.drawMeter();

    const O = this.options;
    const falling = +O.falling;

    if (!falling) return;

    const base = +O.base;
    const value = this.effectiveValue();

    if (value === base) return null;

    return deferRenderNext(() => {
      return this.drawMeter();
    });
  }

  destroy() {
    this._clip_timer = destroyTimer(this._clip_timer);
    this._top_timer = destroyTimer(this._top_timer);
    this._bottom_timer = destroyTimer(this._bottom_timer);
    this._value_timer = destroyTimer(this._value_timer);
    this.removeChildNode(this.clip?.element);
    super.destroy();
  }

  effectiveValue() {
    const {
      value,
      base,
      falling,
      falling_duration,
      falling_init,
      _value_time,
    } = this.options;

    return effectiveValue(
      value,
      base,
      falling,
      falling_duration,
      falling_init,
      _value_time
    );
  }

  /**
   * Resets the value.
   *
   * @method LevelMeter#resetValue
   *
   * @emits LevelMeter#resetvalue
   */
  resetValue() {
    this._value_timer = cancelTimer(this._value_timer);
    this.set('value_label', this.effectiveValue());
    /**
     * Is fired when the value label was reset.
     *
     * @event LevelMeter#resetvalue
     */
    this.emit('resetvalue');
  }

  /**
   * Resets the clipping LED.
   *
   * @method LevelMeter#resetClip
   *
   * @emits LevelMeter#resetclip
   */
  resetClip() {
    this._clip_timer = cancelTimer(this._clip_timer);
    this.set('clip', false);
    /**
     * Is fired when the clipping LED was reset.
     *
     * @event LevelMeter#resetclip
     */
    this.emit('resetclip');
  }

  /**
   * Resets the top hold.
   *
   * @method LevelMeter#resetTop
   *
   * @emits LevelMeter#resettop
   */
  resetTop() {
    this._top_timer = cancelTimer(this._top_timer);
    this.set('top', this.effectiveValue());
    /**
     * Is fired when the top hold was reset.
     *
     * @event LevelMeter#resettop
     */
    this.emit('resettop');
  }

  /**
   * Resets the bottom hold.
   *
   * @method LevelMeter#resetBottom
   *
   * @emits LevelMeter#resetbottom
   */
  resetBottom() {
    this._bottom_timer = cancelTimer(this._bottom_timer);
    this.set('bottom', this.effectiveValue());
    /**
     * Is fired when the bottom hold was reset.
     *
     * @event LevelMeter#resetbottom
     */
    this.emit('resetbottom');
  }

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
  resetAll() {
    this.resetValue();
    this.resetClip();
    this.resetTop();
    this.resetBottom();
  }

  /*
   * This is an _internal_ method, which calculates the non-filled regions
   * in the overlaying canvas as pixel positions. The canvas is only modified
   * using this information when it has _actually_ changed. This can save a lot
   * of performance in cases where the segment size is > 1 or on small devices where
   * the meter has a relatively small pixel size.
   */
  calculateMeter(to, value, i) {
    const O = this.options;
    const falling = +O.falling;
    const base = +O.base;
    const transformation = O.transformation;
    value = +this.effectiveValue();

    i = super.calculateMeter(to, value, i);

    if (!O.show_hold) return i;

    // shorten things
    let hold = +O.top;
    const segment = O.segment | 0;
    const hold_size = O.hold_size * segment;
    let pos;

    if (!(hold_size > 0)) return i;

    const pos_base = +transformation.valueToPixel(base);

    if (hold > base) {
      /* TODO: lets snap in set() */
      pos = transformation.valueToPixel(hold) | 0;
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
      pos = transformation.valueToPixel(hold) | 0;
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
  }

  // GETTER & SETTER
  set(key, value) {
    if (key === 'value') {
      const O = this.options;
      const { base, falling } = O;

      if (falling) {
        const effectiveValue = this.effectiveValue();

        if (
          (base < effectiveValue && value < effectiveValue) ||
          (base > effectiveValue && value > effectiveValue)
        ) {
          return value;
        }
      }

      this.set('_value_time', performance.now());

      // snap will enforce clipping
      value = O.snap_module.snap(value);

      if (O.auto_clip !== false && value >= O.clipping && !this.hasBase()) {
        this.set('clip', true);
        if (O.auto_clip >= 0)
          this._clip_timer = startTimer(this._clip_timer, O.auto_clip);
      }

      const peak_value = O.peak_value;

      if (O.show_value && peak_value !== false) {
        const value_label = O.value_label;

        if (
          (value > value_label && value > base) ||
          (value < value_label && value < base)
        ) {
          this.set('value_label', value);
          if (peak_value >= 0)
            this._value_timer = startTimer(this._value_timer, peak_value);
        }
      }

      if (O.auto_hold !== false && O.show_hold) {
        const auto_hold = O.auto_hold;
        const top = O.top;

        if (value >= top) {
          if (auto_hold >= 0)
            this._top_timer = startTimer(this._top_timer, auto_hold);
          this.set('top', value);
        }

        if (this.hasBase()) {
          const bottom = O.bottom;

          if (value <= bottom) {
            this.set('bottom', value);
            if (auto_hold >= 0)
              this._bottom_timer = startTimer(this._bottom_timer, auto_hold);
          }
        }
      }
    } else if (key === 'top' || key === 'bottom') {
      value = this.options.snap_module.snap(value);
    }
    return super.set(key, value);
  }
}

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

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
import { Widget } from './widget.js';
import { Circular } from './circular.js';
import { setText, element, addClass, getStyle } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { FORMAT } from '../utils/sprintf.js';
import { S } from '../dom_scheduler.js';

const formatViewbox = FORMAT('0 0 %d %d');

function drawTime(force) {
  let tmp, drawn;
  const O = this.options;
  let t = O.time;
  if (!(t instanceof Date) || isNaN(t)) t = new Date();

  if ((tmp = t.getSeconds()) !== this.__sec || force) {
    this.circulars.seconds.set('value', tmp);
    this.__sec = tmp;
  }
  if ((tmp = t.getMinutes()) !== this.__min || force) {
    this.circulars.minutes.set('value', tmp);
    this.__min = tmp;
  }
  if ((tmp = t.getHours() % 12) !== this.__hour || force) {
    this.circulars.hours.set('value', tmp);
    this.__hour = tmp;
  }

  const args = [t, O.fps, O.months, O.days];
  if ((tmp = O.label.apply(this, args)) !== this.__label || force) {
    setText(this._label, tmp);
    this.__label = tmp;
    drawn = true;
  }
  if ((tmp = O.label_upper.apply(this, args)) !== this.__upper || force) {
    setText(this._label_upper, tmp);
    this.__upper = tmp;
    drawn = true;
  }
  if ((tmp = O.label_lower.apply(this, args)) !== this.__lower || force) {
    setText(this._label_lower, tmp);
    this.__lower = tmp;
    drawn = true;
  }

  if (drawn)
    /**
     * Is fired when the time was drawn.
     *
     * @param {Date} time - The time which was drawn.
     *
     * @event Clock#timedrawn
     */
    this.emit('timedrawn', O.time);
}
function setLabels() {
  const O = this.options;
  const E = this._label;
  const s = O.label(
    new Date(2000, 8, 30, 24, 59, 59, 999),
    2000,
    8,
    30,
    6,
    24,
    59,
    59,
    999,
    999,
    O.months,
    O.days
  );
  setText(E, s);

  E.setAttribute('transform', '');

  /* FORCE_RELAYOUT */

  S.add(
    function () {
      let bb = E.getBoundingClientRect();
      const eb = this.svg.getBoundingClientRect();
      const size = Math.min(eb.width, eb.height);
      if (bb.width === 0) return; // we are hidden
      const mleft = parseInt(getStyle(E, 'margin-left')) || 0;
      const mright = parseInt(getStyle(E, 'margin-right')) || 0;
      const mlabel = (O.label_margin / 100) * size;
      const space = size - mleft - mright - this._margin * 2 - mlabel * 2;
      const scale = space / bb.width;
      const pos = O.size / 2;

      S.add(
        function () {
          E.setAttribute(
            'transform',
            'translate(' + pos + ',' + pos + ') ' + 'scale(' + scale + ')'
          );

          /* FORCE_RELAYOUT */

          S.add(
            function () {
              bb = E.getBoundingClientRect();

              S.add(
                function () {
                  this._label_upper.setAttribute(
                    'transform',
                    'translate(' +
                      pos +
                      ',' +
                      O.label_upper_pos * O.size +
                      ') ' +
                      'scale(' +
                      scale * O.label_scale +
                      ')'
                  );
                  this._label_lower.setAttribute(
                    'transform',
                    'translate(' +
                      pos +
                      ',' +
                      O.label_lower_pos * O.size +
                      ') ' +
                      'scale(' +
                      scale * O.label_scale +
                      ')'
                  );
                  drawTime.call(this, true);
                }.bind(this),
                1
              );
            }.bind(this)
          );
        }.bind(this),
        1
      );
    }.bind(this)
  );
}
function timeout() {
  if (this.__to) window.clearTimeout(this.__to);
  const O = this.options;
  if (!O) return;
  if (O.timeout) {
    const d = O.time;
    let ts = +Date.now();

    if (O.offset) {
      ts += O.offset | 0;
    }

    d.setTime(ts);
    this.set('time', d);

    let targ = O.timeout | 0;
    if (O.timeadd) {
      targ += (O.timeadd | 0) - (ts % 1000 | 0);
    }
    this.__to = window.setTimeout(this.__timeout, targ);
  } else this.__to = false;
}
function onhide() {
  if (this.__to) {
    window.clearTimeout(this.__to);
    this.__to = false;
  }
}

export const Clock = defineClass({
  /**
   * Clock shows a customized clock with circulars displaying hours, minutes
   * and seconds. It additionally offers three freely formattable labels.
   *
   * @class Clock
   *
   * @extends Widget
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Integer} [options.thickness=10] - Thickness of the rings in percent of the maximum dimension.
   * @property {Integer} [options.margin=0] - Margin between the {@link Circular} in percent of the maximum dimension.
   * @property {Integer} [options.size=200] - Width and height of the widget.
   * @property {Boolean} [options.show_seconds=true] - Show seconds ring.
   * @property {Boolean} [options.show_minutes=true] - Show minutes ring.
   * @property {Boolean} [options.show_hours=true] - Show hours ring.
   * @property {Integer} [options.timeout=1000] - The timeout of the redraw trigger.
   * @property {Integer} [options.timeadd=10] - Set additional milliseconds to add to the timeout target system clock regulary.
   * @property {Integer} [options.offset=0] - If a timeout is set offset the system time in milliseconds.
   * @property {Integer} [options.fps=25] - Framerate for calculating SMTP frames
   * @property {Array<String>} [options.months=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]] - Array containing all months names.
   * @property {Array<String>} [options.days=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]] - Array containing all days names.
   * @property {Function} [options.label=function (date, fps, months, days) { var h = date.getHours(); var m = date.getMinutes(); var s = date.getSeconds(); return ((h < 10) ? ("0" + h) : h) + ":" + ((m < 10) ? ("0" + m) : m) + ":" + ((s < 10) ? ("0" + s) : s);] - Callback to format the main label.
   * @property {Function} [options.label_upper=function (date, fps, months, days) { return days[date.getDay()]; }] - Callback to format the upper label.
   * @property {Function} [options.label_lower=function (date, fps, months, days) { var d = date.getDate(); var m = date.getMonth(); var y = date.getFullYear()return ((d < 10) ? ("0" + d) : d) + ". " + months[m] + " " + y; }] - Callback to format the lower label.
   * @property {Number} [options.label_scale=0.33] - The scale of `label_upper` and `label_lower` compared to the main label.
   * @property {Number} [options.label_margin=10] - Margin between the rings and the main label in percent of the overall size.
   * @property {Number} [options.label_upper_pos=0.33] - Position of the upper label as fraction of the overall height.
   * @property {Number} [options.label_lower_pos=0.66] - Position of the lower label as fraction of the overall height.
   * @property {Number|String|Date} [options.time] - Set a specific time and date. To avoid auto-udates, set `timeout` to 0.
   *   For more information about the value, please refer to <a href="https://www.w3schools.com/jsref/jsref_obj_date.asp">W3Schools</a>.
   */
  Extends: Widget,
  _options: Object.assign(Object.create(Widget.prototype._options), {
    thickness: 'number',
    margin: 'number',
    size: 'number',
    show_seconds: 'boolean',
    show_minutes: 'boolean',
    show_hours: 'boolean',
    timeout: 'int',
    timeadd: 'int',
    offset: 'int',
    fps: 'number',
    months: 'array',
    days: 'array',
    label: 'function',
    label_upper: 'function',
    label_lower: 'function',
    label_scale: 'number',
    label_margin: 'number',
    label_upper_pos: 'number',
    label_lower_pos: 'number',
    time: 'object|string|number',
  }),
  options: {
    thickness: 10, // thickness of the rings
    margin: 1, // margin between the circulars
    size: 200, // diameter of the whole clock
    show_seconds: true, // show the seconds ring
    show_minutes: true, // show the minutes ring
    show_hours: true, // show the hours ring
    timeout: 1000, // set a timeout to update the clock with the
    // system clock regulary
    timeadd: 10, // set additional milliseconds for the
    // timeout target
    // system clock regulary
    offset: 0, // if a timeout is set offset the system time
    // in milliseconds
    fps: 25, // framerate for calculatind SMTP frames
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    days: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    label: function (date /*, fps, months, days*/) {
      const h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
      return (
        (h < 10 ? '0' + h : h) +
        ':' +
        (m < 10 ? '0' + m : m) +
        ':' +
        (s < 10 ? '0' + s : s)
      );
    },
    label_upper: function (date, fps, months, days) {
      return days[date.getDay()];
    },
    label_lower: function (date, fps, months /*, days*/) {
      const d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear();
      return (d < 10 ? '0' + d : d) + '. ' + months[m] + ' ' + y;
    },
    label_scale: 0.33, // the scale of the upper and lower labels
    // compared to the main label
    label_margin: 10,
    label_upper_pos: 0.33,
    label_lower_pos: 0.66,
  },
  static_events: {
    hide: onhide,
    show: timeout,
    timeout: timeout,
  },
  initialize: function (options) {
    let SVG;
    /**
     * @member {Object} Clock#circulars - An object holding all three Circular as members <code>seconds</code>, <code>minutes</code> and <code>hours</code>.
     */
    this.circulars = {};
    this._margin = -1;
    if (!options.element) options.element = element('div');
    Widget.prototype.initialize.call(this, options);
    this.set('time', this.options.time);

    /**
     * @member {HTMLDivElement} Clock#element - The main DIV element. Has class <code>.aux-clock</code>
     */
    /**
     * @member {SVGImage} Clock#svg - The main SVG image.
     */
    this.svg = SVG = makeSVG('svg');

    /**
     * @member {SVGText} Clock#_label - The center label showing the time. Has class<code>.aux-label</code>
     */
    this._label = makeSVG('text', {
      class: 'aux-label',
      'text-anchor': 'middle',
      style: 'dominant-baseline: central;',
    });
    /**
     * @member {SVGText} Clock#_label_upper - The upper label showing the day. Has class<code>.aux-upperlabel</code>
     */
    this._label_upper = makeSVG('text', {
      class: 'aux-upperlabel',
      'text-anchor': 'middle',
      style: 'dominant-baseline: central;',
    });
    /** @member {SVGText} Clock#_label_lower - The lower label showing the date. Has class<code>.aux-lowerlabel</code>
     */
    this._label_lower = makeSVG('text', {
      class: 'aux-lowerlabel',
      'text-anchor': 'middle',
      style: 'dominant-baseline: central;',
    });
    SVG.appendChild(this._label);
    SVG.appendChild(this._label_upper);
    SVG.appendChild(this._label_lower);

    const circ_options = {
      container: SVG,
      show_hand: false,
      start: 270,
      angle: 360,
      min: 0,
    };

    /**
     * @member {Object} Clock#circulars - An object containing the {@link Circular}
     * widgets. Members are `seconds`, `minutes` and `hours`.
     */
    this.circulars.seconds = new Circular(
      Object.assign({}, circ_options, { max: 60, class: 'aux-seconds' })
    );
    this.circulars.minutes = new Circular(
      Object.assign({}, circ_options, { max: 60, class: 'aux-minutes' })
    );
    this.circulars.hours = new Circular(
      Object.assign({}, circ_options, { max: 12, class: 'aux-hours' })
    );

    this.addChild(this.circulars.seconds);
    this.addChild(this.circulars.minutes);
    this.addChild(this.circulars.hours);

    // start the clock
    this.__timeout = timeout.bind(this);
  },

  draw: function (O, element) {
    addClass(element, 'aux-clock');
    element.appendChild(this.svg);

    Widget.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    const I = this.invalid,
      O = this.options;

    Widget.prototype.redraw.call(this);

    if (I.size) {
      this.svg.setAttribute('viewBox', formatViewbox(O.size, O.size));
    }

    if (
      I.validate(
        'show_hours',
        'show_minutes',
        'show_seconds',
        'thickness',
        'margin'
      ) ||
      I.size
    ) {
      let margin = 0;
      for (const i in this.circulars) {
        if (!Object.prototype.hasOwnProperty.call(this.circulars, i)) continue;
        const circ = this.circulars[i];
        if (O['show_' + i]) {
          circ.set('thickness', O.thickness);
          circ.set('show_base', true);
          circ.set('show_value', true);
          circ.set('size', O.size);
          circ.set('margin', margin);
          margin += O.thickness;
          margin += circ.getStroke();
          margin += O.margin;
        } else {
          circ.set('show_base', false);
          circ.set('show_value', false);
        }
      }
      if (this._margin < 0) {
        this._margin = margin;
      } else {
        this._margin = margin;
      }
      // force setLabels
      I.label = true;
    }

    if (I.validate('label', 'months', 'days', 'size', 'label_scale')) {
      setLabels.call(this);
    }

    if (
      I.validate('time', 'label', 'label_upper', 'label_lower', 'label_scale')
    ) {
      drawTime.call(this, false);
    }
  },

  destroy: function () {
    this._label.remove();
    this._label_upper.remove();
    this._label_lower.remove();
    this.circulars.seconds.destroy();
    this.circulars.minutes.destroy();
    this.circulars.hours.destroy();
    if (this.__to) window.clearTimeout(this.__to);
    Widget.prototype.destroy.call(this);
  },

  set: function (key, value) {
    switch (key) {
      case 'time':
        if (Object.prototype.toString.call(value) === '[object Date]') break;
        value = new Date(value);
        break;
    }
    return Widget.prototype.set.call(this, key, value);
  },
});

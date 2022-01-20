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

import { Widget } from './widget.js';
import { Circular } from './circular.js';
import { setText, element, addClass, getStyle } from '../utils/dom.js';
import { makeSVG } from '../utils/svg.js';
import { FORMAT } from '../utils/sprintf.js';
import { defineRender, deferMeasure, deferRender } from '../renderer.js';

const formatViewbox = FORMAT('0 0 %d %d');

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
    this.invalidate('time');

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
export class Clock extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), {
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
    });
  }

  static get options() {
    return {
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
    };
  }

  static get static_events() {
    return {
      hide: onhide,
      show: timeout,
      timeout: timeout,
    };
  }

  static get renderers() {
    return [
      defineRender('size', function (size) {
        this.svg.setAttribute('viewBox', formatViewbox(size, size));
      }),
      defineRender(
        [
          'thickness',
          'margin',
          'size',
          'show_hours',
          'show_minutes',
          'show_seconds',
        ],
        function (
          thickness,
          margin,
          size,
          show_hours,
          show_minutes,
          show_seconds
        ) {
          const show = {
            hours: show_hours,
            minutes: show_minutes,
            seconds: show_seconds,
          };

          let _margin = 0;

          for (const name in this.circulars) {
            if (!Object.prototype.hasOwnProperty.call(this.circulars, name))
              continue;
            const circular = this.circulars[name];

            if (show[name]) {
              circular.set('thickness', thickness);
              circular.set('show_base', true);
              circular.set('show_value', true);
              circular.set('size', size);
              circular.set('margin', _margin);
              _margin += thickness;
              _margin += circular.getStroke();
              _margin += margin;
            } else {
              circular.set('show_base', false);
              circular.set('show_value', false);
            }
          }

          this.set('_margin', _margin);
        }
      ),

      defineRender(
        [
          'label',
          'months',
          'days',
          'label_margin',
          'size',
          'label_upper_pos',
          'label_scale',
          'label_lower_pos',
          '_margin',
        ],
        function (
          label,
          months,
          days,
          label_margin,
          size,
          label_upper_pos,
          label_scale,
          label_lower_pos,
          _margin
        ) {
          const { _label } = this;

          setText(
            _label,
            label(
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
              months,
              days
            )
          );
          _label.setAttribute('transform', '');

          return deferMeasure(() => {
            let bb = _label.getBoundingClientRect();
            const eb = this.svg.getBoundingClientRect();
            const size = Math.min(eb.width, eb.height);
            if (bb.width === 0) return; // we are hidden
            const mleft = parseInt(getStyle(_label, 'margin-left')) || 0;
            const mright = parseInt(getStyle(_label, 'margin-right')) || 0;
            const mlabel = (label_margin / 100) * size;
            const space = size - mleft - mright - _margin * 2 - mlabel * 2;
            const scale = space / bb.width;
            const pos = size / 2;

            return deferRender(() => {
              _label.setAttribute(
                'transform',
                'translate(' + pos + ',' + pos + ') ' + 'scale(' + scale + ')'
              );

              return deferMeasure(() => {
                bb = _label.getBoundingClientRect();

                return deferRender(() => {
                  this._label_upper.setAttribute(
                    'transform',
                    'translate(' +
                      pos +
                      ',' +
                      label_upper_pos * size +
                      ') ' +
                      'scale(' +
                      scale * label_scale +
                      ')'
                  );
                  this._label_lower.setAttribute(
                    'transform',
                    'translate(' +
                      pos +
                      ',' +
                      label_lower_pos * size +
                      ') ' +
                      'scale(' +
                      scale * label_scale +
                      ')'
                  );

                  // draw the time
                  this.invalidate('time');
                });
              });
            });
          });
        }
      ),
      defineRender(
        [
          'time',
          'label',
          'label_upper',
          'label_lower',
          'fps',
          'months',
          'days',
        ],
        function (time, label, label_upper, label_lower, fps, months, days) {
          const { hours, seconds, minutes } = this.circulars;

          if (!(time instanceof Date) || isNaN(time)) time = new Date();

          seconds.set('value', time.getSeconds());
          minutes.set('value', time.getMinutes());
          hours.set('value', time.getHours());

          const args = [time, fps, months, days];

          setText(this._label, label.apply(this, args));
          setText(this._label_upper, label_upper.apply(this, args));
          setText(this._label_lower, label_lower.apply(this, args));
          /**
           * Is fired when the time was drawn.
           *
           * @param {Date} time - The time which was drawn.
           *
           * @event Clock#timedrawn
           */
          this.emit('timedrawn', time);
        }
      ),
    ];
  }

  initialize(options) {
    let SVG;
    /**
     * @member {Object} Clock#circulars - An object holding all three Circular as members <code>seconds</code>, <code>minutes</code> and <code>hours</code>.
     */
    this.circulars = {};
    if (!options.element) options.element = element('div');
    super.initialize(options);
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
  }

  draw(O, element) {
    addClass(element, 'aux-clock');
    element.appendChild(this.svg);

    super.draw(O, element);
  }

  destroy() {
    this._label.remove();
    this._label_upper.remove();
    this._label_lower.remove();
    this.circulars.seconds.destroy();
    this.circulars.minutes.destroy();
    this.circulars.hours.destroy();
    if (this.__to) window.clearTimeout(this.__to);
    super.destroy();
  }

  set(key, value) {
    switch (key) {
      case 'time':
        if (Object.prototype.toString.call(value) === '[object Date]') break;
        value = new Date(value);
        break;
    }
    return super.set(key, value);
  }
}

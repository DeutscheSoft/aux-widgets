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

import { defineClass } from '../widget_helpers.js';
import { Meter } from './meter.js';
import { addClass } from '../utils/dom.js';

/**
 * ProgressBar is a pre-configured {@link LevelMeter} to display
 * progress in percent.
 *
 * @extends Meter
 *
 * @class ProgressBar
 */
export const ProgressBar = defineClass({
  Extends: Meter,
  _options: Object.create(Meter.prototype._options),
  options: {
    min: 0,
    max: 100,
    show_scale: false,
    show_value: true,
    format_value: function (v) {
      return v.toFixed(2) + '%';
    },
    layout: 'top',
  },
  initialize: function (options) {
    Meter.prototype.initialize.call(this, options);
    /**
     * @member {HTMLDivElement} ProgressBar#element - The main DIV container.
     *   Has class <code>.aux-progressbar</code>.
     */
    this.setParent(null);
  },
  draw: function (O, element) {
    addClass(element, 'aux-progressbar');

    Meter.prototype.draw.call(this, O, element);
  },
});

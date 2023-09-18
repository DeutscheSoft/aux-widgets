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

import { LevelMeter } from './levelmeter.js';
import { addClass, element } from '../utils/dom.js';

/**
 * PhaseMeter is a {@link LevelMeter} configured to display phase
 * correlation.
 *
 * @extends LevelMeter
 * @class PhaseMeter
 *
 */
export class PhaseMeter extends LevelMeter {
  static get options() {
    return {
      show_clip: false,
      layout: 'top',
      min: -1,
      max: 1,
      base: 0,
      levels: [0.05, 0.1, 0.5, 1],
    };
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    /**
     * @member {HTMLDivElement} PhaseMeter#element - The main DIV container.
     *   Has class <code>.aux-phasemeter</code>.
     */
  }

  draw(O, element) {
    addClass(element, 'aux-phasemeter');
    if (!Object.prototype.hasOwnProperty.call(O, 'scale.labels')) {
      this.scale.set('labels', function (v) {
        return (v > 0 ? '+' : v < 0 ? '-' : '') + v.toFixed(1);
      });
    }
    if (!Object.prototype.hasOwnProperty.call(O, 'scale.base')) {
      this.scale.set('base', 0);
    }
    super.draw(O, element);
  }
}

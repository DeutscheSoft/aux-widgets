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

import {
  element,
  addClass,
  removeClass,
  innerWidth,
  outerWidth,
  createID,
} from './../utils/dom.js';
import { Container } from './container.js';
import { Label } from './label.js';
import { defineChildWidget } from '../child_widget.js';
import { defineRender } from '../renderer.js';

/**
 * Marquee is a {@link Label} inside a {@link Container}. Marquee
 * inherits all options of {@link Label}.
 *
 * @class Marquee
 *
 * @extends Container
 *
 * @property {Number} [options.speed=50] - Speed of the movement in CSS pixels per second.
 * @property {Number} [options.pause=1000] - Pause the animation on start and end for this amount of milliseconds.
 * @property {String} [options.easing='linear'] - Function of the animation,
 *   one out of `ease`, `linear`, `ease-in`, `ease-out`, `ease-in-out`,
 *   `cubic-bezier(n, n, n, n)
 */
export class Marquee extends Container {
  static get _options() {
    return {
      speed: 'number',
      pause: 'number',
      easing: 'string',
      _inner: 'number',
      _outer: 'number',
    };
  }

  static get options() {
    return {
      speed: 50,
      pause: 1000,
      easing: 'linear',
      _inner: 0,
      _outer: 0,
    };
  }

  static get static_events() {
    return {
      set_label: function () {
        this.triggerResize();
      },
    };
  }

  static get renderers() {
    return [
      defineRender(['easing', 'speed', 'pause', '_inner', '_outer'], function (
        easing,
        speed,
        pause,
        _inner,
        _outer
      ) {
        const range = _inner - _outer;
        const msecs = (range / speed) * 1000;
        const duration = Math.round(msecs + pause);
        const perc = ((pause / 2 / duration) * 100).toFixed(2);
        const to = (100 - perc).toFixed(2);
        const id = this.label.get('id');

        if (!(range > 0)) {
          this._style.textContent = '';
          addClass(this.element, 'aux-static');
        } else {
          this._style.textContent = `
            #${id} {
              animation: ${id} ${duration}ms ${easing} infinite alternate;
            }
            @keyframes ${id} {
              0% { left: 0; transform: translateX(0); }
              ${perc}% { left: 0; transform: translateX(0); }
              ${to}% { left: 100%; transform: translateX(-100%); }
              100% { left: 100%; transform: translateX(-100%); }
            }
            `;
          removeClass(this.element, 'aux-static');
        }
      }),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    this._style = element('style', { type: 'text/css' });
    document.head.appendChild(this._style);
  }

  draw(O, element) {
    /** @member {HTMLDivElement} Marquee#element - The main DIV container.
     * Has class <code>.aux-marquee</code>.
     */
    addClass(element, 'aux-marquee');
    this.label.set('id', createID('aux-label-'));
    super.draw(O, element);
  }

  getResizeTargets() {
    return [this.element, this.label.element];
  }

  resize() {
    super.resize();
    this.set('_outer', innerWidth(this.element, undefined, true));
    this.set('_inner', outerWidth(this.label.element, false, undefined, true));
  }

  destroy() {
    if (this._style) this._style.remove();
    super.destroy();
  }
}

/**
 * @member {Label} Marquee#label - Instance of {@link Label} displaying
 *   the text to be scrolled.
 */
defineChildWidget(Marquee, 'label', {
  create: Label,
  show: true,
  inherit_options: true,
});

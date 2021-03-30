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

import { element, addClass, removeClass, innerWidth, outerWidth } from './../utils/dom.js';
import { defineClass } from './../widget_helpers.js';
import { Container } from './container.js';
import { Label } from './label.js';
import { defineChildWidget } from '../child_widget.js';

function setAnimation () {
  const O = this.options;
  const speed = O.speed;
  const pause = O.pause;
  const inner = O._inner;
  const outer = O._outer;
  const range = inner - outer;
  const msecs = range / speed * 1000;
  const full = msecs + pause * 2;
  const perc = Math.round(pause / full * 100);
  const secs = Math.round(msecs / 1000);
  const to = 100 - perc;
  const id = this._id;
  
  if (range <= 0) {
    this._style.textContent = '';
    addClass(this.element, 'aux-static');
    return;
  }
  
  this._style.textContent = `
  #${id} {
    animation: ${id} ${secs}s linear infinite alternate;
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

export const Wanderer = defineClass({
  /**
   * Wanderer is a {@link Label} inside a {@link Container}. Wanderer
   * inherits all options of {@link Label}.
   *
   * @class Wanderer
   *
   * @extends Container
   *
   * @property {Number} [options.speed=50] - Speed of the movement in CSS pixels per second.
   * @property {Number} [options.pause=1000] - Pause the animation on start and end for this amount of milliseconds.
   */
  Extends: Container,
  _options: Object.assign(Object.create(Container.prototype._options), {
    speed: 'number',
    pause: 'number',
    _inner: 'number',
    _outer: 'number',
  }),
  options: {
    speed: 50,
    pause: 1000,
    _inner: 0,
    _outer: 0,
  },
  static_events: {
    set_label: function () { this.triggerResize(); }
  },
  initialize: function (options) {
    if (!options.element) options.element = element('div');
    Container.prototype.initialize.call(this, options);
    /** @member {HTMLDivElement} Wanderer#element - The main DIV container.
     * Has class <code>.aux-wanderer</code>.
     */
    this._id = 'aux-animation_' + Math.random().toString(16).substr(2, 8);
    this._style = element('style', {'type': 'text/css'});
    document.head.appendChild(this._style);
  },
  draw: function (O, element) {
    addClass(element, 'aux-wanderer');
    this.label.element.id = this._id;
    Container.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    var I = this.invalid;
    var O = this.options;

    Container.prototype.redraw.call(this);

    if (I.speed || I.pause || I._inner || I._outer || I.label) {
      I.speed = I.pause = I._inner = I._outer = false;
      setAnimation.call(this);
    }
  },
  
  resize: function () {
    Container.prototype.resize.call(this);
    this.set('_outer', innerWidth(this.element));
    this.set('_inner', outerWidth(this.label.element));
  }
});

/**
 * @member {Label} Wanderer#label - Instance of {@link Label} displaying
 *   the text to be scrolled.
 */
defineChildWidget(Wanderer, 'label', {
  create: Label,
  show: true,
  inherit_options: true,
});

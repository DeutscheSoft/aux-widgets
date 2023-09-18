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
import { element, addClass } from '../utils/dom.js';

/**
 * The ScrollArea widget disables or enabled rendering in its child widgets
 * depending on whether or not they are visible according to an
 * IntersectionObserver.
 *
 * @class ScrollArea
 * @extends Widget
 * @param {Object} [options={ }] - An object containing initial options.
 *
 */
export class ScrollArea extends Widget {
  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    this._visible = new Set();
    this._elementToWidget = new Map();

    const visibilityChanged = (entries, observer) => {
      entries.forEach((entry) => {
        const widget = this._elementToWidget.get(entry.target);
        if (!widget) return;

        if (entry.isIntersecting) {
          this._visible.add(widget);
        } else {
          this._visible.delete(widget);
        }

        if (this._drawn) {
          if (entry.isIntersecting) {
            widget.enableDraw();
          } else {
            widget.disableDraw();
          }
        }
      });
    };
    this._observer = new IntersectionObserver(visibilityChanged, {
      root: this.element,
    });
  }

  draw(O, element) {
    addClass(element, 'aux-scroller');
    super.draw(O, element);
  }

  enableDrawChildren() {
    const C = this.children;
    if (!C) return;

    for (let i = 0; i < C.length; i++) {
      const child = C[i];
      if (this._visible.has(child)) child.enableDraw();
    }
  }

  addChild(child) {
    super.addChild(child);
    this._elementToWidget.set(child.element, child);
    this._observer.observe(child.element);
  }

  removeChild(child) {
    super.removeChild(child);
    this._elementToWidget.delete(child.element);
    this._observer.unobserve(child.element);
  }

  destroy() {
    this._observer.disconnect();
    super.destroy();
  }
}

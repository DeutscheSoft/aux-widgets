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
import { Container } from './container.js';
import { Widget } from './widget.js';
import { addClass, element, innerWidth, innerHeight, outerWidth, outerHeight } from '../utils/dom.js';
import { defineChildWidget } from '../child_widget.js';
import { Ranged } from '../implements/ranged.js';
import { DragValue } from '../modules/dragvalue.js';

function vert () {
  return this.options.position === ('right' || 'left');
}

/**
 * ScrollHide is a special {@link Container} used inside {@link Scroller}
 * for hiding browsers native scroll bars.
 *
 * @extends Container
 *
 * @class ScrollHide
 */
export const ScrollHide = defineClass({
  Extends: Container,
  draw: function (O, element) {
    /**
     * @member {HTMLDivElement} ScrollHide#element - The container.
     *   Has class <code>.aux-scrollhide</code>.
     */
    addClass(element, 'aux-scrollhide');
    Container.prototype.draw.call(this, O, element);
  },
});

function setScrollRange() {
  const O = this.options;
  const max = O.content - O.clip;
  this.set('max', max);
  const size = O.clip / O.content;
  this.set('basis', O.clip - size * O.clip);
}

/**
 * ScrollBar is a widget offering the functionality of a browsers
 * native scroll bar handle.
 *
 * @extends Widget
 * 
 * @class ScrollBar
 *
 * @property {String} [position='right'] - The border the scrollbar is
 *   attached to, either `top`, `right`, `bottom` or `left`.
 */
export const ScrollBar = defineClass({
  Extends: Widget,
  Implements: Ranged,
  _options: Object.assign(
    Object.create(Widget.prototype._options),
    Ranged.prototype._options,
    DragValue.prototype._options,
    {
      position: 'string',
      content: 'number',
      clip: 'number',
      scroll: 'number',
    },
  ),
  options: {
    position: 'right',
    content: 0,
    clip: 0,
    scroll: 0,
    reverse: true,
  },
  static_events: {
    set_content: setScrollRange,
    set_clip: setScrollRange,
    set_position: function (pos) {
      this.drag.set('direction', vert.call(this) ? 'vertical' : 'horizontal');
    },
  },
  initialize: function(options) {
    if (!options.element) options.element = element('div');
    const E = this.element;
    Widget.prototype.initialize.call(this, options);

    this.drag = new DragValue(this, {
      node: E,
      classes: E,
      get: function () { return this.parent.options.scroll; },
      set: function (v) { return this.parent.userset('scroll', v); },
      limit: true,
      absolute: true,
    });
    this.set('position', this.options.position);
  },
  draw: function (O, element) {
    /**
     * @member {HTMLDivElement} Scroller#element - The scrollbar handle.
     *   Has class <code>.aux-scrollbar</code>.
     */
    addClass(element, 'aux-scrollbar');

    Widget.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    const O = this.options;
    const E = this.element;
    const I = this.invalid;
    if (I.position) {
      this.removeClass(
        'aux-left',
        'aux-right',
        'aux-top',
        'aux-bottom',
        'aux-vertical',
        'aux-horizontal'
      );
      this.addClass('aux-' + O.position);
      this.addClass('aux-' + (vert.call(this) ? 'vertical' : 'horizontal'));
    }
    if (I.validate('position', 'content', 'clip', 'scroll')) {
      const clip = O.clip;
      const content = O.content;
      const scroll = O.scroll;
      if (clip && content) {
        let size = clip / content;
        if (size >= 1) {
          //this.update('visible', false);
          this.element.style.display = 'none';
        } else {
          //this.update('visible', true);
          this.element.style.display = 'block';
          let pos = scroll / (content - clip);
          pos = (pos * (clip - (size * clip)));
          if (vert.call(this)) {
            outerHeight(this.element, true, clip * size);
            this.element.style.top = pos + 'px';
          }
          else {
            outerWidth(this.element, true, clip * size);
            this.element.style.left = pos + 'px';
          }
        }
      } else {
        //this.update('visible', false);
        this.element.style.display = 'none';
      }
    }
    Widget.prototype.redraw.call(this);
  },
});

/**
 * Scroller mimics the behavior of typical operating system scrollbars
 * to be used in {@link Container}s hiding the generic scroll bars for styling
 * purposes.
 *
 * @extends Container
 *
 * @class Scroller
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Boolean} [scroll_x=true] Scroll in x direction.
 * @property {Boolean} [scroll_y=true] Scroll in y direction.
 */

function changed (e) {
  this.scroll_x.update('content', this.scrollhide.element.scrollWidth);
  this.scroll_x.update('scroll', this.scrollhide.element.scrollLeft);
  this.scroll_y.update('content', this.scrollhide.element.scrollHeight);
  this.scroll_y.update('scroll', this.scrollhide.element.scrollTop);
}
function usersetScrollX(key, value) {
  this.parent.scrollhide.element.scrollLeft = value;
}
function usersetScrollY(key, value) {
  this.parent.scrollhide.element.scrollTop = value;
}
export const Scroller = defineClass({
  Extends: Container,
  _options: Object.assign(Object.create(Container.prototype._options), {
    scroll_x: 'boolean',
    scroll_y: 'boolean',
  }),
  options: {
    scroll_x: true,
    scroll_y: true,
  },
  static_events: {
  },
  initialize: function(options) {
    if (!options.element) options.element = element('div');
    Container.prototype.initialize.call(this, options);
    this._changed = changed.bind(this);
    this.observer = new MutationObserver(this._changed);
  },
  draw: function (O, element) {
    /**
     * @member {HTMLDivElement} Scroller#element - The scrollbar handle.
     *   Has class <code>.aux-scrollbar</code>.
     */
    addClass(element, 'aux-scroller');

    this.scroll_x.addEventListener('userset', usersetScrollX);
    this.scroll_y.addEventListener('userset', usersetScrollY);
    
    Container.prototype.draw.call(this, O, element);
  },
  redraw: function() {
    const O = this.options;
    const E = this.element;
    const I = this.invalid;
    if (I.validate('scroll_x')) {
      this[O.scroll_x ? 'addClass' : 'removeClass']('aux-scrollx');
    }
    if (I.validate('scroll_y')) {
      this[O.scroll_y ? 'addClass' : 'removeClass']('aux-scrolly');
    }
  },
  resize: function () {
    this._changed();
    this.scroll_x.update('clip', innerWidth(this.element, undefined, true));
    this.scroll_y.update('clip', innerHeight(this.element, undefined, true));
  },
  appendChild: function (child) {
    Container.prototype.appendChild.call(this, child);
    this.scrollhide.appendChild(child.element);
  },
  addChild: function (child) {
    Container.prototype.addChild.call(this, child);

    if (child instanceof ScrollHide) {
      if (this.scrollhide && this.scrollhide !== child) {
        this.removeChild(this.scrollhide);
      }
      this.scrollhide = child;
      this.observer.observe(this.scrollhide.element, {
        attributes: false,
        childList: true,
        subtree: true
      });
      this.scrollhide.element.addEventListener('scroll', this._changed);
    }
  },
  removeChild: function (child) {
    if (child instanceof ScrollHide) {
      if (this.scrollhide === child) {
        this.observer.disconnect();
        this.scrollhide.element.removeEventListener('scroll', this._changed);
        this.scrollhide.element.remove();
        this.scrollhide = null;
      }
    }
    Container.prototype.removeChild.call(this, child);
  },
  set: function (key, value) {
    if (key === 'scroll' && value == this.options.scroll)
      return;
    Container.prototype.set.call(this, key, value);
  },
});

defineChildWidget(Scroller, 'scrollhide', {
  create: ScrollHide,
  show: true,
});

defineChildWidget(Scroller, 'scroll_x', {
  create: ScrollBar,
  show: true,
  default_options: {
    position: 'bottom',
  },
});
defineChildWidget(Scroller, 'scroll_y', {
  create: ScrollBar,
  show: true,
});

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

import { S } from '../dom_scheduler.js';
import { defineClass } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import {
  addClass,
  removeClass,
  toggleClass,
  innerHeight,
  innerWidth,
} from '../utils/dom.js';
import { Button } from './button.js';
import { Buttons } from './buttons.js';
import { Container } from './container.js';

function easeLinear(t) {
  return t;
}

function easeInOut(t) {
  if (t < 0.5) {
    return 2 * t * t;
  } else {
    return 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}

class ScrollAnimation {
  constructor(options) {
    this.element = options.element;
    this.duration = options.duration;

    if (this.duration < 0) {
      this.duration = 0;
    }

    this.from = options.from;
    this.to = options.to;
    this.vertical = options.vertical;
    this.easing = options.easing || easeLinear;
    this.startTime = performance.now();
    this._draw = () => {
      let t =
        this.duration > 0
          ? (performance.now() - this.startTime) / this.duration
          : 1;

      // catch NaN
      if (t < 0) t = 0;
      else if (t > 1) t = 1;

      const pos = this.from + this.easing(t) * (this.to - this.from);

      if (this.vertical) {
        this.element.scrollTop = pos;
      } else {
        this.element.scrollLeft = pos;
      }

      if (t < 1) {
        S.addNext(this._draw);
      }
    };
    this.start();
  }

  stop() {
    S.remove(this._draw);
  }

  pause() {
    S.remove(this._draw);
  }

  start() {
    S.add(this._draw);
  }
}

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>select</code>.
 *
 * @event Navigation#useraction
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */

function autoArrows() {
  var O = this.options;
  if (!O.auto_arrows) return;
  var B = this.buttons.getButtons();
  var vert = O.direction === 'vertical';
  var cons = vert
    ? innerHeight(this.buttons.element)
    : innerWidth(this.buttons.element);
  var list;
  if (B.length) {
    var lastb = B[B.length - 1].element;
    var rect = lastb.getBoundingClientRect();
    list =
      lastb[vert ? 'offsetTop' : 'offsetLeft'] +
      rect[vert ? 'height' : 'width'];
  } else {
    list = 0;
  }
  this.update('arrows', list > cons);
}

function prevClicked() {
  this.userset('select', Math.max(0, this.options.select - 1));
}
function prevDblClicked() {
  this.userset('select', 0);
}

function nextClicked() {
  this.userset(
    'select',
    Math.min(this.buttons.getButtons().length - 1, this.options.select + 1)
  );
}
function nextDblClicked() {
  this.userset('select', this.buttons.getButtons().length - 1);
}

/**
 * Navigation is a {@link Container} including a {@Buttons} widget for e.g. navigating between
 * pages inside a {@link Pager}. It keeps the currently highlighted {@link Button}
 * inside the visible area and adds previous and next {@link Button}s
 * if needed.
 *
 * @extends Container
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} [options.direction="horizontal"] - The layout of
 *   the Navigation, either `horizontal` or `vertical`.
 * @property {Boolean} [options.arrows=false] - Show or hide previous and next {@link Button}s.
 * @property {Boolean} [options.auto_arrows=true] - Set to false to disable
 *   automatic creation of the previous/next buttons.
 * @property {Integer} [options.scroll=500] - Duration of the scrolling animation.
 *
 * @class Navigation
 */
export const Navigation = defineClass({
  Extends: Container,
  _class: 'Navigation',
  _options: Object.assign(Object.create(Container.prototype._options), {
    _clip_width: 'number',
    _clip_height: 'number',
    _list_width: 'number',
    _list_height: 'number',
    _button_positions: 'object',

    direction: 'string',
    arrows: 'boolean',
    auto_arrows: 'boolean',
    resized: 'boolean',
    scroll: 'int',
  }),
  options: {
    direction: 'horizontal',
    arrows: false,
    auto_arrows: true,
    resized: false,
    scroll: 500,
  },
  static_events: {
    set_direction: function (value) {
      this.prev.set('icon', value === 'vertical' ? 'arrowup' : 'arrowleft'); //"\u25B2" : "\u25C0");
      this.next.set('icon', value === 'vertical' ? 'arrowdown' : 'arrowright'); //"\u25BC" : "\u25B6");
    },
    hide: function () {
      if (this._scroll_animation) {
        this._scroll_animation.pause();
      }
    },
    show: function () {
      if (this._scroll_animation) {
        this._scroll_animation.start();
      }
    },
  },
  _getButtonScrollPosition: function () {
    const O = this.options;
    const show = O.select;
    const button_list = this.buttons.getButtons();

    if (show < 0 || show >= button_list.length) return 0;

    const button_position = O._button_positions.get(button_list[show]);

    if (!button_position) return 0;

    const is_vertical = O.direction === 'vertical';
    const clip_size = is_vertical ? O._clip_height : O._clip_width;
    const list_size = is_vertical ? O._list_height : O._list_width;
    const offset = is_vertical ? button_position.top : button_position.left;
    const button_size = is_vertical
      ? button_position.height
      : button_position.width;

    /*
        console.log(O, 'clip_size', clip_size, 'list_size', list_size, 'offset', offset,
                    'button_size', button_size);

        console.log('innerHeight', innerHeight(this.buttons.element));
        */

    let pos = Math.min(
      offset + button_size / 2 - clip_size / 2,
      list_size - clip_size
    );

    if (pos < 0) pos = 0;

    return pos;
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    var O = this.options;
    /**
     * @member {HTMLDivElement} Navigation#element - The main DIV container.
     *   Has class <code>.aux-navigation</code>.
     */
    /**
     * @member {Button} Navigation#prev - The previous arrow {@link Button} instance.
     */
    this.prev = new Button({ class: 'aux-previous', dblclick: 400 });
    /**
     * @member {Button} Navigation#next - The next arrow {@link Button} instance.
     */
    this.next = new Button({ class: 'aux-next', dblclick: 400 });

    this.prev.on('click', prevClicked.bind(this));
    this.prev.on('doubleclick', prevDblClicked.bind(this));
    this.next.on('click', nextClicked.bind(this));
    this.next.on('doubleclick', nextDblClicked.bind(this));

    // these properties contain the scroll position of the buttons child
    // element
    this._scroll_left = 0;
    this._scroll_top = 0;

    this.set('_button_positions', new Map());

    this.set('auto_arrows', this.options.auto_arrows);
    this.set('direction', this.options.direction);
  },
  initialized: function () {
    Container.prototype.initialized.call(this);

    const measure_clip = () => {
      const buttons = this.buttons;

      this.update('_clip_height', innerHeight(buttons.element));
      this.update('_clip_width', innerWidth(buttons.element));
    };

    this.addSubscriptions(
      this.buttons.buttons.forEachAsync((button) => {
        let measured = false;
        const positions = this.get('_button_positions');
        const updateLength = () => {
          let list_width = 0;
          let list_height = 0;

          positions.forEach((info) => {
            list_width = Math.max(list_width, info.width + info.left);
            list_height = Math.max(list_height, info.height + info.top);
          });

          this.update('_list_width', list_width);
          this.update('_list_height', list_height);
        };

        const info = {
          width: 0,
          height: 0,
          left: 0,
          top: 0,
        };
        const measure = (_button) => {
          const element = _button.element;
          const bounding_box = element.getBoundingClientRect();

          info.width = bounding_box.width;
          info.height = bounding_box.height;
          info.left = element.offsetLeft;
          info.top = element.offsetTop;

          if (!measured) {
            measured = true;
            positions.set(_button, info);
          }
          updateLength();
          this.invalidate('_button_positions');
        };

        let sub = button.observeResize(measure);

        return () => {
          if (!sub) return;
          sub();
          sub = null;
          if (measured) {
            positions.delete(button);
            updateLength();
            this.invalidate('_button_positions');
          }
        };
      }),
      this.buttons.observeResize(measure_clip),
      this.next.observeResize(measure_clip),
      this.prev.observeResize(measure_clip),
      this.buttons.subscribe('scroll', () => {
        this._scroll_top = this.buttons.element.scrollTop;
        this._scroll_left = this.buttons.element.scrollLeft;
      })
    );
  },
  resize: function () {
    autoArrows.call(this);
    Container.prototype.resize.call(this);
  },
  draw: function (O, element) {
    addClass(element, 'aux-navigation');
    Container.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    var O = this.options;
    var I = this.invalid;
    var E = this.element;

    if (I.direction) {
      removeClass(E, 'aux-vertical', 'aux-horizontal');
      addClass(E, 'aux-' + O.direction);
    }
    if (I.validate('arrows')) {
      if (O.arrows) {
        if (!this.prev.element.parentElement) {
          E.appendChild(this.prev.element);
          E.appendChild(this.next.element);
          this.addChild(this.prev);
          this.addChild(this.next);
        }
      } else {
        if (this.prev.element.parentElement) {
          E.removeChild(this.prev.element);
          E.removeChild(this.next.element);
          this.removeChild(this.prev);
          this.removeChild(this.next);
        }
      }
      toggleClass(E, 'aux-over', O.arrows);
    }

    if (
      I.validate(
        'select',
        'direction',
        '_list_width',
        '_list_height',
        '_clip_width',
        '_clip_height',
        '_button_positions'
      )
    ) {
      if (this._scroll_animation) {
        this._scroll_animation.stop();
        this._scroll_animation = null;
      }

      const position = this._getButtonScrollPosition();
      const is_vertical = O.direction === 'vertical';
      const from = is_vertical ? this._scroll_top : this._scroll_left;

      if (position !== from) {
        this._scroll_animation = new ScrollAnimation({
          element: this.buttons.element,
          duration: O.scroll,
          from: from,
          to: position,
          easing: easeInOut,
          vertical: is_vertical,
        });
      }
    }

    Container.prototype.redraw.call(this);
  },
  addButton: function (...arg) {
    return this.buttons.addButton(...arg);
  },
  addButtons: function (...arg) {
    return this.buttons.addButtons(...arg);
  },
  removeButton: function (...arg) {
    return this.buttons.removeButton(...arg);
  },
  empty: function (...arg) {
    return this.buttons.empty(...arg);
  },
  destroy: function () {
    Container.prototype.destroy.call(this);

    if (this._scroll_animation) {
      this._scroll_animation.stop();
      this._scroll_animation = null;
    }
  },
});
/**
 * @member {Buttons} Navigation#buttons - The {@link Buttons} of the Navigation.
 */
defineChildWidget(Navigation, 'buttons', {
  create: Buttons,
  show: true,
  inherit_options: true,
  userset_delegate: true,
});

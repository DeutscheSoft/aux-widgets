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
  addClass,
  removeClass,
  toggleClass,
  innerHeight,
  innerWidth,
  outerWidth,
  outerHeight,
} from '../utils/dom.js';
import { observeResize } from '../utils/observe_resize.js';
import { Button } from './button.js';
import { Buttons } from './buttons.js';
import { Container } from './container.js';
import { SymResize } from './widget.js';
import {
  defineMeasure,
  defineRender,
  defineRecalculation,
  childDependency,
} from '../renderer.js';
import { domScheduler } from '../dom_scheduler.js';
import { MASK_RENDER } from '../scheduler/scheduler.js';

/** Buttons strip / arrow widgets changed size — remeasure clip. */
const SymClipSize = Symbol('navigationClipSize');
/** A navigation button changed size — remeasure button positions. */
const SymButtonPositions = Symbol('navigationButtonPositions');

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
    this.paused = true;
    this.scheduled = false;

    this._draw = () => {
      this.scheduled = false;
      if (this.paused) return;
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
        domScheduler.scheduleNext(MASK_RENDER, this._draw);
      }
    };
    this.start();
  }

  stop() {
    this.paused = true;
  }

  pause() {
    this.stop();
  }

  start() {
    if (this.scheduled) return;
    this.paused = false;
    domScheduler.scheduleNext(MASK_RENDER, this._draw);
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
  const O = this.options;
  if (!O.auto_arrows) return;
  const B = this.buttons.getButtons();
  const vert = O.direction === 'vertical';
  const cons = vert
    ? innerHeight(this.buttons.element, undefined, true)
    : innerWidth(this.buttons.element, undefined, true);
  let list;
  if (B.length) {
    const lastb = B[B.length - 1].element;
    if (vert) {
      list = lastb.offsetTop + outerHeight(lastb, true, undefined, true);
    } else {
      list = lastb.offsetLeft + outerWidth(lastb, true, undefined, true);
    }
  } else {
    list = 0;
  }
  this.update('arrows', list > cons);
}

function prevClicked() {
  this.parent.userset('select', Math.max(0, this.parent.get('select') - 1));
}
function prevDblClicked() {
  this.parent.userset('select', 0);
}

function nextClicked() {
  this.parent.userset(
    'select',
    Math.min(
      this.parent.buttons.getButtons().length - 1,
      this.parent.get('select') + 1
    )
  );
}
function nextDblClicked() {
  this.parent.userset('select', this.parent.buttons.getButtons().length - 1);
}

function measureClip() {
  const buttons = this.buttons;

  this.update('_clip_height', innerHeight(buttons.element, undefined, true));
  this.update('_clip_width', innerWidth(buttons.element, undefined, true));
}

function measureButtonPositions() {
  const positions = this.options._button_positions;
  let list_width = 0;
  let list_height = 0;

  positions.forEach((info, button) => {
    const element = button.element;

    info.width = outerWidth(element, false, undefined, true);
    info.height = outerHeight(element, false, undefined, true);
    info.left = element.offsetLeft;
    info.top = element.offsetTop;

    list_width = Math.max(list_width, info.width + info.left);
    list_height = Math.max(list_height, info.height + info.top);
  });

  this.update('_list_width', list_width);
  this.update('_list_height', list_height);
  this.invalidate('_button_positions');
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
 * @property {Boolean} [options.icons=true] - Set icons on previous and next {@link Button}s to standard arrows.
 *   Set to `false` to use custom icons via child widget.
 * @property {Boolean} [options.arrows=false] - Show or hide previous and next {@link Button}s.
 * @property {Boolean} [options.auto_arrows=true] - Set to false to disable
 *   automatic creation of the previous/next buttons.
 * @property {Integer} [options.scroll=500] - Duration of the scrolling animation.
 *
 * @class Navigation
 */
export class Navigation extends Container {
  static get _options() {
    return {
      _clip_width: 'number',
      _clip_height: 'number',
      _list_width: 'number',
      _list_height: 'number',
      _button_positions: 'object',

      direction: 'string',
      icons: 'boolean',
      arrows: 'boolean',
      auto_arrows: 'boolean',
      resized: 'boolean',
      scroll: 'int',
    };
  }

  static get options() {
    return {
      direction: 'horizontal',
      icons: true,
      arrows: false,
      auto_arrows: true,
      resized: false,
      scroll: 500,
    };
  }

  static get static_events() {
    return {
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
      set_arrows: function (arrows) {
        this.set('show_prev', arrows);
        this.set('show_next', arrows);
      },
    };
  }

  static get renderers() {
    return [
      defineRender('direction', function (direction) {
        const { element } = this;
        removeClass(element, 'aux-vertical', 'aux-horizontal');
        addClass(element, 'aux-' + direction);
      }),
      defineRender('arrows', function (arrows) {
        toggleClass(this.element, 'aux-over', arrows);
      }),
      defineRecalculation(
        [childDependency('prev'), 'direction', 'icons'],
        function (prev, direction, icons) {
          if (!prev || !icons) return;
          prev.set('icon', direction === 'vertical' ? 'arrowup' : 'arrowleft');
        }
      ),
      defineRecalculation(
        [childDependency('next'), 'direction', 'icons'],
        function (next, direction, icons) {
          if (!next || !icons) return;
          next.set(
            'icon',
            direction === 'vertical' ? 'arrowdown' : 'arrowright'
          );
        }
      ),
      defineRecalculation(
        [childDependency('prev'), 'select'],
        function (prev, select) {
          if (!prev) return;
          prev.set('disabled', select <= 0);
        }
      ),
      defineRecalculation(
        [childDependency('next'), 'select', childDependency('buttons')],
        function (next, select, buttons) {
          if (!next || !buttons) return;
          next.set('disabled', select === buttons.getButtons().length - 1);
        }
      ),
      defineRender(
        [
          'direction',
          'scroll',
          'select',
          '_clip_width',
          '_clip_height',
          '_list_width',
          '_list_height',
          '_button_positions',
        ],
        function (direction, scroll) {
          if (this._scroll_animation) {
            this._scroll_animation.stop();
            this._scroll_animation = null;
          }

          const position = this._getButtonScrollPosition();
          const is_vertical = direction === 'vertical';
          const from = is_vertical ? this._scroll_top : this._scroll_left;

          if (position !== from) {
            this._scroll_animation = new ScrollAnimation({
              element: this.buttons.element,
              duration: scroll,
              from: from,
              to: position,
              easing: easeInOut,
              vertical: is_vertical,
            });
          }
        }
      ),
      defineMeasure(SymResize, function () {
        autoArrows.call(this);
        this._scroll_top = this.buttons.element.scrollTop;
        this._scroll_left = this.buttons.element.scrollLeft;
      }),
      defineMeasure(SymClipSize, function () {
        measureClip.call(this);
        autoArrows.call(this);
      }),
      defineMeasure(SymButtonPositions, function () {
        measureButtonPositions.call(this);
        autoArrows.call(this);
      }),
    ];
  }

  _getButtonScrollPosition() {
    const {
      select,
      _clip_width,
      _clip_height,
      _list_width,
      _list_height,
      _button_positions,
      direction,
    } = this.options;
    const button_list = this.buttons.getButtons();

    if (select < 0 || select >= button_list.length) return 0;

    const button_position = _button_positions.get(button_list[select]);

    if (!button_position) return 0;

    const is_vertical = direction === 'vertical';
    const clip_size = is_vertical ? _clip_height : _clip_width;
    const list_size = is_vertical ? _list_height : _list_width;
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
  }

  initialize(options) {
    super.initialize(options);
    /**
     * @member {HTMLDivElement} Navigation#element - The main DIV container.
     *   Has class <code>.aux-navigation</code>.
     */

    // these properties contain the scroll position of the buttons child
    // element
    this._scroll_left = 0;
    this._scroll_top = 0;

    this.set('_button_positions', new Map());
  }

  initialized() {
    super.initialized();

    const invalidateButtons = () => this.invalidate(SymButtonPositions);
    const buttonObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(invalidateButtons)
        : null;

    const clipElements = [this.buttons.element];
    if (this.prev) clipElements.push(this.prev.element);
    if (this.next) clipElements.push(this.next.element);

    this.addSubscriptions(
      this.buttons.buttons.forEachAsync((button) => {
        const positions = this.get('_button_positions');
        const info = {
          width: 0,
          height: 0,
          left: 0,
          top: 0,
        };
        positions.set(button, info);
        if (buttonObserver) buttonObserver.observe(button.element);
        invalidateButtons();

        return () => {
          if (buttonObserver) buttonObserver.unobserve(button.element);
          positions.delete(button);
          invalidateButtons();
        };
      }),
      () => {
        if (buttonObserver) buttonObserver.disconnect();
      },
      observeResize(clipElements, () => this.invalidate(SymClipSize)),
      this.buttons.subscribe('scroll', () => {
        this._scroll_top = this.buttons.element.scrollTop;
        this._scroll_left = this.buttons.element.scrollLeft;
      })
    );

    this.set('auto_arrows', this.options.auto_arrows);
    this.set('direction', this.options.direction);
  }

  getResizeTargets() {
    return [this.buttons.element];
  }

  draw(O, element) {
    addClass(element, 'aux-navigation');
    super.draw(O, element);
  }

  addButton(...arg) {
    return this.buttons.addButton(...arg);
  }

  addButtons(...arg) {
    return this.buttons.addButtons(...arg);
  }

  removeButton(...arg) {
    if (this.buttons) return this.buttons.removeButton(...arg);
  }

  empty(...arg) {
    return this.buttons.empty(...arg);
  }

  destroy() {
    super.destroy();

    if (this._scroll_animation) {
      this._scroll_animation.stop();
      this._scroll_animation = null;
    }
  }

  static get child_widgets() {
    return [
      {
        name: 'buttons',
        create: Buttons,
        show: true,
        inherit_options: true,
        userset_delegate: true,
        static_events: {
          set__focus: function (focus) {
            const button = this.buttons.list[focus];
            if (!button) return;
            //button.element.scrollIntoView({behavior: "smooth"});
          },
        },
      },
      {
        name: 'prev',
        create: Button,
        show: true,
        default_options: {
          class: 'aux-previous',
          dblclick: 300,
          tabindex: false,
        },
        static_events: {
          click: prevClicked,
          dblclick: prevDblClicked,
        },
        append: function () {
          this.element.appendChild(this.prev.element);
        },
      },
      {
        name: 'next',
        create: Button,
        show: true,
        default_options: {
          class: 'aux-next',
          dblclick: 300,
          tabindex: false,
        },
        static_events: {
          click: nextClicked,
          dblclick: nextDblClicked,
        },
        append: function () {
          this.element.appendChild(this.next.element);
        },
      },
    ];
  }
}

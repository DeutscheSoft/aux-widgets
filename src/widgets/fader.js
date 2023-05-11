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

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>value</code>.
 *
 * @event Fader#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { SymResize, Widget } from './widget.js';
import { warning } from '../utils/warning.js';
import { setGlobalCursor, unsetGlobalCursor } from '../utils/global_cursor.js';
import { focusMoveDefault, announceFocusMoveKeys } from '../utils/keyboard.js';
import { Scale } from './scale.js';
import { DragValue } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { Value } from './value.js';
import { Label } from './label.js';
import {
  rangedOptionsDefaults,
  rangedOptionsTypes,
  makeRanged,
} from '../utils/make_ranged.js';
import {
  element,
  addClass,
  removeClass,
  supports_transform,
  CSSSpace,
  outerHeight,
  innerHeight,
  outerWidth,
  innerWidth,
  createID,
  applyAttribute,
} from '../utils/dom.js';
import { defineChildWidget } from '../child_widget.js';
import { defineRender, defineMeasure } from '../renderer.js';
import { selectAriaAttribute } from '../utils/select_aria_attribute.js';

function vert(layout) {
  return layout === 'left' || layout === 'right';
}
function getValue(ev) {
  const O = this.options;
  const transformation = O.transformation;
  const is_vertical = vert(O.layout);
  const hsize = this._handle_size / 2;
  const pad = this._padding;

  let real;

  if (is_vertical) {
    real = this.options.basis - (ev.offsetY - hsize) + pad.bottom;
  } else {
    real = ev.offsetX - hsize + pad.left;
  }
  return transformation.pixelToValue(real);
}
function clicked(ev) {
  if (this._handle.contains(ev.target)) return;
  if (this.value && this.value.element.contains(ev.target)) return;
  if (this.label && this.label.element.contains(ev.target)) return;
  if (this.scale && this.scale.element.contains(ev.target)) return;
  this.userset('value', getValue.call(this, ev));
}
function dblClick() {
  this.userset('value', this.options.reset);
  /**
   * Is fired when the handle receives a double click.
   *
   * @event Fader#doubleclick
   *
   * @param {number} value - The value of the {@link Fader}.
   */
  this.emit('doubleclick', this.options.value);
}

/**
 * Fader is a slidable control with a {@link Scale} next to it which
 * can be both dragged and scrolled. Fader implements {@link Ranged}
 * and inherits its options.
 * A {@link Label} and a {@link Value} are available optionally.
 *
 * @class Fader
 *
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.value] - The fader's position. This options is
 *   modified by user interaction.
 * @property {String} [options.layout] - The fader's layout. One out of
 *   `top`, `left`, `right` or `bottom`, defining the fader handles position
 *   in comparison to the scale.
 * @property {Boolean} [options.bind_click=false] - If true, a <code>click</code>
 *   on the fader will move the handle to the pointed position.
 * @property {Boolean} [options.bind_dblclick=true] - If true, a <code>dblclick</code>
 *   on the fader will reset the fader value to <code>options.reset</code>.
 * @property {Number} [options.reset=options.value] - The reset value, which is used by
 *   the <code>dblclick</code> event and the {@link Fader#reset} method.
 * @property {Boolean} [options.show_scale=true] - If true, a {@link Scale} is added to the fader.
 * @property {Boolean} [options.show_value=false] - If true, a {@link Value} widget is added to the fader.
 * @property {String|Boolean} [options.label=false] - Add a label to the fader. Set to `false` to remove the label from the DOM.
 * @property {String|Boolean} {options.cursor=false} - set a cursor from <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">standard cursors</a>
 *   on drag or scroll. Set to `false` to disable.
 */
export class Fader extends Widget {
  static get _options() {
    return Object.assign(
      {},
      Widget.getOptionTypes(),
      rangedOptionsTypes,
      Scale.getOptionTypes(),
      {
        value: 'number',
        division: 'number',
        levels: 'array',
        gap_dots: 'number',
        gap_labels: 'number',
        show_labels: 'boolean',
        labels: 'function',
        layout: 'string',
        direction: 'string',
        reset: 'number',
        bind_click: 'boolean',
        bind_dblclick: 'boolean',
        cursor: 'boolean|string',
      }
    );
  }

  static get options() {
    return Object.assign({}, rangedOptionsDefaults, {
      value: 0,
      division: 1,
      levels: [1, 6, 12, 24],
      gap_dots: 3,
      gap_labels: 40,
      show_labels: true,
      labels: function (val) {
        return val.toFixed(2);
      },
      layout: 'left',
      bind_click: false,
      bind_dblclick: true,
      label: false,
      cursor: false,
      tabindex: 0,
      role: 'slider',
      set_ariavalue: true,
    });
  }

  static get static_events() {
    return {
      set_bind_click: function (value) {
        if (value) this.on('click', clicked);
        else this.off('click', clicked);
      },
      set_bind_dblclick: function (value) {
        if (value) this.on('dblclick', dblClick);
        else this.off('dblclick', dblClick);
      },
      set_layout: function (layout) {
        this.options.direction = vert(layout) ? 'vertical' : 'horizontal';
        this.drag.set('direction', this.options.direction);
        this.scroll.set('direction', this.options.direction);
      },
      set_interacting: function (v) {
        const cursor = this.options.cursor;
        if (!cursor) return;
        if (v) setGlobalCursor(cursor);
        else unsetGlobalCursor(cursor);
      },
      click: function (e) {
        if (this.value && this.value.element.contains(e.target)) return;
        this._handle.focus();
      },
      focus_move: focusMoveDefault(),
    };
  }

  static get renderers() {
    return [
      defineRender('layout', function (layout) {
        const E = this.element;
        removeClass(
          E,
          'aux-vertical',
          'aux-horizontal',
          'aux-left',
          'aux-right',
          'aux-top',
          'aux-bottom'
        );
        addClass(E, vert(layout) ? 'aux-vertical' : 'aux-horizontal');
        addClass(E, 'aux-' + layout);
        this.triggerResize();
      }),
      defineMeasure(SymResize, function () {
        const T = this._track,
          H = this._handle;
        let basis;
        const layout = this.options.layout;

        this._padding = CSSSpace(T, 'padding', 'border');

        if (vert(layout)) {
          this._handle_size = outerHeight(H, true);
          basis = innerHeight(T) - this._handle_size;
        } else {
          this._handle_size = outerWidth(H, true);
          basis = innerWidth(T) - this._handle_size;
        }

        this.set('basis', basis);
      }),
      supports_transform
        ? defineRender(['value', 'transformation', 'snap_module'], function (
            value,
            transformation,
            snap_module
          ) {
            const tmp =
              transformation.valueToPixel(snap_module.snap(value)) + 'px';
            const _handle = this._handle;
            const layout = this.options.layout;

            if (vert(layout)) {
              _handle.style.transform = 'translateY(-' + tmp + ')';
            } else {
              _handle.style.transform = 'translateX(' + tmp + ')';
            }
          })
        : defineRender(['value', 'transformation', 'snap_module'], function (
            value,
            transformation,
            snap_module
          ) {
            const tmp =
              transformation.valueToPixel(snap_module.snap(value)) + 'px';
            const _handle = this._handle;
            const layout = this.options.layout;

            if (vert(layout)) {
              _handle.style.bottom = tmp;
            } else {
              _handle.style.left = tmp;
            }
          }),
      defineRender(['label', 'aria_labelledby'], function (
        label,
        aria_labelledby
      ) {
        if (aria_labelledby !== void 0) return;

        const { _handle } = this;

        const value = label !== false ? this.label.get('id') : null;
        applyAttribute(_handle, 'aria-labelledby', value);
      }),
      defineRender(
        ['label', 'aria_labelledby', 'value.aria_labelledby', 'show_value'],
        function (label, aria_labelledby, value_aria_labelledby, show_value) {
          if (value_aria_labelledby !== void 0) return;

          if (!show_value) return;

          const { _input } = this.value;

          const value = selectAriaAttribute(
            aria_labelledby,
            label !== false ? this.label.get('id') : null
          );

          applyAttribute(_input, 'aria-labelledby', value);
        }
      ),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);

    const O = this.options;

    /**
     * @member {HTMLDivElement} Fader#element - The main DIV container.
     *   Has class <code>.aux-fader</code>.
     */

    /**
     * @member {HTMLDivElement} Fader#_track - The track for the handle. Has class <code>.aux-track</code>.
     */
    this._track = element('div', 'aux-track');

    /**
     * @member {HTMLDivElement} Fader#_handle - The handle of the fader. Has class <code>.aux-handle</code>.
     */
    this._handle = element('div', 'aux-handle');
    this._handle_size = 0;
    this._track.appendChild(this._handle);

    if (O.reset === void 0) O.reset = O.value;

    if (O.direction === void 0)
      O.direction = vert(O.layout) ? 'vertical' : 'horizontal';
    /**
     * @member {DragValue} Fader#drag - Instance of {@link DragValue} used for the handle
     *   interaction.
     */
    this.drag = new DragValue(this, {
      node: this._handle,
      classes: this.element,
      direction: O.direction,
      limit: true,
      focus: this._handle,
    });
    this.drag.on('startdrag', () => this.startInteracting());
    this.drag.on('stopdrag', () => this.stopInteracting());
    /**
     * @member {ScrollValue} Fader#scroll - Instance of {@link ScrollValue} used for the
     *   handle interaction.
     */
    this.scroll = new ScrollValue(this, {
      node: this.element,
      classes: this.element,
      limit: true,
      focus: this._handle,
    });
    this.scroll.on('scrollstarted', () => this.startInteracting());
    this.scroll.on('scrollended', () => this.stopInteracting());

    this.set('bind_click', O.bind_click);
    this.set('bind_dblclick', O.bind_dblclick);
  }

  draw(O, element) {
    addClass(element, 'aux-fader');
    element.appendChild(this._track);
    announceFocusMoveKeys.call(this);

    super.draw(O, element);
  }

  destroy() {
    this._handle.remove();
    this._track.remove();
    this.scroll.destroy();
    this.drag.destroy();
    super.destroy();
  }

  getResizeTargets() {
    return [this.element, this._track, this._handle];
  }

  getFocusTargets() {
    return [this._handle];
  }

  getARIATargets() {
    return [this._handle];
  }

  // GETTER & SETTER
  set(key, value) {
    const O = this.options;
    if (key === 'value') {
      if (value > O.max || value < O.min) warning(this.element);
      value = O.snap_module.snap(Math.max(O.min, Math.min(O.max, value)));
    }
    return super.set(key, value);
  }
}

makeRanged(Fader);

/**
 * @member {Scale} Fader#scale - A {@link Scale} to display a scale next to the fader.
 */
defineChildWidget(Fader, 'scale', {
  create: Scale,
  show: true,
  inherit_options: true,
  blacklist_options: ['set_ariavalue'],
  toggle_class: true,
  static_events: {
    set: function (key, value) {
      /**
       * Is fired when the scale was changed.
       *
       * @event Fader#scalechanged
       *
       * @param {string} key - The key of the option.
       * @param {mixed} value - The value to which it was set.
       */
      if (this.parent) this.parent.emit('scalechanged', key, value);
    },
  },
});
/**
 * @member {Label} Fader#label - A {@link Label} to display a title.
 */
defineChildWidget(Fader, 'label', {
  create: Label,
  show: false,
  toggle_class: true,
  option: 'label',
  map_options: {
    label: 'label',
  },
  static_events: {
    initialized: function () {
      if (!this.get('id')) {
        this.set('id', createID('aux-label-'));
      }
    },
  },
});
/**
 * @member {Value} Fader#value - A {@link Value} to display the current value, offering a way to enter a value via keyboard.
 */
defineChildWidget(Fader, 'value', {
  create: Value,
  show: false,
  userset_delegate: true,
  map_options: {
    value: 'value',
  },
  toggle_class: true,
});

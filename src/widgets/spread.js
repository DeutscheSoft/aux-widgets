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
 * @event Spread#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { Widget, Resize } from './widget.js';
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
} from '../utils/dom.js';
import { defineChildWidget } from '../child_widget.js';
import { defineRecalculation } from '../define_recalculation.js';
import { defineRender, defineMeasure } from '../renderer.js';

function vert(layout) {
  return layout === 'left' || layout === 'right';
}

function dblClick() {
  this.userset('value', this.options.reset);
  /**
   * Is fired when the handle receives a double click.
   *
   * @event Spread#doubleclick
   *
   * @param {number} value - The value of the {@link Spread}.
   */
  this.emit('doubleclick', this.options.value);
}

function focusMove(O) {
  if (O.event.target == this._lower) this._lowercb(O);
  else this._uppercb(O);
  return false;
}

const setHandlePosition = supports_transform
  ? function (handle, layout, position) {
      handle.style.transform =
        (vert(layout) ? 'translateY(-' : 'translateX(') + position + ')';
    }
  : function (handle, layout, position) {
      if (vert(layout)) {
        handle.style.bottom = position;
        handle.style.left = null;
      } else {
        handle.style.bottom = null;
        handle.style.left = position;
      }
    };

/**
 * Spread is a slidable control with a {@link Scale} next to it which
 * can be both dragged and scrolled. Spread implements {@link Ranged}
 * and inherits its options.
 * A {@link Label} and a {@link Value} are available optionally.
 *
 * @class Spread
 *
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.lower] - The spreads's lower position. This options is
 *   modified by user interaction.
 * @property {Number} [options.lower] - The spreads's upper position. This options is
 *   modified by user interaction.
 * @property {String} [options.layout] - The spreads's layout. One out of
 *   `top`, `left`, `right` or `bottom`, defining the spreads handles position
 *   in comparison to the scale.
 * @property {Boolean} [options.bind_dblclick=true] - If true, a <code>dblclick</code>
 *   on the Spread will reset lower and upper to <code>options.reset_lower</code>
 *   and <code>options.reset_lower</code>.
 * @property {Number} [options.reset_lower=options.lower] - The reset value, which is used by
 *   the <code>dblclick</code> event and the {@link Spread#reset} method for the lower handle.
 * @property {Number} [options.reset_upper=options.upper] - The reset value, which is used by
 *   the <code>dblclick</code> event and the {@link Spread#reset} method for the upper handle.
 * @property {Boolean} [options.show_scale=true] - If true, a {@link Scale} is added to the spreads.
 * @property {Boolean} [options.show_values=false] - If true, two {@link Value} widget are added to the spreads.
 * @property {String|Boolean} [options.label=false] - Add a label to the spreads. Set to `false` to remove the label from the DOM.
 * @property {String|Boolean} {options.cursor=false} - set a cursor from <a href="https://developer.mozilla.org/de/docs/Web/CSS/cursor">standard cursors</a>
 *   on drag or scroll. Set to `false` to disable.
 */
export class Spread extends Widget {
  static get _options() {
    return Object.assign(
      {},
      Widget.getOptionTypes(),
      rangedOptionsTypes,
      Scale.getOptionTypes(),
      {
        lower: 'number',
        upper: 'number',
        division: 'number',
        levels: 'array',
        gap_dots: 'number',
        gap_labels: 'number',
        show_labels: 'boolean',
        labels: 'function',
        layout: 'string',
        direction: 'int',
        reset: 'number',
        bind_click: 'boolean',
        bind_dblclick: 'boolean',
        cursor: 'boolean|string',
      }
    );
  }

  static get options() {
    return Object.assign({}, rangedOptionsDefaults, {
      lower: 0,
      upper: 0,
      division: 1,
      levels: [1, 6, 12, 24],
      gap_dots: 3,
      gap_labels: 40,
      show_labels: true,
      labels: function (val) {
        return val.toFixed(2);
      },
      layout: 'top',
      bind_dblclick: true,
      label: false,
      cursor: false,
      tabindex: 0,
      role: 'slider',
    });
  }

  static get static_events() {
    return {
      set_bind_dblclick: function (value) {
        if (value) this.on('dblclick', dblClick);
        else this.off('dblclick', dblClick);
      },
      set_layout: function () {
        this.options.direction = vert(this.options.layout)
          ? 'vertical'
          : 'horizontal';
        this.drag.set('direction', this.options.direction);
        this.scroll.set('direction', this.options.direction);
      },
      set_interacting: function (v) {
        const cursor = this.options.cursor;
        if (!cursor) return;
        if (v) setGlobalCursor(cursor);
        else unsetGlobalCursor(cursor);
      },
      focus_move: focusMove,
    };
  }

  static get renderers() {
    return [
      defineMeasure(['layout', Resize], function (layout) {
        const { _track, _lower } = this;

        let basis;

        if (vert(layout)) {
          basis = innerHeight(_track) - outerHeight(_lower, true) * 2;
        } else {
          basis = innerWidth(_track) - outerWidth(_lower, true) * 2;
        }

        this.set('basis', basis);
      }),
      defineRender('layout', function (layout) {
        const element = this.element;
        removeClass(
          element,
          'aux-vertical',
          'aux-horizontal',
          'aux-left',
          'aux-right',
          'aux-top',
          'aux-bottom'
        );
        addClass(element, vert(layout) ? 'aux-vertical' : 'aux-horizontal');
        addClass(element, 'aux-' + layout);
      }),
      defineRender(
        ['transformation', 'layout', 'lower', 'snap_module'],
        function (transformation, layout, lower, snap_module) {
          const position =
            transformation.valueToPixel(snap_module.snap(lower)) + 'px';
          setHandlePosition(this._lower, layout, position);
        }
      ),
      defineRender(
        ['transformation', 'layout', 'upper', 'snap_module'],
        function (transformation, layout, upper, snap_module) {
          const position =
            transformation.valueToPixel(snap_module.snap(upper)) + 'px';
          setHandlePosition(this._upper, layout, position);
        }
      ),
    ];
  }

  initialize(options) {
    this.__tt = false;
    if (!options.element) options.element = element('div');
    super.initialize(options);

    const O = this.options;

    this._lowercb = focusMoveDefault('lower');
    this._uppercb = focusMoveDefault('upper');

    /**
     * @member {HTMLDivElement} Spread#element - The main DIV container.
     *   Has class <code>.aux-spread</code>.
     */

    /**
     * @member {HTMLDivElement} Spread#_track - The track for the handles. Has class <code>.aux-track</code>.
     */
    this._track = element('div', 'aux-track');

    /**
     * @member {HTMLDivElement} Spread#_lower - The lower handle of the spread. Has class <code>.aux-lower</code>.
     */
    this._lower = element('div', 'aux-lower', 'aux-handle');
    this._track.appendChild(this._lower);

    /**
     * @member {HTMLDivElement} Spread#_lower - The lower handle of the spread. Has class <code>.aux-lower</code>.
     */
    this._upper = element('div', 'aux-upper', 'aux-handle');
    this._track.appendChild(this._upper);

    if (O.reset_lower === void 0) O.reset_lower = O.lower;
    if (O.reset_upper === void 0) O.reset_upper = O.upper;

    if (O.direction === void 0)
      O.direction = vert(O.layout) ? 'vertical' : 'horizontal';
    /**
     * @member {DragValue} Spread#draglower - Instance of {@link DragValue} used for the lower handle
     *   interaction.
     */
    this.draglower = new DragValue(this, {
      node: this._lower,
      classes: this.element,
      direction: O.direction,
      limit: true,
      focus: this._lower,
      set: (v) => this.userset('lower', v),
      get: () => this.options.lower,
    });
    this.draglower.on('startdrag', () => this.startInteracting());
    this.draglower.on('stopdrag', () => this.stopInteracting());
    /**
     * @member {DragValue} Spread#dragupper - Instance of {@link DragValue} used for the upper handle
     *   interaction.
     */
    this.dragupper = new DragValue(this, {
      node: this._upper,
      classes: this.element,
      direction: O.direction,
      limit: true,
      focus: this._upper,
      set: (v) => this.userset('upper', v),
      get: () => this.options.upper,
    });
    this.dragupper.on('startdrag', () => this.startInteracting());
    this.dragupper.on('stopdrag', () => this.stopInteracting());

    announceFocusMoveKeys.call(this);

    this.set('bind_dblclick', O.bind_dblclick);
  }

  draw(O, element) {
    addClass(element, 'aux-spread');
    element.appendChild(this._track);

    super.draw(O, element);
  }

  destroy() {
    this._lower.remove();
    this._upper.remove();
    super.destroy();
  }

  /**
   * Resets the lower and upper value to <code>options.reset_lower</code>
   *   and <code>options.reset_upper</code>.
   *
   * @method Spread#reset
   */
  reset() {
    this.set('lower', this.options.reset_lower);
    this.set('upper', this.options.reset_upper);
  }

  getFocusTargets() {
    return [this._lower, this._upper];
  }

  // GETTER & SETTER
  set(key, value) {
    const O = this.options;
    if (key === 'lower' || key === 'upper') {
      if (value > O.max || value < O.min) warning(this.element);
      if (key === 'lower') {
        value = O.snap_module.snap(Math.max(O.min, Math.min(O.upper, value)));
      } else {
        value = O.snap_module.snap(Math.max(O.lower, Math.min(O.max, value)));
      }
    }
    return super.set(key, value);
  }
}

makeRanged(Spread);

/**
 * @member {Scale} Spread#scale - A {@link Scale} to display a scale next to the fader.
 */
defineChildWidget(Spread, 'scale', {
  create: Scale,
  show: true,
  inherit_options: true,
  toggle_class: true,
  static_events: {
    set: function (key, value) {
      /**
       * Is fired when the scale was changed.
       *
       * @event Spread#scalechanged
       *
       * @param {string} key - The key of the option.
       * @param {mixed} value - The value to which it was set.
       */
      if (this.parent) this.parent.emit('scalechanged', key, value);
    },
  },
});
/**
 * @member {Label} Spread#label - A {@link Label} to display a title.
 */
defineChildWidget(Spread, 'label', {
  create: Label,
  show: false,
  toggle_class: true,
  option: 'label',
  map_options: {
    label: 'label',
  },
});
/**
 * @member {Value} Spread#valuelower - A {@link Value} to display the current lower value, offering a way to enter a value via keyboard.
 */
defineChildWidget(Spread, 'valuelower', {
  create: Value,
  show: false,
  userset_delegate: true,
  map_options: {
    lower: 'value',
  },
  toggle_class: true,
  default_options: {
    class: 'aux-valuelower aux-value',
  },
});
/**
 * @member {Value} Spread#valueupper - A {@link Value} to display the current upper value, offering a way to enter a value via keyboard.
 */
defineChildWidget(Spread, 'valueupper', {
  create: Value,
  show: false,
  userset_delegate: true,
  map_options: {
    upper: 'value',
  },
  toggle_class: true,
  default_options: {
    class: 'aux-valueupper aux-value',
  },
});

defineRecalculation(Spread, ['upper'], function (O) {
  this.update('upper', Math.max(O.lower, O.upper));
});
defineRecalculation(Spread, ['lower'], function (O) {
  this.update('lower', Math.min(O.lower, O.upper));
});

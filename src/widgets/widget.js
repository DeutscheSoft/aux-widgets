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
  toggleClass,
  setStyles,
  addClass,
  removeClass,
  hasClass,
  setStyle,
  getStyle,
} from './../utils/dom.js';
import { observeResize } from '../utils/observe_resize.js';
import { log, warn, error } from './../utils/log.js';
import { Base } from './../implements/base.js';
import {
  initSubscriptions,
  addSubscription,
  unsubscribeSubscriptions,
} from '../utils/subscriptions.js';
import { typecheckFunction } from '../utils/typecheck.js';
import { GlobalResize } from '../utils/global_resize.js';
import { GlobalVisibilityChange } from '../utils/global_visibility_change.js';
import { ProximityTimers } from '../utils/timers.js';
import { ariaAttributes } from '../aria_attributes.js';

import {
  Scheduler,
  MASK_RENDER,
  MASK_CALCULATE,
} from '../scheduler/scheduler.js';
import {
  Renderer,
  RenderState,
  getRenderers,
  defineRender,
  defineMeasure,
  deferMeasure,
} from '../renderer.js';
import { domScheduler } from '../dom_scheduler.js';

const enableTimers = new ProximityTimers();

export const SymResize = Symbol('resize');
export const SymResized = Symbol('resized');

const rootWidgets = new Map();

const ariaOptions = ariaAttributes.map((a) => a.replace('-', '_'));

function onVisibilityChange() {
  if (document.hidden) {
    this.disableDraw();
  } else {
    this.enableDraw();
  }
}

function onResize() {
  this.triggerResize();
}

function addRootWidget(widget) {
  if (rootWidgets.has(widget)) throw new Error('Already registered.');

  const resized = onResize.bind(widget);
  const visibilityChanged = onVisibilityChange.bind(widget);

  rootWidgets.set(widget, [resized, visibilityChanged]);
  GlobalResize.add(resized);
  GlobalVisibilityChange.add(visibilityChanged);
}

function removeRootWidget(widget) {
  const [resized, visibilityChanged] = rootWidgets.get(widget);

  GlobalResize.delete(resized);
  GlobalVisibilityChange.delete(visibilityChanged);
}

const SymDrawOnce = Symbol('drawOnce');

const KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
];

function getOwnProperty(o, name) {
  if (Object.prototype.hasOwnProperty.call(o, name)) return o[name];
}

// doubleclick detection handling

let lastClickTarget = null;
let lastClickTime = 0;

function dblClick(e) {
  /**
   * Is fired after a double click appeared. Set `dblclick` to 0 to
   * disable click event handling.
   *
   * @event Widget#doubleclick
   *
   * @param {string} event - The browsers `MouseEvent`.
   *
   */
  const { dblclick } = this.options;
  const now = performance.now();

  if (lastClickTarget === this && lastClickTime + dblclick > now) {
    // FIXME: setting properties on events is not quite ok
    e.lastclick = lastClickTime;
    this.emit('doubleclick', e);
  }

  lastClickTarget = this;
  lastClickTime = now;
}

// interaction tracking. We store one count per widget.

const interactionCounts = new Map();

function getInteractionCount(widget) {
  return interactionCounts.get(widget) || 0;
}

function setInteractionCount(widget, value) {
  if (value === 0) {
    interactionCounts.delete(widget);
  } else {
    interactionCounts.set(widget, value);
  }
}

function setPreset(preset) {
  const O = this.options;
  let key, val;
  if (this._last_preset) {
    this.removeClass('aux-preset-' + this._last_preset);
  }
  this.addClass('aux-preset-' + preset);
  this._last_preset = preset;

  const preset_options = O.presets[preset] || {};
  this._presetting = true;
  for (key in preset_options) {
    if (!Object.prototype.hasOwnProperty.call(this._preset_origins, key))
      this._preset_origins[key] = O[key];
    if (Object.prototype.hasOwnProperty.call(preset_options, key))
      val = preset_options[key];
    else val = this._preset_origins[key];
    this.set(key, val);
  }
  this._presetting = false;
}

function onFocusKeyDown(e) {
  if (KEYS.indexOf(e.code) < 0) return;
  if (e.preventDefault) e.preventDefault();
  const o = { speed: 'normal', event: e };
  if (e.code.startsWith('Arrow')) {
    if (e.ctrlKey) o.speed = 'slow';
    else if (e.shiftKey) o.speed = 'fast';
    o.direction = e.code.substr(5).toLowerCase();
  }
  if (e.code.startsWith('Page')) {
    o.direction = e.code.substr(4).toLowerCase();
    o.speed = 'full';
  }
  if (e.code == 'Home') {
    o.direction = 'left';
    o.speed = 'full';
  }
  if (e.code == 'End') {
    o.direction = 'right';
    o.speed = 'full';
  }
  this.emit('focus_move', o);
  return false;
}

/**
 * Widget is the base class for all widgets drawing DOM elements. It
 * provides basic functionality like delegating events, setting options and
 * firing some events.
 *
 * @class Widget
 *
 * @extends Base
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * @param {String} [options.class=""] - A class to add to the class attribute of the main element.
 * @param {String} [options.id=""] - A string to be set as id attribute on the main element.
 * @param {HTMLElement} [options.container] - A container the main element shall be added to.
 * @param {Object} [options.styles=""] - An object containing CSS declarations to be added directly to the main element.
 * @param {HTMLElement} [options.element] - An element to be used as the main element.
 *
 * @property {HTMLElement} element - The main element.
 *
 * @property {String} [options.title=""] - A string to be set as title attribute on the main element to be displayed as tooltip.
 * @property {Boolean} [options.disabled=false] - Toggles the class <code>.aux-disabled</code>. By default it disables all pointer events on the widget via CSS to make it unusable to the user.
 * @property {Boolean} [options.active] - Toggles the class <code>.aux-inactive</code>.
 * @property {Boolean} [options.visible] - Toggles the class <code>.aux-hide</code> and <code>.aux-show</code>. This option also enables and disabled rendering by
 *  calling Widget#hide and Widget#show.
 * @property {Boolean} [options.dblclick=400] - Set a time in milliseconds for triggering double click event. If 0, no double click events are fired.
 * @property {String} [options.preset] - Set a preset. This string
 *   gets set as class attribute `aux-preset-[preset]`. If `options.presets` has a member
 *   of this name, all options of its option object are set on the Widget. Non-existent
 *   options are reset to the default. Defaults are updated on initialization and runtime.
 * @property {Object} [options.presets={}] - An object with available preset
 *   specific options. Refer to `options.preset` for more information.
 * @property {number} [options.notransitions_duration=500] - A time in
 *    milliseconds until transitions are activated.
 * @property {number|boolean} [options.tabindex=false] - Set tabindex to activate focus on widgets. Tabindex
 *   is set on the element returned by `getFocusElement`. Try to only use `false` or `0`, avoiding positive integers.
 *   To set a hierarchy for the tabindex, better create an appropriate DOM structure.
 * @property {array|boolean} [options.aria_targets=false] - Set an array of targets for ARIA values.
 * @property {Boolean} [options.focus=false] - Toggles the class <code>.aux-focus</code>.
 */
/**
 * The <code>set</code> event is emitted when an option was set using the {@link Widget#set}
 * method. The arguments are the option name and its new value.
 *
 * Note that this happens both for user interaction and programmatical option changes.
 *
 * @event Widget#set
 */
/**
 * The <code>resize</code> event is emitted whenever a widget is being resized. This event can
 * be used to e.g. measure its new size. Note that some widgets do internal adjustments after
 * the <code>resize</code> event. If that is relevant, the {@link Widget#resized} event can
 * be used instead.
 *
 * @event Widget#resize
 */
/**
 * The <code>resized</code> event is emitted after each rendering frame, which was triggered by
 * a resize event.
 *
 * @event Widget#resized
 */
/**
 * The <code>hide</code> event is emitted when a widget is hidden and is not rendered anymore.
 * This happens both with browser visibility changes and also internally when using layout widgets
 * such as {@link Pager}.
 *
 * @event Widget#hide
 */
/**
 * The <code>show</code> event is emitted when a widget is shown and is being rendered. This is the
 * counterpart to {@link Widget#hide}.
 *
 * @event Widget#show
 */
export class Widget extends Base {
  static get _options() {
    return {
      // A CSS class to add to the main element
      class: 'string',
      // A DOM element as container to inject the element
      // into
      container: 'object',
      // a id to set on the element. If omitted a random
      // string is generated.
      debug: 'boolean',
      id: 'string',
      styles: 'object',
      disabled: 'boolean',
      element: 'object',
      active: 'boolean',
      visible: 'boolean',
      dblclick: 'number',
      interacting: 'boolean',
      notransitions: 'boolean',
      notransitions_duration: 'number',
      presets: 'object',
      preset: 'string',
      title: 'string',
      tabindex: 'number|boolean',
      role: 'string',
      aria_targets: 'boolean|array',
      focus: 'boolean',
    };
  }

  static get options() {
    return {
      // these options are of less use and only here to show what we need
      debug: false,
      notransitions: void 0,
      disabled: false, // Widgets can be disabled by setting this to true
      visible: true,
      active: true,
      dblclick: 0,
      interacting: false,
      notransitions_duration: 500,
      presets: {},
      tabindex: false,
      role: 'none',
      aria_targets: false,
      focus: false,
    };
  }

  static get static_events() {
    return {
      set_container: function () {
        throw new Error('container is not a dynamic option.');
      },
      set_styles: function () {
        throw new Error('styles is not a dynamic option.');
      },
      set_class: function () {
        throw new Error('class is not a dynamic option.');
      },
      set_dblclick: function (val, _, prevValue) {
        const event_target = this.getEventTarget();
        if (!event_target) return;
        if (val > 0 === prevValue > 0) return;
        if (val > 0) this.on('click', dblClick);
      },
      initialized: function () {
        const v = this.options.dblclick;
        if (v > 0) this.set('dblclick', v);
      },
      set_preset: function (v) {
        setPreset.call(this, v);
      },
      set_presets: function (v) {
        setPreset.call(this, this.options.preset);
      },
      set: function (key, val) {
        if (
          !this._presetting &&
          Object.prototype.hasOwnProperty.call(this._preset_origins, key)
        ) {
          this._preset_origins[key] = val;
        }
      },
      set_visible: function (val) {
        if (val === true) {
          // If we are currently drawn, it is still possible that
          // we disabled rendering for our children already.
          if (this.isDrawn()) {
            this.enableDrawChildren();
          } else {
            this.enableDraw();
          }
        }
        if (val === false) this.disableDrawChildren();
      },
    };
  }

  static getRenderers() {
    let _renderers = getOwnProperty(this, '_renderers');

    if (!_renderers) {
      const parent = Object.getPrototypeOf(this);

      let parentRenderers = parent.getRenderers ? parent.getRenderers() : [];

      this._renderers = _renderers = parentRenderers.concat(
        getOwnProperty(this, 'renderers') || []
      );
    }

    return _renderers;
  }

  static getRenderer() {
    let renderer = this._renderer;

    if (this.hasOwnProperty('_renderer')) return renderer;

    this._renderer = renderer = new Renderer();

    this.getRenderers().forEach((task) => renderer.addTask(task));

    return renderer;
  }

  static addTask(task) {
    this.getRenderers().push(task);
  }

  static get renderers() {
    const renders = [
      defineMeasure(SymResize, function () {
        this.resize();
      }),
      defineMeasure(SymResized, function () {
        this.emit('resized');
        this.resize();
      }),
      defineRender('notransitions', function (notransitions) {
        toggleClass(this.element, 'aux-notransitions', notransitions);
      }),
      defineRender('visible', function (visible) {
        this.getFocusTargets().forEach((v) =>
          v.setAttribute('aria-hidden', !visible)
        );

        const E = this.element;

        toggleClass(E, 'aux-hide', visible === false);
        toggleClass(E, 'aux-show', visible === true);
      }),
      defineRender('active', function (active) {
        const E = this.getStyleTarget();
        if (!E) return;
        toggleClass(E, 'aux-inactive', !active);
      }),
      defineRender('disabled', function (disabled) {
        const E = this.getStyleTarget();
        if (E) toggleClass(E, 'aux-disabled', disabled);
        this.getFocusTargets().forEach((v) =>
          v.setAttribute('aria-disabled', disabled)
        );
      }),
      defineRender('title', function (title) {
        const E = this.getStyleTarget();
        if (!E) return;
        if (typeof title === 'string') {
          E.setAttribute('title', title);
        } else {
          E.removeAttribute('title', title);
        }
      }),
      defineRender('tabindex', function (tabindex) {
        const F = this.getFocusTargets();

        if (tabindex !== false) {
          F.forEach((v) => v.setAttribute('tabindex', tabindex));
        } else {
          F.forEach((v) => v.removeAttribute('tabindex'));
        }
      }),
      defineRender('tabindex', function (tabindex) {
        const isInstalled = this._onfocuskeydown !== null;

        if ((tabindex !== false) === isInstalled) return;

        const focusTargets = this.getFocusTargets();

        if (isInstalled) {
          focusTargets.forEach((v) =>
            v.removeEventListener('keydown', this._onfocuskeydown)
          );
          this._onfocuskeydown = null;
        } else {
          this._onfocuskeydown = onFocusKeyDown.bind(this);
          focusTargets.forEach((v) =>
            v.addEventListener('keydown', this._onfocuskeydown)
          );
        }
      }),
      defineRender('role', function (role) {
        this.getRoleTarget().setAttribute('role', role);
      }),
      defineRender('id', function (id) {
        const E = this.element;

        if (typeof id === 'string') {
          E.setAttribute('id', id);
        } else if (id !== void 0) {
          E.removeAttribute('id');
        }
      }),
      defineRender('visible', function (visible) {
        if (visible) return;

        return deferMeasure(() => {
          this.disableDraw();
        });
      }),
      defineRender(SymDrawOnce, function () {
        const q = this.draw_queue;

        this.draw_queue = null;

        if (q)
          for (let i = 0; i < q.length; i++) {
            q[i].call(this, this.options);
          }
      }),
      defineRender('focus', function (focus) {
        const E = this.getStyleTarget();
        if (!E) return;
        toggleClass(E, 'aux-focus', !!focus);
      }),
    ];
    ariaOptions.forEach((o) => {
      renders.push(
        defineRender(o, function (v) {
          if (typeof v === 'undefined' || v === null) {
            this.getARIATargets().map((t) =>
              t.removeAttribute(o.replace('_', '-'))
            );
          } else {
            this.getARIATargets().map((t) =>
              t.setAttribute(o.replace('_', '-'), v)
            );
          }
        })
      );
    });
    return renders;
  }

  constructor(options) {
    super(options || {});
  }

  initialize(options) {
    this._renderState = new RenderState(
      domScheduler,
      this.constructor.getRenderer(),
      this
    );
    super.initialize(options);
    // Main actions every widget needs to take
    const E = options.element || null;
    if (E !== null && !E.isAuxWidget) {
      E.auxWidget = this;
      E.isAuxWidget = true;
    }
    this.element = E;
    this.parent = void 0;
    this.children = null;
    this.draw_queue = null;
    this._creation_time = domScheduler.now();
    this._preset_origins = {};
    this._last_preset = null;
    this._presetting = false;
    this._subscriptions = initSubscriptions();
    this._onfocuskeydown = null;
    this._drawn = false;
    this._initialDraw = () => {
      if (!this._drawn) return;
      if (!this._initialDraw) return;
      this._initialDraw = null;
      this.draw(this.options, this.element);
      this._renderState.unpause();
    };
  }

  getStyleTarget() {
    return this.element;
  }

  getClassTarget() {
    return this.element;
  }

  getEventTarget() {
    return this.element;
  }

  getFocusTargets() {
    return [this.element];
  }

  getRoleTarget() {
    return this.element;
  }

  getARIATargets() {
    return this.options.aria_targets || [this.element];
  }

  getResizeTargets() {
    return null;
  }

  startInteracting() {
    const count = getInteractionCount(this);
    if (!count) {
      this.set('interacting', true);
    }
    setInteractionCount(this, count + 1);
  }

  stopInteracting() {
    const count = getInteractionCount(this);
    if (count === 1) {
      this.set('interacting', false);
    }
    setInteractionCount(this, count - 1);
  }

  /**
   * Invalidates all dependencies which will trigger all renderers to rerun.
   */
  invalidateAll() {
    this._renderState.invalidateAll();
  }

  triggerResize() {
    this.invalidate(SymResize);

    const C = this.children;

    if (!C) return;

    for (let i = 0; i < C.length; i++) {
      C[i].triggerResize();
    }
  }

  triggerResizeChildren() {
    const C = this.children;

    if (!C) return;

    for (let i = 0; i < C.length; i++) {
      C[i].triggerResize();
    }
  }

  resize() {
    this.emit('resize');

    if (this.constructor.hasOption('resized')) this.set('resized', true);

    if (this.hasEventListeners('resized')) this.invalidate(SymResized);
  }

  initialized() {
    // Main actions every widget needs to take
    /**
     * Is fired when a widget is initialized.
     *
     * @event Widget#initialized
     */
    super.initialized();
  }

  drawOnce(fun) {
    const q = this.draw_queue;

    if (q === null) {
      this.draw_queue = [fun];
      this.invalidate(SymDrawOnce);
    } else {
      if (q.includes(fun)) return;
      q.push(fun);
    }
  }

  draw(O, element) {
    if (O.preset) {
      this.set('preset', O.preset);
    }

    let E;

    const notransitions = O.notransitions;

    if (notransitions === void 0) {
      O.notransitions = true;

      const targetTime = this._creation_time + O.notransitions_duration;
      const time = targetTime - domScheduler.now();

      const do_enable = () => {
        if (this.isDestructed()) return;
        this.enableTransitions();
      };

      if (time > 20) {
        enableTimers.scheduleAt(do_enable, targetTime);
      } else {
        domScheduler.scheduleNext(MASK_CALCULATE, do_enable);
      }
    }

    toggleClass(element, 'aux-notransitions', O.notransitions);
    addClass(element, 'aux-widget');

    if (O.class && (E = this.getClassTarget())) {
      const tmp = O.class.split(' ');
      for (let i = 0; i < tmp.length; i++) addClass(E, tmp[i]);
    }

    if (O.styles && (E = this.getStyleTarget())) {
      setStyles(E, O.styles);
    }

    if (O.container) O.container.appendChild(element);
    this.triggerResize();

    const resizeTargets = this.getResizeTargets();

    if (resizeTargets && resizeTargets.length) {
      this.addSubscriptions(
        observeResize(resizeTargets, () => this.triggerResize())
      );
    }
  }

  addSubscriptions(...subs) {
    subs.forEach((sub) => {
      this._subscriptions = addSubscription(this._subscriptions, sub);
    });
  }

  /**
   * Dispose of this Widget.
   */
  destroy() {
    /**
     * Is fired when a widget is destroyed.
     *
     * @event Widget#destroy
     */
    if (this.isDestructed()) {
      warn('destroy called twice on ', this);
      return;
    }

    const _onfocuskeydown = this._onfocuskeydown;

    if (_onfocuskeydown !== null) {
      this._onfocuskeydown = null;
      this.getFocusTargets().forEach((v) =>
        v.removeEventListener('keydown', _onfocuskeydown)
      );
    }

    this._subscriptions = unsubscribeSubscriptions(this._subscriptions);

    this.emit('destroy');

    this.disableDraw();
    this.setParent(void 0);

    if (this.children) {
      this.removeChildren(this.children);
      this.children = null;
    }

    super.destroy();

    const element = this.element;

    if (element) {
      delete element.isAuxWidget;
      delete element.auxWidget;
    }

    this.options = null;
    this.element = null;

    setInteractionCount(this, 0);
  }

  /**
   * Dispose of this Widget and remove it from the DOM.
   */
  destroyAndRemove() {
    const element = this.element;
    this.destroy();
    if (element) element.remove();
  }

  addClass(cls) {
    addClass(this.getClassTarget(), cls);
  }

  removeClass(cls) {
    removeClass(this.getClassTarget(), cls);
  }

  hasClass(cls) {
    return hasClass(this.getClassTarget(), cls);
  }

  setStyle(name, value) {
    setStyle(this.getStyleTarget(), name, value);
  }

  /**
   * Sets a CSS style property in this widget's DOM element.
   *
   * @method Widget#setStyle
   */
  setStyles(styles) {
    setStyles(this.getStyleTarget(), styles);
  }

  /**
   * Returns the computed style of this widget's DOM element.
   *
   * @method Widget#getStyle
   */
  getStyle(name) {
    return getStyle(this.getStyleTarget(), name);
  }

  /**
   * Returns true if transitions are currently disabled on this widget.
   */
  transitionsDisabled() {
    const O = this.options;
    const notransitions = O.notransitions;

    if (notransitions === void 0) {
      return performance.now() - this._creation_time < O.notransitions_duration;
    } else {
      return notransitions;
    }
  }

  /**
   * Disable CSS transitions.
   *
   * @method Widget#disableTansitions
   */
  disableTransitions() {
    this.update('notransitions', true);
  }

  /**
   * Enable CSS transitions.
   *
   * @method Widget#enableTransitions
   */
  enableTransitions() {
    this.update('notransitions', false);
  }

  // GETTER & SETTER
  /**
   * Invalidates an option and triggers a redraw() call.
   *
   * @param {string} key
   */
  invalidate(key) {
    this._renderState.invalidate(key);
  }

  /**
   * Sets an option.
   *
   * @method Widget#set
   *
   * @param {string} key - The option name.
   * @param value - The option value.
   */
  set(key, value) {
    if (
      key.charCodeAt(0) !== 95 &&
      !this.constructor.hasOption(key) &&
      !key.startsWith('aria_')
    ) {
      warn(
        '%O: %s.set(%s, %O): unknown option.',
        this,
        this._class,
        key,
        value
      );
    }
    const currentValue = this.options[key];

    if (
      currentValue !== value &&
      (value === value || currentValue === currentValue)
    )
      this._renderState.invalidate(key);

    super.set(key, value);
    return value;
  }

  /**
   * Enables rendering for all children of this widget.
   *
   * @method Widget#enableDrawChildren
   */
  enableDrawChildren() {
    const C = this.children;
    if (C) for (let i = 0; i < C.length; i++) C[i].enableDraw();
  }

  /**
   * Schedules this widget for drawing.
   *
   * @method Widget#enableDraw
   *
   * @emits Widget#show
   */
  enableDraw() {
    if (this._drawn) return;
    this._drawn = true;
    if (this._initialDraw) {
      domScheduler.schedule(MASK_RENDER, this._initialDraw);
    } else {
      const renderState = this._renderState;

      renderState.unpause();
    }

    this.emit('show');
    this.enableDrawChildren();
  }

  disableDrawChildren() {
    const C = this.children;
    if (C) for (let i = 0; i < C.length; i++) C[i].disableDraw();
  }

  /**
   * Stop drawing this widget.
   *
   * @method Widget#enableDraw
   *
   * @emits Widget#hide
   */
  disableDraw() {
    if (!this._drawn) return;
    this._drawn = false;

    if (!this._initialDraw) {
      const renderState = this._renderState;
      renderState.pause();
    }
    /**
     * Is fired when the visibility state changes. The first argument
     * is the visibility state, which is either <code>true</code>
     * or <code>false</code>.
     *
     * @event Widget#visibility
     */
    this.emit('hide');
    this.disableDrawChildren();
  }

  /**
   * Make the widget visible. This will apply the class <code>aux-show</code>
   * during the next rendering step.
   *
   * @method Widget#show
   */
  show() {
    if (this.hidden()) this.set('visible', true);
    if (!this.isDrawn()) this.enableDraw();
  }

  /**
   * Show the widget immediately by applying the class <code>aux-show</code>.
   * Does not call enableDraw().
   *
   * @method Widget#forceShow
   */
  forceShow() {
    const E = this.element;
    this.set('visible', true);
    addClass(E, 'aux-show');
    removeClass(E, 'aux-hide');
  }

  /**
   * Hide the widget. This will result in the class <code>aux-hide</code>
   * being applied to this widget in the next rendering step.
   *
   * @method Widget#hide
   */
  hide() {
    if (this.hidden()) return;
    this.set('visible', false);
  }

  /**
   * Hide the widget immediately by applying the class <code>aux-hide</code>.
   * Does not call disableDraw().
   *
   * @method Widget#forceHide
   */
  forceHide() {
    this.set('visible', false);
    const E = this.element;
    removeClass(E, 'aux-show');
    addClass(E, 'aux-hide');
    this.disableDraw();
  }

  log(fmt, ...args) {
    const O = this.options;
    if (!O.debug) return;

    log(fmt, ...args);
  }

  showNoDraw() {
    if (this.options.visible === true) return;
    this.options.visible = true;
    this.invalidate('visible');
  }

  hideNoDraw() {
    if (this.options.visible === false) return;
    this.update('visible', false);
  }

  /**
   * Returns the current hidden status.
   *
   * @method Widget#hidden
   */
  hidden() {
    return this.options.visible === false;
  }

  isDrawn() {
    return this._drawn;
  }

  /**
   * Toggle the hidden status. This is equivalent to calling hide() or show(), depending on
   * the current hidden status of this widget.
   *
   * @method Widget#toggleHidden
   */
  toggleHidden() {
    if (this.hidden()) this.show();
    else this.hide();
  }

  setParent(parent, no_remove_child) {
    const old_parent = this.parent;

    if (old_parent === parent) return;

    this.parent = parent;

    if (parent === null) {
      if (old_parent !== parent) {
        addRootWidget(this);
        onVisibilityChange.call(this);
      }
    } else if (parent !== null && old_parent === null) {
      removeRootWidget(this);
    }

    if (old_parent && !no_remove_child) {
      old_parent.removeChild(this);
    }
  }

  hasChild(child) {
    const C = this.children;

    return C !== null && C.indexOf(child) !== -1;
  }

  /**
   * Registers a widget as a child widget. This method is used to build up the widget tree. It does not modify the DOM tree.
   *
   * @method Widget#addChild
   *
   * @param {Widget} child - The child to add.
   *
   * @emits Widget#child_added
   *
   * @see Container#appendChild
   */
  addChild(child) {
    let C = this.children;
    if (!C) this.children = C = [];

    if (C.indexOf(child) !== -1) throw new Error('Adding child twice.');

    child.setParent(this);
    C.push(child);
    if (this.isDrawn()) {
      child.enableDraw();
    } else {
      child.disableDraw();
    }
    child.triggerResize();
    this.emit('child_added', child);
  }

  /**
   * Removes a child widget. Note that this method only modifies
   * the widget tree and does not change the DOM.
   *
   * @method Widget#removeChild
   *
   * @emits Widget#child_removed
   *
   * @param {Widget} child - The child to remove.
   */
  removeChild(child) {
    if (this.isDestructed()) return;
    if (child.parent === this) child.setParent(void 0, true);
    child.disableDraw();
    const C = this.children;
    let i;
    if (C !== null && (i = C.indexOf(child)) !== -1) {
      C.splice(i, 1);
      this.emit('child_removed', child);
      if (!C.length) this.children = null;
    } else {
      error('%o is not a child of %o', child, this);
    }
  }

  /**
   * Calls {@link Widget#appendChild} for an array of widgets.
   *
   * @method Widget#appendChildren
   *
   * @param {Array.<Widget>} children - The child widgets to append.
   */
  appendChildren(a) {
    a.map(this.appendChild, this);
  }

  /**
   * Appends <code>child.element</code> to the widget element and
   * registers <code>child</code> as a child widget.
   *
   * @method Widget#appendChild
   *
   * @param {Widget} child - The child widget to append.
   */
  appendChild(child) {
    this.element.appendChild(child.element);
    this.addChild(child);
  }

  /**
   * Removes an array of children.
   *
   * @method Widget#removeChildren
   *
   * @param {Array.<Widget>} a - An array of Widgets.
   */
  removeChildren(a) {
    a.map(this.removeChild, this);
  }

  /**
   * Registers an array of widgets as children.
   *
   * @method Widget#addChildren
   *
   * @param {Array.<Widget>} a - An array of Widgets.
   */
  addChildren(a) {
    a.map(this.addChild, this);
  }

  /**
   * Returns an array of all visible children.
   *
   * @method Widget#visibleChildren
   */
  visibleChildren(a) {
    if (!a) a = [];
    const C = this.children;
    if (C)
      for (let i = 0; i < C.length; i++) {
        a.push(C[i]);
        C[i].visibleChildren(a);
      }
    return a;
  }

  /**
   * Returns an array of all children.
   *
   * @method Widget#allChildren
   */
  allChildren(a) {
    if (!a) a = [];
    const C = this.children;
    if (C)
      for (let i = 0; i < C.length; i++) {
        a.push(C[i]);
        C[i].allChildren(a);
      }
    return a;
  }

  getChildren() {
    const C = this.children;
    return C !== null ? C : [];
  }

  /**
   * Calls a callback whenever the widget resizes. This method will
   * trigger one resize.
   *
   * @method Widget#observeResize
   *
   * @param {Function} cb
   */
  observeResize(cb) {
    typecheckFunction(cb);

    let triggered = false;
    const callback = () => {
      if (this.isDestructed()) return;
      triggered = false;
      if (!this.isDrawn()) {
        this.triggerResize();
        return;
      }
      cb(this);
    };
    this.triggerResize();
    return this.subscribe('resize', () => {
      if (triggered) return;
      triggered = true;
      domScheduler.scheduleNext(MASK_CALCULATE, callback);
    });
  }
}
/**
 * Generic DOM events. Please refer to
 *   <a href="https://www.w3schools.com/jsref/dom_obj_event.asp">
 *   W3Schools
 *   </a> for further details.
 *
 * @event Widget##GenericDOMEvents
 */

export function addRenderTask(widget, task) {
  widget.getRenderer().addTask(task);
}

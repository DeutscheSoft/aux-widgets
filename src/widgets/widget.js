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
import {
  toggleClass,
  setStyles,
  addClass,
  removeClass,
  hasClass,
  setStyle,
  getStyle,
} from './../utils/dom.js';
import { log, warn, error } from './../utils/log.js';
import { defineClass } from './../widget_helpers.js';
import { Base } from './../implements/base.js';
import {
  initSubscriptions,
  addSubscription,
  unsubscribeSubscriptions,
} from '../utils/subscriptions.js';
import { typecheckFunction } from '../utils/typecheck.js';
import { GlobalResize } from '../utils/global_resize.js';
import { GlobalVisibilityChange } from '../utils/global_visibility_change.js';

/* jshint -W089 */
function Invalid(options) {
  for (var key in options) this[key] = true;
}
/* jshint +W089 */

Invalid.prototype = {
  validate: function () {
    var i = 0,
      key;
    var ret = false;
    for (i = 0; i < arguments.length; i++) {
      key = arguments[i];
      if (this.hasOwnProperty(key) && this[key]) {
        this[key] = false;
        ret = true;
      }
    }

    return ret;
  },
  test: function () {
    var i = 0,
      key;
    for (i = 0; i < arguments.length; i++) {
      key = arguments[i];
      if (this.hasOwnProperty(key) && this[key]) {
        return true;
      }
    }
  },
};
function redraw(fun) {
  if (!this._drawn) return;

  if (this.needs_draw) {
    this.needs_draw = false;
    this.draw(this.options, this.element);
  }

  this.needs_redraw = false;
  this.emit('redraw');
  fun.call(this);
}
function resize() {
  if (this.isDestructed()) return;

  // we were turned off before we could resize
  if (!this.isDrawn()) {
    this.triggerResize();
    return;
  }

  this.resize();
}
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
  var O = this.options;
  var dbc = O.dblclick;
  if (!dbc) return;
  var d = +new Date();
  if (this.__lastclick + dbc > d) {
    e.lastclick = this.__lastclick;
    this.emit('doubleclick', e);
    this.__lastclick = 0;
  } else {
    this.__lastclick = d;
  }
}

function setPreset(preset) {
  let O = this.options;
  let key, val;
  if (this._last_preset) {
    this.removeClass('aux-preset-' + this._last_preset);
  }
  this.addClass('aux-preset-' + preset);
  this._last_preset = preset;

  let preset_options = O.presets[preset] || {};
  this._presetting = true;
  for (key in preset_options) {
    if (!this._preset_origins.hasOwnProperty(key))
      this._preset_origins[key] = O[key];
    if (preset_options.hasOwnProperty(key)) val = preset_options[key];
    else val = this._preset_origins[key];
    this.set(key, val);
  }
  this._presetting = false;
}

export const Widget = defineClass({
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
   * @property {Boolean} [options.needs_resize=true] - Set to true if the resize function shall be called before the next redraw.
   * @property {Boolean} [options.dblclick=400] - Set a time in milliseconds for triggering double click event. If 0, no double click events are fired.
   * @property {String} [options.preset] - Set a preset. This string
   *   gets set as class attribute `aux-preset-[preset]`. If `options.presets` has a member
   *   of this name, all options of its option object are set on the Widget. Non-existent
   *   options are reset to the default. Defaults are updated on initialization and runtime.
   * @property {Object} [options.presets={}] - An object with available preset
   *   specific options. Refer to `options.preset` for more information.
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
   * The <code>redraw</code> event is emitted when a widget is redrawn. This can be used
   * to do additional DOM modifications to a Widget.
   *
   * @event Widget#redraw
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
  Extends: Base,
  _options: {
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
    needs_resize: 'boolean',
    dblclick: 'number',
    interacting: 'boolean',
    presets: 'object',
    preset: 'string',
    title: 'string',
  },
  options: {
    // these options are of less use and only here to show what we need
    debug: false,
    disabled: false, // Widgets can be disabled by setting this to true
    visible: true,
    needs_resize: true,
    dblclick: 0,
    interacting: false,
    presets: {},
  },
  static_events: {
    set_container: function () {
      throw new Error('container is not a dynamic option.');
    },
    set_styles: function () {
      throw new Error('styles is not a dynamic option.');
    },
    set_class: function () {
      throw new Error('class is not a dynamic option.');
    },
    set_dblclick: function (val) {
      const event_target = this.getEventTarget();
      if (!event_target) return;
      if (!!val) event_target.addEventListener('click', this.__dblclick_cb);
      else event_target.removeEventListener('click', this.__dblclick_cb);
    },
    initialized: function () {
      var v = this.options.dblclick;
      if (v > 0) this.set('dblclick', v);
    },
    set_preset: function (v) {
      setPreset.call(this, v);
    },
    set: function (key, val) {
      if (!this._presetting && this._preset_origins.hasOwnProperty(key)) {
        this._preset_origins[key] = val;
      }
    },
    set_visible: function (val) {
      if (val === true) this.enableDraw();
      if (val === false) this.disableDrawChildren();
    },
  },
  constructor: function (options) {
    if (!options) options = {};
    Base.call(this, options);
  },
  initialize: function (options) {
    Base.prototype.initialize.call(this, options);
    // Main actions every widget needs to take
    var E = options.element || null;
    if (E !== null && !E.isAuxWidget) {
      E.auxWidget = this;
      E.isAuxWidget = true;
    }
    this.element = E;
    this.invalid = new Invalid(this.options);
    if (!this.value_time) this.value_time = null;
    this.needs_redraw = false;
    this.needs_draw = true;
    this._drawn = false;
    this._redraw = redraw.bind(this, this.redraw);
    this.__resize = resize.bind(this);
    this._schedule_resize = this.scheduleResize.bind(this);
    this.parent = void 0;
    this.children = null;
    this.draw_queue = null;
    this.__lastclick = 0;
    this.__dblclick_cb = dblClick.bind(this);
    this._onresize = onResize.bind(this);
    this._onvisibilitychange = onVisibilityChange.bind(this);
    this._interaction_count = 0;
    this._preset_origins = {};
    this._last_preset = null;
    this._presetting = false;
    this._subscriptions = initSubscriptions();
  },

  getStyleTarget: function () {
    return this.element;
  },

  getClassTarget: function () {
    return this.element;
  },

  getEventTarget: function () {
    return this.element;
  },

  isDestructed: function () {
    return this.options === null;
  },

  startInteracting: function () {
    const count = this._interaction_count++;
    if (!count) {
      this.set('interacting', true);
    }
  },
  stopInteracting: function () {
    const count = --this._interaction_count;
    if (!count) {
      this.set('interacting', false);
    }
  },

  invalidateAll: function () {
    for (var key in this.options) {
      if (!this._options[key]) {
        if (key.charCodeAt(0) !== 95)
          warn('%O %s: unknown option %s', this, this._class, key);
      } else this.invalid[key] = true;
    }
  },

  assertNoneInvalid: function () {
    var _warn = [];
    for (var key in this.invalid) {
      if (this.invalid[key] === true) {
        _warn.push(key);
      }
    }

    if (_warn.length) {
      warn('found', _warn.length, 'invalid in', this, ':', _warn);
    }
  },

  triggerResize: function () {
    if (!this.options.needs_resize) {
      if (this.isDestructed()) {
        // This object was destroyed but trigger resize was still scheduled for the next frame.
        // FIXME: fix this whole problem properly
        return;
      }

      this.set('needs_resize', true);

      var C = this.children;

      if (!C) return;

      for (var i = 0; i < C.length; i++) {
        C[i].triggerResize();
      }
    }
  },

  triggerResizeChildren: function () {
    var C = this.children;

    if (!C) return;

    for (var i = 0; i < C.length; i++) {
      C[i].triggerResize();
    }
  },

  scheduleResize: function () {
    if (this.__resize === null) return;
    S.addNext(this.__resize, 0);
  },

  resize: function () {
    this.emit('resize');

    if (this._options.resized) this.set('resized', true);

    if (this.hasEventListeners('resized')) {
      S.afterFrame(this.emit.bind(this, 'resized'));
    }
  },

  triggerDraw: function () {
    if (!this.needs_redraw) {
      this.needs_redraw = true;
      if (this._drawn) S.add(this._redraw, 1);
    }
  },

  triggerDrawNext: function () {
    if (!this.needs_redraw) {
      this.needs_redraw = true;
      if (this._drawn) S.addNext(this._redraw, 1);
    }
  },

  initialized: function () {
    // Main actions every widget needs to take
    /**
     * Is fired when a widget is initialized.
     *
     * @event Widget#initialized
     */
    Base.prototype.initialized.call(this);
    this.triggerDraw();

    if (this.options.preset) {
      this.set('preset', this.options.preset);
    }
  },
  drawOnce: function (fun) {
    var q = this.draw_queue;

    if (q === null) {
      this.draw_queue = [fun];
    } else {
      for (var i = 0; i < q.length; i++) if (q[i] === fun) return;
      q[i] = fun;
    }
    this.triggerDraw();
  },
  draw: function (O, element) {
    let E;

    if (O.container) O.container.appendChild(element);

    addClass(element, 'aux-widget');
    this.disableTransitions();
    S.addNext(() => {
      if (this.isDestructed()) return;
      this.enableTransitions();
    }, 1);

    if (O.id) element.setAttribute('id', O.id);

    if (O.class && (E = this.getClassTarget())) {
      const tmp = O.class.split(' ');
      for (let i = 0; i < tmp.length; i++) addClass(E, tmp[i]);
    }

    if (O.styles && (E = this.getStyleTarget())) {
      setStyles(E, O.styles);
    }

    this.scheduleResize();
  },
  redraw: function () {
    var I = this.invalid;
    var O = this.options;
    var E = this.element;

    if (I.visible) {
      I.visible = false;

      const visible = O.visible;

      if (visible === true) {
        removeClass(E, 'aux-hide');
        addClass(E, 'aux-show');
      } else if (visible === false) {
        removeClass(E, 'aux-show');
        addClass(E, 'aux-hide');
        this.disableDraw();
        return;
      }
    }

    E = this.getStyleTarget();

    if (E) {
      if (I.active) {
        I.active = false;
        toggleClass(E, 'aux-inactive', !O.active);
      }

      if (I.disabled) {
        I.disabled = false;
        toggleClass(E, 'aux-disabled', O.disabled);
      }
    }

    if (I.needs_resize) {
      I.needs_resize = false;

      if (O.needs_resize) {
        O.needs_resize = false;

        S.afterFrame(this._schedule_resize);
      }
    }

    if (I.title) {
      I.title = false;
      E.setAttribute('title', O.title);
    }

    var q = this.draw_queue;

    this.draw_queue = null;

    if (q)
      for (var i = 0; i < q.length; i++) {
        q[i].call(this, O);
      }
  },
  addSubscriptions: function (...subs) {
    subs.forEach((sub) => {
      this._subscriptions = addSubscription(this._subscriptions, sub);
    });
  },
  destroy: function () {
    /**
     * Is fired when a widget is destroyed.
     *
     * @event Widget#destroy
     */
    if (this.isDestructed()) {
      warn('destroy called twice on ', this);
      return;
    }

    this._subscriptions = unsubscribeSubscriptions(this._subscriptions);

    this.emit('destroy');

    this.disableDraw();
    this.setParent(void 0);

    if (this.children) {
      this.removeChildren(this.children);
      this.children = null;
    }

    Base.prototype.destroy.call(this);

    this._redraw = null;
    this.__resize = null;
    this._schedule_resize = null;
    this.options = null;

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  },
  addClass: function (cls) {
    addClass(this.getClassTarget(), cls);
  },
  removeClass: function (cls) {
    removeClass(this.getClassTarget(), cls);
  },
  hasClass: function (cls) {
    return hasClass(this.getClassTarget(), cls);
  },
  setStyle: function (name, value) {
    setStyle(this.getStyleTarget(), name, value);
  },
  /**
   * Sets a CSS style property in this widget's DOM element.
   *
   * @method Widget#setStyle
   */
  setStyles: function (styles) {
    setStyles(this.getStyleTarget(), styles);
  },
  /**
   * Returns the computed style of this widget's DOM element.
   *
   * @method Widget#getStyle
   */
  getStyle: function (name) {
    return getStyle(this.getStyleTarget(), name);
  },
  /**
   * Disable all possibly set CSS transitions.
   *
   * @method Widget#disableTansitions
   */
  disableTransitions: function () {
    addClass(this.element, 'aux-notransition');
  },
  /**
   * Allow possibly set CSS transitions.
   *
   * @method Widget#enableTransitions
   */
  enableTransitions: function () {
    removeClass(this.element, 'aux-notransition');
  },
  // GETTER & SETTER
  /**
   * Invalidates an option and triggers a redraw() call.
   *
   * @param {string} key
   */
  invalidate: function (key) {
    this.invalid[key] = true;
    this.triggerDraw();
  },
  /**
   * Sets an option.
   *
   * @method Widget#set
   *
   * @param {string} key - The option name.
   * @param value - The option value.
   */
  set: function (key, value) {
    /* These options are special and need to be handled immediately, in order
     * to preserve correct ordering */
    if (this._options[key]) {
      this.invalid[key] = true;
      if (this.value_time && this.value_time[key])
        this.value_time[key] = Date.now();
      this.triggerDraw();
    } else if (key.charCodeAt(0) !== 95) {
      warn(
        '%O: %s.set(%s, %O): unknown option.',
        this,
        this._class,
        key,
        value
      );
    }
    Base.prototype.set.call(this, key, value);
    return value;
  },
  trackOption: function (key) {
    if (!this.value_time) this.value_time = {};
    this.value_time[key] = Date.now();
  },
  enableDrawSelf: function () {},
  /**
   * Enables rendering for all children of this widget.
   *
   * @method Widget#enableDrawChildren
   */
  enableDrawChildren: function () {
    var C = this.children;
    if (C) for (var i = 0; i < C.length; i++) C[i].enableDraw();
  },
  /**
   * Schedules this widget for drawing.
   *
   * @method Widget#enableDraw
   *
   * @emits Widget#show
   */
  enableDraw: function () {
    if (this._drawn) return;
    this._drawn = true;
    if (this.needs_redraw) {
      S.add(this._redraw, 1);
    }
    this.emit('show');
    this.enableDrawChildren();
  },
  disableDrawChildren: function () {
    var C = this.children;
    if (C) for (var i = 0; i < C.length; i++) C[i].disableDraw();
  },
  /**
   * Stop drawing this widget.
   *
   * @method Widget#enableDraw
   *
   * @emits Widget#hide
   */
  disableDraw: function () {
    if (!this._drawn) return;
    this._drawn = false;
    if (this.needs_redraw) {
      S.remove(this._redraw, 1);
      S.removeNext(this._redraw, 1);
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
  },
  /**
   * Make the widget visible. This will apply the class <code>aux-show</code>
   * during the next rendering step.
   *
   * @method Widget#show
   */
  show: function () {
    if (this.hidden()) this.set('visible', true);
    if (!this.isDrawn()) this.enableDraw();
  },
  /**
   * Show the widget immediately by applying the class <code>aux-show</code>.
   * Does not call enableDraw().
   *
   * @method Widget#forceShow
   */
  forceShow: function () {
    const E = this.element;
    this.set('visible', true);
    addClass(E, 'aux-show');
    removeClass(E, 'aux-hide');
  },
  /**
   * Hide the widget. This will result in the class <code>aux-hide</code>
   * being applied to this widget in the next rendering step.
   *
   * @method Widget#hide
   */
  hide: function () {
    if (this.hidden()) return;
    this.set('visible', false);
  },
  /**
   * Hide the widget immediately by applying the class <code>aux-hide</code>.
   * Does not call disableDraw().
   *
   * @method Widget#forceHide
   */
  forceHide: function () {
    this.set('visible', false);
    const E = this.element;
    removeClass(E, 'aux-show');
    addClass(E, 'aux-hide');
    this.disableDraw();
  },
  log: function (fmt, ...args) {
    const O = this.options;
    if (!O.debug) return;

    log(fmt, ...args);
  },
  showNoDraw: function () {
    if (this.options.visible === true) return;
    if (this.isDrawn()) this.update('visible', true);
    else {
      this.options.visible = true;
    }
  },
  hideNoDraw: function () {
    if (this.options.visible === false) return;
    this.update('visible', false);
  },
  /**
   * Returns the current hidden status.
   *
   * @method Widget#hidden
   */
  hidden: function () {
    return this.options.visible === false;
  },
  isDrawn: function () {
    return this._drawn;
  },
  /**
   * Toggle the hidden status. This is equivalent to calling hide() or show(), depending on
   * the current hidden status of this widget.
   *
   * @method Widget#toggleHidden
   */
  toggleHidden: function () {
    if (this.hidden()) this.show();
    else this.hide();
  },
  setParent: function (parent, no_remove_child) {
    const old_parent = this.parent;

    if (old_parent === parent) return;

    this.parent = parent;

    if (parent === null) {
      if (old_parent !== parent) {
        GlobalResize.add(this._onresize);
        GlobalVisibilityChange.add(this._onvisibilitychange);
        this._onvisibilitychange();
      }
    } else if (parent !== null && old_parent === null) {
      GlobalResize.delete(this._onresize);
      GlobalVisibilityChange.delete(this._onvisibilitychange);
    }

    if (old_parent && !no_remove_child) {
      old_parent.removeChild(this);
    }
  },
  hasChild: function (child) {
    const C = this.children;

    return C !== null && C.indexOf(child) !== -1;
  },
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
  addChild: function (child) {
    var C = this.children;
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
  },
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
  removeChild: function (child) {
    if (this.isDestructed()) return;
    if (child.parent === this) child.setParent(void 0, true);
    child.disableDraw();
    var C = this.children;
    var i;
    if (C !== null && (i = C.indexOf(child)) !== -1) {
      C.splice(i, 1);
      this.emit('child_removed', child);
      if (!C.length) this.children = null;
    } else {
      error('%o is not a child of %o', child, this);
    }
  },
  /**
   * Calls {@link Widget#appendChild} for an array of widgets.
   *
   * @method Widget#appendChildren
   *
   * @param {Array.<Widget>} children - The child widgets to append.
   */
  appendChildren: function (a) {
    a.map(this.appendChild, this);
  },
  /**
   * Appends <code>child.element</code> to the widget element and
   * registers <code>child</code> as a child widget.
   *
   * @method Widget#appendChild
   *
   * @param {Widget} child - The child widget to append.
   */
  appendChild: function (child) {
    this.element.appendChild(child.element);
    this.addChild(child);
  },
  /**
   * Removes an array of children.
   *
   * @method Widget#removeChildren
   *
   * @param {Array.<Widget>} a - An array of Widgets.
   */
  removeChildren: function (a) {
    a.map(this.removeChild, this);
  },
  /**
   * Registers an array of widgets as children.
   *
   * @method Widget#addChildren
   *
   * @param {Array.<Widget>} a - An array of Widgets.
   */
  addChildren: function (a) {
    a.map(this.addChild, this);
  },

  /**
   * Returns an array of all visible children.
   *
   * @method Widget#visibleChildren
   */
  visibleChildren: function (a) {
    if (!a) a = [];
    var C = this.children;
    if (C)
      for (var i = 0; i < C.length; i++) {
        a.push(C[i]);
        C[i].visibleChildren(a);
      }
    return a;
  },

  /**
   * Returns an array of all children.
   *
   * @method Widget#allChildren
   */
  allChildren: function (a) {
    if (!a) a = [];
    var C = this.children;
    if (C)
      for (var i = 0; i < C.length; i++) {
        a.push(C[i]);
        C[i].allChildren(a);
      }
    return a;
  },

  getChildren: function () {
    var C = this.children;
    return C !== null ? C : [];
  },
  /**
   * Calls a callback whenever the widget resizes. This method will
   * trigger one resize.
   *
   * @param {Function} cb
   */
  observeResize: function (cb) {
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
      S.addNext(callback);
    });
  },
});
/**
 * Generic DOM events. Please refer to
 *   <a href="https://www.w3schools.com/jsref/dom_obj_event.asp">
 *   W3Schools
 *   </a> for further details.
 *
 * @event Widget##GenericDOMEvents
 */

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

import { warn } from './../utils/log.js';
import {
  removeActiveEventListener,
  addActiveEventListener,
} from './../utils/events.js';
import {
  addEvent,
  removeEvent,
  mergeStaticEvents,
} from './../widget_helpers.js';

function callHandler(self, fun, args) {
  try {
    return fun.apply(self, args);
  } catch (e) {
    warn('event handler', fun, 'threw', e);
  }
}
function dispatchEvents(self, handlers, args) {
  let v;
  if (Array.isArray(handlers)) {
    for (let i = 0; i < handlers.length; i++) {
      v = callHandler(self, handlers[i], args);
      if (v !== void 0) return v;
    }
  } else return callHandler(self, handlers, args);
}
const __native_events = {
  // mouse
  mouseenter: true,
  mouseleave: true,
  mousedown: true,
  mouseup: true,
  mousemove: true,
  mouseover: true,

  click: true,
  dblclick: true,

  startdrag: true,
  stopdrag: true,
  drag: true,
  dragenter: true,
  dragleave: true,
  dragover: true,
  drop: true,
  dragend: true,

  // touch
  touchstart: true,
  touchend: true,
  touchmove: true,
  touchenter: true,
  touchleave: true,
  touchcancel: true,

  keydown: true,
  keypress: true,
  keyup: true,
  scroll: true,
  focus: true,
  blur: true,
  input: true,

  // mousewheel
  mousewheel: true,
  DOMMouseScroll: true,
  wheel: true,

  submit: true,
  contextmenu: true,

  // pointer events
  pointerover: true,
  pointerenter: true,
  pointerdown: true,
  pointermove: true,
  pointerup: true,
  pointercancel: true,
  pointerout: true,
  pointerleave: true,
  gotpointercapture: true,
  lostpointercapture: true,
};
export function isNativeEvent(type) {
  return __native_events[type];
}

function removeNativeEvents(element) {
  let type;
  const s = this.getStaticEvents();
  const d = this.__events;
  const handler = this.__native_handler;

  for (type in s)
    if (isNativeEvent(type)) removeActiveEventListener(element, type, handler);

  for (type in d)
    if (
      isNativeEvent(type) &&
      (!s || !Object.prototype.hasOwnProperty.call(s, type))
    )
      removeActiveEventListener(element, type, handler);
}
function addNativeEvents(element) {
  let type;
  const s = this.getStaticEvents();
  const d = this.__events;
  const handler = this.__native_handler;

  for (type in s)
    if (isNativeEvent(type)) addActiveEventListener(element, type, handler);

  for (type in d)
    if (
      isNativeEvent(type) &&
      (!s || !Object.prototype.hasOwnProperty.call(s, type))
    )
      addActiveEventListener(element, type, handler);
}
function nativeHandler(ev) {
  /* FIXME:
   * * mouseover and error are cancelled with true
   * * beforeunload is cancelled with null
   */
  if (this.emit(ev.type, ev) === false) return false;
}

function mergeOptions(...options) {
  options = options.flat();

  return Object.assign({}, ...options);
}

function hasProperty(cl, name) {
  return Object.prototype.hasOwnProperty.call(cl, name);
}

function getBaseOf(cl) {
  const prototype = Object.getPrototypeOf(cl.prototype);

  if (!prototype) return null;

  return prototype.constructor;
}

function collectFromPrototypes(cl, name, funName) {
  const result = [];
  const base = getBaseOf(cl);

  if (base && base[funName]) {
    result.push(base[funName]());
  }

  if (hasProperty(cl, name)) {
    result.push(cl[name]);
  }

  return result;
}

/**
 * This is the base class for all AUX widgets.
 * It provides an API for event handling and options.
 *
 * @class Base
 */
export class Base {
  static getOptionTypes() {
    if (!hasProperty(this, 'auxOptionTypes')) {
      const options = collectFromPrototypes(this, '_options', 'getOptionTypes');
      this.auxOptionTypes = mergeOptions(...options);
    }

    return this.auxOptionTypes;
  }

  static getOptionType(name) {
    return this.getOptionTypes()[name];
  }

  static getDefaultOptions() {
    if (!hasProperty(this, 'auxOptions')) {
      const options = collectFromPrototypes(
        this,
        'options',
        'getDefaultOptions'
      );
      this.auxOptions = mergeOptions(...options);
    }

    return this.auxOptions;
  }

  static getDefault(name) {
    return this.getDefaultOptions()[name];
  }

  static getStaticEvents() {
    if (!Object.prototype.hasOwnProperty.call(this, 'auxStaticEvents')) {
      const base = Object.getPrototypeOf(this.prototype).constructor;
      const ownEvents = Object.prototype.hasOwnProperty.call(
        this,
        'static_events'
      )
        ? this.static_events
        : {};
      let events;

      if (base.getStaticEvents) {
        events = mergeStaticEvents(base.getStaticEvents(), ownEvents);
      } else {
        events = Object.assign({}, ownEvents);
      }

      this.auxStaticEvents = events;
    }
    return this.auxStaticEvents;
  }

  static addStaticEvent(name, callback) {
    addEvent(this.getStaticEvents(), name, callback);
  }

  static defineOption(name, type, defaultValue) {
    const _options = this.getOptionTypes();
    _options[name] = type;
    if (defaultValue !== void 0) this.getDefaultOptions()[name] = defaultValue;
  }

  static hasOption(name) {
    return Object.prototype.hasOwnProperty.call(this.getOptionTypes(), name);
  }

  constructor(...args) {
    this.is_initialized = false;
    this.initialize(...args);
    this.initializeChildren();
    this.initialized();
    this.is_initialized = true;

    const element = this.getEventTarget();

    if (element !== this.__event_target) addNativeEvents.call(this, element);
  }

  getObjectEntry(optionName, value, key) {
    if (value && key in value) return value[key];

    const defaultValue = this.getDefault(optionName);

    return defaultValue ? defaultValue[key] : void 0;
  }

  initialize(options) {
    this.__events = {};
    this.__event_target = null;
    this.__native_handler = nativeHandler.bind(this);
    this.options = Object.assign({}, this.getDefaultOptions());

    for (const key in options)
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const value = options[key];

        if (key.startsWith('on')) {
          this.on(key.substring(2).toLowerCase(), options[key]);
        } else {
          this.options[key] = value;
        }
      }

    this.emit('initialize');
  }

  initializeChildren() {
    this.emit('initialize_children');
  }

  /**
   * Returns the type of an option. If the given option does not exist,
   * 'undefined' is returned.
   *
   * @method Base#getOptionType
   */
  getOptionType(name) {
    return this.constructor.getOptionType(name);
  }

  /**
   * Returns the default value of a given option. If the option does not
   * exist, an exception is thrown.
   *
   * @method Base#getDefault
   */
  getDefault(name) {
    if (this.getOptionType(name) === void 0) {
      throw new Error('Option does not exist.');
    }

    return this.constructor.getDefault(name);
  }

  getDefaultOptions() {
    return this.constructor.getDefaultOptions();
  }

  getStaticEvents() {
    return this.constructor.getStaticEvents();
  }

  initialized() {
    /**
     * Is fired when an instance is initialized.
     *
     * @event Base#initialized
     */
    this.emit('initialized');
  }

  isDestructed() {
    return this.options === null;
  }

  /**
   * Destroys all event handlers and the options object.
   *
   * @method Base#destroy
   */
  destroy() {
    const element = this.getEventTarget();

    if (element) removeNativeEvents.call(this, element);

    this.__events = null;
    this.__event_target = null;
    this.__native_handler = null;
    this.options = null;
  }

  /**
   * Get the value of an option.
   *
   * @method Base#get
   *
   * @param {string} key - The option name.
   */
  get(key) {
    return this.options[key];
  }

  /**
   * Sets an option. Fires both the events <code>set</code> with arguments <code>key</code>
   * and <code>value</code>; and the event <code>'set_'+key</code> with arguments <code>value</code>
   * and <code>key</code>.
   *
   * @method Base#set
   *
   * @param {string} key - The name of the option.
   * @param {mixed} value - The value of the option.
   *
   * @emits Base#set
   * @emits Base#set_[option]
   */
  set(key, value) {
    const options = this.options;
    const currentValue = options[key];

    options[key] = value;
    /**
     * Is fired when an option is set.
     *
     * @event Base#set
     *
     * @param {string} name - The name of the option.
     * @param {mixed} value - The value of the option.
     */
    if (this.hasEventListeners('set'))
      this.emit('set', key, value, currentValue);
    /**
     * Is fired when an option is set.
     *
     * @event Base#set_[option]
     *
     * @param {mixed} value - The value of the option.
     */
    const e = 'set_' + key;
    if (this.hasEventListeners(e)) this.emit(e, value, key, currentValue);

    return value;
  }

  /**
   * Conditionally sets an option unless it already has the requested value.
   *
   * @method Base#update
   *
   * @param {string} key - The name of the option.
   * @param {mixed} value - The value of the option.
   *
   * @emits Base#set
   * @emits Base#set_[option]
   */
  update(key, value) {
    const current_value = this.options[key];

    // If both the old and the new value are NaN there is no need to set them,
    // either.
    if (
      current_value === value ||
      (current_value !== current_value && value !== value)
    )
      return;
    this.set(key, value);
  }

  /**
   * Resets an option to its default value.
   *
   * @method Base#reset
   * @param {string} key - The option name.
   */
  reset(key) {
    return this.set(key, this.getDefault(key));
  }

  /**
   * Sets an option by user interaction. Emits the <code>userset</code>
   * event. The <code>userset</code> event can be cancelled (if an event handler
   * returns <code>false</code>), in which case the option is not set.
   * Returns <code>true</code> if the option was set, <code>false</code>
   * otherwise. If the option was set, it will emit a <code>useraction</code> event.
   *
   * @method Base#userset
   *
   * @param {string} key - The name of the option.
   * @param {mixed} value - The value of the option.
   *
   * @emits Base#userset
   * @emits Base#useraction
   */
  userset(key, value) {
    if (false === this.emit('userset', key, value)) return false;
    value = this.set(key, value);
    this.emit('useraction', key, value);
    return true;
  }

  getEventTarget() {
    return this.__event_target;
  }

  /**
   * Delegates all occuring DOM events of a specific DOM node to the widget.
   * This way the widget fires e.g. a click event if someone clicks on the
   * given DOM node.
   *
   * @method Base#delegateEvents
   *
   * @param {HTMLElement} element - The element all native events of the widget should be bound to.
   *
   * @returns {HTMLElement} The element
   *
   * @emits Base#delegated
   */
  delegateEvents(element) {
    const old_target = this.__event_target;

    if (old_target !== this.getEventTarget()) {
      throw new Error(
        'Cannot both overload getEventTarget() and call delegateEvents()'
      );
    }
    /**
     * Is fired when an element is delegated.
     *
     * @event Base#delegated
     *
     * @param {HTMLElement|Array} element - The element which receives all
     *      native DOM events.
     * @param {HTMLElement|Array} old_element - The element which previously
     *      received all native DOM events.
     */
    this.emit('delegated', element, old_target);

    if (old_target) removeNativeEvents.call(this, old_target);
    if (element) addNativeEvents.call(this, element);

    this.__event_target = element;

    return element;
  }

  /**
   * Register an event handler.
   *
   * @method Base#addEventListener
   *
   * @param {string} event - The event descriptor.
   * @param {Function} func - The function to call when the event happens.
   */
  on(event, func) {
    if (typeof event !== 'string') throw new TypeError('Expected string.');

    if (typeof func !== 'function') throw new TypeError('Expected function.');

    if (arguments.length !== 2) throw new Error('Bad number of arguments.');

    const __events = this.__events;

    if (isNativeEvent(event) && this.is_initialized) {
      const __event_target = this.getEventTarget();
      if (__event_target && !this.hasEventListeners(event))
        addActiveEventListener(__event_target, event, this.__native_handler);
    }
    addEvent(__events, event, func);
  }

  addEventListener(event, func) {
    return this.on(event, func);
  }

  hasEventListener(event, func) {
    const ev = this.__events;

    const handlers = ev[event];

    if (!handlers) return false;

    if (typeof func === 'undefined') return true;

    if (Array.isArray(handlers)) {
      return handlers.includes(func);
    }

    return handlers === func;
  }

  subscribe(event, func) {
    if (this.hasEventListener(event, func)) {
      throw new Error('Event handler already registered.');
    }

    let active = true;
    this.addEventListener(event, func);

    return () => {
      if (!active) return;
      active = false;
      if (!this.isDestructed()) {
        this.removeEventListener(event, func);
      }
      event = null;
      func = null;
    };
  }

  once(event, func) {
    const sub = this.subscribe(event, (...args) => {
      sub();
      return func(...args);
    });

    return sub;
  }

  /**
   * Removes the given function from the event queue.
   * If it is a native DOM event, it removes the DOM event listener
   * as well.
   *
   * @method Base#off
   *
   * @param {string} event - The event descriptor.
   * @param {Function} fun - The function to remove.
   */
  off(event, fun) {
    removeEvent(this.__events, event, fun);

    // remove native DOM event listener from getEventTarget()
    if (
      isNativeEvent(event) &&
      this.is_initialized &&
      !this.hasEventListeners(event)
    ) {
      const ev = this.getEventTarget();
      if (ev) removeActiveEventListener(ev, event, this.__native_handler);
    }
  }

  removeEventListener(event, func) {
    return this.off(event, func);
  }

  /**
   * Fires an event.
   *
   * @method Base#dispatchEvent
   *
   * @param {string} event - The event descriptor.
   * @param {...*} args - Event arguments.
   */
  emit(event) {
    let ev;
    let args;
    let v;

    ev = this.__events;

    if (ev !== void 0 && event in ev) {
      ev = ev[event];

      args = Array.prototype.slice.call(arguments, 1);

      v = dispatchEvents(this, ev, args);
      if (v !== void 0) return v;
    }

    ev = this.getStaticEvents();

    if (ev !== void 0 && event in ev) {
      ev = ev[event];

      if (args === void 0) args = Array.prototype.slice.call(arguments, 1);

      v = dispatchEvents(this, ev, args);
      if (v !== void 0) return v;
    }
  }

  dispatchEvent(event, ...args) {
    return this.emit(event, ...args);
  }

  /**
   * Test if the event descriptor has some handler functions in the queue.
   *
   * @method Base#hasEventListeners
   *
   * @param {string} event - The event desriptor.
   *
   * @returns {boolean} True if the event has some handler functions in the queue, false if not.
   */
  hasEventListeners(event) {
    let ev = this.__events;

    if (Object.prototype.hasOwnProperty.call(ev, event)) return true;

    ev = this.getStaticEvents();

    return ev && Object.prototype.hasOwnProperty.call(ev, event);
  }
}

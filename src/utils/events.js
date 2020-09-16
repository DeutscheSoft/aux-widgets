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

/* Detection and handling for passive event handler support.
 * The chrome team has threatened to make passive event handlers
 * the default in a future version. To make sure that this does
 * not break our code, we explicitly register 'active' event handlers
 * for most cases.
 */

/**
 * This module contains helper functions for using DOM events.
 *
 * @module utils/binding
 */

/* generic code, supports node arrays */
export function addEventListener(e, type, cb, options) {
  if (Array.isArray(e)) {
    for (var i = 0; i < e.length; i++) e[i].addEventListener(type, cb, options);
  } else e.addEventListener(type, cb, options);
}
export function removeEventListener(e, type, cb, options) {
  if (Array.isArray(e)) {
    for (var i = 0; i < e.length; i++)
      e[i].removeEventListener(type, cb, options);
  } else e.removeEventListener(type, cb, options);
}

/* Detect if the 'passive' option is supported.
 * This code has been borrowed from mdn */
var passiveSupported = false;

try {
  var options = Object.defineProperty({}, 'passive', {
    get: function () {
      passiveSupported = true;
      return true;
    },
  });

  window.addEventListener('test', null, options);
  window.removeEventListener('test', null);
} catch (err) {}

var active_options, passive_options;

if (passiveSupported) {
  active_options = { passive: false };
  passive_options = { passive: true };
} else {
  active_options = false;
  passive_options = false;
}

export function addActiveEventListener(e, type, cb) {
  addEventListener(e, type, cb, active_options);
}
export function removeActiveEventListener(e, type, cb) {
  removeEventListener(e, type, cb, active_options);
}
export function addPassiveEventListener(e, type, cb) {
  addEventListener(e, type, cb, passive_options);
}
export function removePassiveEventListener(e, type, cb) {
  removeEventListener(e, type, cb, passive_options);
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

  // mousewheel
  mousewheel: true,
  DOMMouseScroll: true,
  wheel: true,

  submit: true,
  contextmenu: true,
};
export function isDOMEvent(type) {
  return __native_events[type];
}

export function subscribeDOMEvent(node, event_name, cb) {
  const callback = (...args) => cb(...args);

  node.addEventListener(event_name, callback);

  return () => {
    node.removeEventListener(event_name, callback);
  };
}

export function subscribeDOMEventOnce(node, event_name, cb) {
  const callback = (...args) => {
    node.addEventListener(event_name, callback);
    return cb(...args);
  };

  node.addEventListener(event_name, callback);

  return () => {
    node.removeEventListener(event_name, callback);
  };
}

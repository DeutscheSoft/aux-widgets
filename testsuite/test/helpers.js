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

import { domScheduler } from '../src/dom_scheduler.js';

export function compare(a, b) {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;
  if (typeof a === 'object') {
    const json1 = JSON.stringify(a, Object.keys(a).sort());
    const json2 = JSON.stringify(b, Object.keys(b).sort());

    //console.log(json1, json2);

    return json1 === json2;
  }

  return false;
}

export function objectMinus(o, list) {
  const ret = Object.assign({}, o);

  for (let i = 0; i < list.length; i++) {
    delete ret[list[i]];
  }

  return ret;
}

export function compareOptions(w1, w2) {
  const o1 = {},
    o2 = {};
  for (var key in w1._options) {
    if (key === 'id' || key === 'element') continue;
    o1[key] = w1.get(key);
    o2[key] = w2.get(key);
  }

  return compare(o1, o2);
}

export function assert(v, msg) {
  if (!v) {
    debugger;
    throw new Error(msg || 'assertion failed.');
  }
}

export function assertError(cb, msg) {
  let ok = true;
  try {
    w2.removeChild(c1);
    ok = false;
  } catch (err) {}

  assert(ok, msg || 'expected error.');
}

export function assertEqual(a, b) {
  assert(compare(a, b));
}

export function assertChildren(node) {
  assert(!node.children.length, `${node.tagName} has ${node.children.length} child(ren)`);
}

export function sleep(n) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

export function waitForEvent(widget, name) {
  return new Promise((resolve, reject) => {
    const unsubscribe = widget.subscribe(name, () => {
      resolve();
      unsubscribe();
    });
  });
}

export function makeCallback(fun) {
  const calls = [];
  const cb = (...args) => {
    calls.push(args);
    if (fun) return fun(...args);
  };

  cb.assertCalls = (n) => {
    assertEqual(calls.length, n);
  };

  cb.assertArgs = (...args) => {
    assert(calls.length > 0);
    const firstCall = calls[0];
    assertEqual(firstCall, args);
    calls.shift();
  };

  return cb;
}

let _canvas;

export function canvas() {
  if (!_canvas) {
    _canvas = document.createElement('div');
    _canvas.style.visibility = 'hidden';
    document.body.appendChild(_canvas);
  }

  return _canvas;
}

export function waitForDrawn(widget) {
  if (!widget.element.parentNode) {
    canvas().appendChild(widget.element);
    widget.enableDraw();
  }

  return domScheduler.waitForFrame();
}

export function defer() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function waitForConnected(widget) {
  if (!widget.element.parentNode) {
    canvas().appendChild(widget.element);
    widget.enableDraw();
  }

  return defer();
}

export function delay(n) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

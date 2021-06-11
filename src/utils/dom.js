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
 * Helper functions for manipulating the DOM
 *
 * @module utils/dom
 */

import { warn } from './log.js';

/**
 * Returns true if the node has the given class.
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {string} name - The class name.
 * @returns {boolean}
 * @function hasClass
 */
export function hasClass(e, cls) {
  return e.classList.contains(cls);
}

/**
 * Adds a CSS class to a DOM node.
 *
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {...*} names - The class names.
 * @function addClass
 */
export function addClass(e) {
  let i;
  e = e.classList;
  for (i = 1; i < arguments.length; i++) {
    const a = arguments[i].split(' ');
    for (let j = 0; j < a.length; j++) e.add(a[j]);
  }
}
/**
 * Removes a CSS class from a DOM node.
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {...*} names - The class names.
 * @function removeClass
 */
export function removeClass(e) {
  let i;
  e = e.classList;
  for (i = 1; i < arguments.length; i++) e.remove(arguments[i]);
}
/**
 * Toggles a CSS class from a DOM node.
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {string} name - The class name.
 * @function toggleClass
 */
export function toggleClass(e, cls, cond) {
  /* The second argument to toggle is not implemented in IE,
   * so we never use it */
  if (arguments.length >= 3) {
    if (cond) {
      addClass(e, cls);
    } else {
      removeClass(e, cls);
    }
  } else e.classList.toggle(cls);
}

/**
 * Returns the computed style of a node.
 *
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {string} property - The CSS property name.
 * @returns {string}
 *
 * @function getStyle
 */
export function getStyle(e, style) {
  return window.getComputedStyle(e).getPropertyValue(style);
}

const class_regex = /[^A-Za-z0-9_-]/;

/**
 * Returns true ii a string could be a class name.
 * @param {string} string - The string to test
 * @function isClassName
 * @returns {boolean}
 */
export function isClassName(str) {
  return !class_regex.test(str);
}

/**
 * Returns the maximum value (float)  of a comma separated string. It is used
 * to find the longest CSS animation in a set of multiple animations.
 * @param {string} string - The comma separated string.
 * @function getMaxTime
 * @returns {number}
 * @example
 * getMaxTime(getStyle(DOMNode, "animation-duration"));
 */
export function getMaxTime(string) {
  let ret = 0,
    i,
    tmp,
    s = string;

  if (typeof s === 'string') {
    s = s.split(',');
    for (i = 0; i < s.length; i++) {
      tmp = parseFloat(s[i]);

      if (tmp > 0) {
        if (-1 === s[i].search('ms')) tmp *= 1000;
        if (tmp > ret) ret = tmp;
      }
    }
  }

  return ret | 0;
}

/**
 * Returns the longest animation duration of CSS animations and transitions.
 * @param {HTMLElement} element - The element to evalute the animation duration for.
 * @function getDuration
 * @returns {number}
 */
export function getDuration(element) {
  return Math.max(
    getMaxTime(getStyle(element, 'animation-duration')) +
      getMaxTime(getStyle(element, 'animation-delay')),
    getMaxTime(getStyle(element, 'transition-duration')) +
      getMaxTime(getStyle(element, 'transition-delay'))
  );
}

/**
 * Returns the DOM node with the given ID. Shorthand for document.getElementById.
 * @param {string} id - The ID to search for
 * @function getId
 * @returns {HTMLElement}
 */
export function getId(id) {
  return document.getElementById(id);
}

/**
 * Returns all elements as NodeList of a given class name. Optionally limit the list
 * to all children of a specific DOM node. Shorthand for element.getElementsByClassName.
 * @param {string} class - The name of the class
 * @param {DOMNode} element - Limit search to child nodes of this element. Optional.
 * @returns {NodeList}
 * @function getClass
 */
export function getClass(cls, element) {
  return (element ? element : document).getElementsByClassName(cls);
}

/**
 * Returns all elements as NodeList of a given tag name. Optionally limit the list
 * to all children of a specific DOM node. Shorthand for element.getElementsByTagName.
 * @param {string} tag - The name of the tag
 * @param {DOMNode} element - Limit search to child nodes of this element. Optional.
 * @returns {NodeList}
 * @function getTag
 */
export function getTag(tag, element) {
  return (element ? element : document).getElementsByTagName(tag);
}

/**
 * Returns a newly created HTMLElement.
 * @param {string} tag - The type of the element
 * @param {...object} attributes - Optional mapping of attributes for the new node
 * @param {...string} class - Optional class name for the new node
 * @returns HTMLElement
 * @function element
 */
export function element(tag) {
  const n = document.createElement(tag);
  let i, v;
  for (i = 1; i < arguments.length; i++) {
    v = arguments[i];
    if (typeof v === 'object') {
      for (const key in v) {
        if (Object.prototype.hasOwnProperty.call(v, key))
          n.setAttribute(key, v[key]);
      }
    } else if (typeof v === 'string') {
      addClass(n, v);
    } else throw new Error('unsupported argument to element');
  }
  return n;
}

/**
 * Removes all child nodes from an HTMLElement.
 * @param {HTMLElement} element - The element to clean up
 * @function empty
 */
export function empty(element) {
  while (element.lastChild) element.removeChild(element.lastChild);
}

/**
 * Sets a string as new exclusive text node of an HTMLElement.
 * @param {HTMLElement} element - The element to clean up
 * @param {string} text - The string to set as text content
 * @function setText
 */
export function setText(element, text) {
  if (
    element.childNodes.length === 1 &&
    typeof element.childNodes[0].data === 'string'
  )
    element.childNodes[0].data = text;
  else element.textContent = text;
}

/**
 * Returns a documentFragment containing the result of a string parsed as HTML.
 * @param {string} html - A string to parse as HTML
 * @returns {HTMLFragment}
 * @function HTML
 */
export function HTML(string) {
  /* NOTE: setting innerHTML on a document fragment is not supported */
  const e = document.createElement('div');
  const f = document.createDocumentFragment();
  e.innerHTML = string;
  while (e.firstChild) f.appendChild(e.firstChild);
  return f;
}

/**
 * Sets the (exclusive) content of an HTMLElement.
 * @param {HTMLElement} element - The element receiving the content
 * @param{string|HTMLElement} content - A string or HTMLElement to set as content
 * @function setContent
 */
export function setContent(element, content) {
  if (isDomNode(content)) {
    empty(element);
    if (content.parentNode) {
      warn('setContent: possible reuse of a DOM node. cloning\n');
      content = content.cloneNode(true);
    }
    element.appendChild(content);
  } else {
    setText(element, content + '');
  }
}

/**
 * Inserts one HTMLELement after another in the DOM tree.
 * @param {HTMLElement} newnode - The new node to insert into the DOM tree
 * @param {HTMLElement} refnode - The reference element to add the new element after
 * @function insertAfter
 */
export function insertAfter(newnode, refnode) {
  if (refnode.parentNode)
    refnode.parentNode.insertBefore(newnode, refnode.nextSibling);
}

/**
 * Inserts one HTMLELement before another in the DOM tree.
 * @param {HTMLElement} newnode - The new node to insert into the DOM tree
 * @param {HTMLElement} refnode - The reference element to add the new element before
 * @function insertBefore
 */
export function insertBefore(newnode, refnode) {
  if (refnode.parentNode) refnode.parentNode.insertBefore(newnode, refnode);
}

/**
 * Returns the width of the viewport.
 * @returns {number}
 * @function width
 */
export function width() {
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
    document.body.clientWidth || 0
  );
}

/**
 * Returns the height of the viewport.
 * @returns {number}
 * @function height
 */
export function height() {
  return Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0,
    document.body.clientHeight || 0
  );
}

/**
 * Returns the amount of CSS pixels the document or an optional element is scrolled from top.
 * @param {HTMLElement} element - The element to evaluate. Optional.
 * @returns {number}
 * @function scrollTop
 */
export function scrollTop(element) {
  if (element) return element.scrollTop;
  return Math.max(
    document.documentElement.scrollTop || 0,
    window.pageYOffset || 0,
    document.body.scrollTop || 0
  );
}

/**
 * Returns the amount of CSS pixels the document or an optional element is scrolled from left.
 * @param {HTMLElement} element - The element to evaluate. Optional.
 * @returns {number}
 * @function scrollLeft
 */
export function scrollLeft(element) {
  if (element) return element.scrollLeft;
  return Math.max(
    document.documentElement.scrollLeft,
    window.pageXOffset || 0,
    document.body.scrollLeft || 0
  );
}

/**
 * Returns the sum of CSS pixels an element and all of its parents are scrolled from top.
 * @param {HTMLElement} element - The element to evaluate
 * @returns {number}
 * @function scrollAllTop
 */
export function scrollAllTop(element) {
  let v = 0;
  while ((element = element.parentNode)) v += element.scrollTop || 0;
  return v;
}

/**
 * Returns the sum of CSS pixels an element and all of its parents are scrolled from left.
 * @param {HTMLElement} element - The element to evaluate
 * @returns {number}
 * @function scrollAllLeft
 */
export function scrollAllLeft(element) {
  let v = 0;
  while ((element = element.parentNode)) v += element.scrollLeft || 0;
  return v;
}

/**
 * Returns the position from top of an element in relation to the document
 * or an optional HTMLElement. Scrolling of the parent is taken into account.
 * @param {HTMLElement} element - The element to evaluate
 * @param {HTMLElement} relation - The element to use as reference. Optional.
 * @returns {number}
 * @function positionTop
 */
export function positionTop(e, rel) {
  const top = parseInt(e.getBoundingClientRect().top);
  const f = fixed(e) ? 0 : scrollTop();
  return top + f - (rel ? positionTop(rel) : 0);
}

/**
 * Returns the position from the left of an element in relation to the document
 * or an optional HTMLElement. Scrolling of the parent is taken into account.
 * @param {HTMLElement} element - The element to evaluate
 * @param {HTMLElement} relation - The element to use as reference. Optional.
 * @returns {number}
 * @function positionLeft
 */
export function positionLeft(e, rel) {
  const left = parseInt(e.getBoundingClientRect().left);
  const f = fixed(e) ? 0 : scrollLeft();
  return left + f - (rel ? positionLeft(rel) : 0);
}

/**
 * Returns if an element is positioned fixed to the viewport
 * @param {HTMLElement} element - the element to evaluate
 * @returns {boolean}
 * @function fixed
 */
export function fixed(e) {
  return getComputedStyle(e).getPropertyValue('position') === 'fixed';
}

/**
 * Gets or sets the outer width of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param {HTMLElement} element - the element to evaluate / manipulate
 * @param {boolean} margin - Determine if margin is included
 * @param {number} width - If defined the elements outer width is set to this value
 * @returns {number}
 * @function outerWidth
 */
export function outerWidth(element, margin, width) {
  let m = 0;
  if (margin) {
    const cs = getComputedStyle(element);
    m += parseFloat(cs.getPropertyValue('margin-left'));
    m += parseFloat(cs.getPropertyValue('margin-right'));
  }
  if (width !== void 0) {
    if (boxSizing(element) === 'content-box') {
      const css = CSSSpace(element, 'padding', 'border');
      width -= css.left + css.right;
    }
    width -= m;
    // TODO: fixme
    if (width < 0) return 0;
    element.style.width = width + 'px';
    return width;
  } else {
    const w = element.getBoundingClientRect().width;
    return w + m;
  }
}

/**
 * Gets or sets the outer height of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param {HTMLElement} element - the element to evaluate / manipulate
 * @param {boolean} margin - Determine if margin is included
 * @param {number} height - If defined the elements outer height is set to this value
 * @returns {number}
 * @function outerHeight
 */
export function outerHeight(element, margin, height) {
  let m = 0;
  if (margin) {
    const cs = getComputedStyle(element, null);
    m += parseFloat(cs.getPropertyValue('margin-top'));
    m += parseFloat(cs.getPropertyValue('margin-bottom'));
  }
  if (height !== void 0) {
    if (boxSizing(element) === 'content-box') {
      const css = CSSSpace(element, 'padding', 'border');
      height -= css.top + css.bottom;
    }
    height -= m;
    // TODO: fixme
    if (height < 0) return 0;
    element.style.height = height + 'px';
    return height;
  } else {
    const h = element.getBoundingClientRect().height;
    return h + m;
  }
}

/**
 * Gets or sets the inner width of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param {HTMLElement} element - the element to evaluate / manipulate
 * @param {number} width - If defined the elements inner width is set to this value
 * @returns {number}
 * @function innerWidth
 */
export function innerWidth(element, width) {
  const css = CSSSpace(element, 'padding', 'border');
  const x = css.left + css.right;
  if (width !== void 0) {
    if (boxSizing(element) === 'border-box') width += x;
    // TODO: fixme
    if (width < 0) return 0;
    element.style.width = width + 'px';
    return width;
  } else {
    const w = element.getBoundingClientRect().width;
    return w - x;
  }
}

/**
 * Gets or sets the inner height of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param {HTMLElement} element - the element to evaluate / manipulate
 * @param {number} height - If defined the elements outer height is set to this value
 * @returns {number}
 * @function innerHeight
 */
export function innerHeight(element, height) {
  const css = CSSSpace(element, 'padding', 'border');
  const y = css.top + css.bottom;
  if (height !== void 0) {
    if (boxSizing(element) === 'border-box') height += y;
    // TODO: fixme
    if (height < 0) return 0;
    element.style.height = height + 'px';
    return height;
  } else {
    const h = element.getBoundingClientRect().height;
    return h - y;
  }
}

/**
 * Returns the box-sizing method of an HTMLElement.
 * @param {HTMLElement} element - The element to evaluate
 * @returns {string}
 * @function boxSizing
 */
export function boxSizing(element) {
  const cs = getComputedStyle(element, null);
  if (cs.getPropertyValue('box-sizing'))
    return cs.getPropertyValue('box-sizing');
  if (cs.getPropertyValue('-moz-box-sizing'))
    return cs.getPropertyValue('-moz-box-sizing');
  if (cs.getPropertyValue('-webkit-box-sizing'))
    return cs.getPropertyValue('-webkit-box-sizing');
  if (cs.getPropertyValue('-ms-box-sizing'))
    return cs.getPropertyValue('-ms-box-sizing');
  if (cs.getPropertyValue('-khtml-box-sizing'))
    return cs.getPropertyValue('-khtml-box-sizing');
}

/**
 * Returns the overall spacing around an HTMLElement of all given attributes.
 * @param {HTMLElement} element - The element to evaluate
 * @param{...string} The CSS attributes to take into account
 * @returns {object} An object with the members "top", "bottom", "lfet", "right"
 * @function CSSSpace
 * @example
 * CSSSpace(element, "padding", "border");
 */
export function CSSSpace(element) {
  const cs = getComputedStyle(element, null);
  const o = { top: 0, right: 0, bottom: 0, left: 0 };
  let a;
  let s;
  for (let i = 1; i < arguments.length; i++) {
    a = arguments[i];
    for (const p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        s = a + '-' + p;
        if (a === 'border') s += '-width';
        o[p] += parseFloat(cs.getPropertyValue(s));
      }
    }
  }
  return o;
}

/**
 * Set multiple CSS styles onto an HTMLElement.
 * @param {HTMLElement} element - the element to add the styles to
 * @param {object} styles - A mapping containing all styles to add
 * @function setStyles
 * @example
 * setStyles(element, {"width":"100px", "height":"100px"});
 */
export function setStyles(elem, styles) {
  let key, v;
  const s = elem.style;
  for (key in styles)
    if (Object.prototype.hasOwnProperty.call(styles, key)) {
      v = styles[key];
      if (typeof v !== 'number' && !v) {
        delete s[key];
      } else {
        s[key] = v;
      }
    }
}

/**
 * Sets a single CSS style onto an HTMLElement. It is used to autimatically
 * add "px" to numbers and trim them to 3 digits at max. DEPRECATED!
 * @param {HTMLElement} element - The element to set the style to
 * @param {string} style - The CSS attribute to set
 * @param {string|number} value - The value to set the CSS attribute to
 * @function setStyle
 */
export function setStyle(e, style, value) {
  if (typeof value === 'number') {
    /* By default, numbers are transformed to px. I believe this is a very _dangerous_ default
     * behavior, because it breaks other number like properties _without_ warning.
     * this is now deprecated. */
    warn(
      'setStyle: use of implicit px conversion is _deprecated_ and will be removed in the future.'
    );
    value = value.toFixed(3) + 'px';
  }
  e.style[style] = value;
}

let _id_cnt = 0;

/**
 * Generate a unique ID string.
 * @returns {string}
 * @function uniqueId
 */
export function uniqueId() {
  let id;
  do {
    id = 'tk-' + _id_cnt++;
  } while (document.getElementById(id));
  return id;
}

/**
 * Check if an object is a DOMNode
 * @returns {boolean}
 * @function isDomNode
 */
export function isDomNode(o) {
  /* this is broken for SVG */
  return typeof o === 'object' && o instanceof Node;
}

/**
 * True if the current browser supports CSS transforms.
 */
export const supports_transform =
  'transform' in document.createElement('div').style;

/**
 * Check if a device is touch-enabled.
 * @returns {boolean}
 * @function isTouch
 */
export function isTouch() {
  return (
    'ontouchstart' in window || 'onmsgesturechange' in window // works on most browsers
  ); // works on ie10
}

/**
 * Evaluate size of scroll bars. The size is set as CSS variable
 * `--aux-scrollbar-size` on the `body` element.
 * @returns {integer} Size in pixel.
 * @function scrollbarSize
 */
let _scrollbar_size;

export function scrollbarSize() {
  if (typeof _scrollbar_size === 'undefined') {
    const div = element('div');
    div.style.overflow = 'scroll';
    div.style.position = 'fixed';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    _scrollbar_size = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    document.body.style.setProperty(
      '--aux-scrollbar-size',
      _scrollbar_size + 'px'
    );
  }
  return _scrollbar_size;
}

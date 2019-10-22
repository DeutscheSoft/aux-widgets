/*
 * This file is part of Toolkit.
 *
 * Toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

/**
 * Helper functions for manipulating the DOM
 */

import { warn } from './log.js';

/**
 * Returns true if the node has the given class.
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {string} name - The class name.
 * @returns {boolean}
 * @function has_class
 */
export function has_class(e, cls) { return e.classList.contains(cls); }

/**
 * Adds a CSS class to a DOM node.
 *
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {...*} names - The class names.
 * @function add_class
 */
export function add_class(e) {
    var i;
    e = e.classList;
    for (i = 1; i < arguments.length; i++) {
        var a = arguments[i].split(" ");
        for (var j = 0; j < a.length; j++)
            e.add(a[j]);
    }
}
/**
 * Removes a CSS class from a DOM node.
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {...*} names - The class names.
 * @function remove_class
 */
export function remove_class(e) {
    var i;
    e = e.classList;
    for (i = 1; i < arguments.length; i++)
        e.remove(arguments[i]);
}
/**
 * Toggles a CSS class from a DOM node.
 * @param {HTMLElement|SVGElement} node - The DOM node.
 * @param {string} name - The class name.
 * @function toggle_class
 */
export function toggle_class(e, cls, cond) {
    /* The second argument to toggle is not implemented in IE,
     * so we never use it */
    if (arguments.length >= 3) {
        if (cond) {
            add_class(e, cls);
        } else {
            remove_class(e, cls);
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
 * @function get_style
 */
export function get_style(e, style) {
  return window.getComputedStyle(e).getPropertyValue(style);
}

const class_regex = /[^A-Za-z0-9_-]/;

/**
 * Returns true ii a string could be a class name.
 * @param {string} string - The string to test
 * @function is_class_name
 * @returns {boolean}
 */
export function is_class_name (str) {
    return !class_regex.test(str);
}

 /**
 * Returns the maximum value (float)  of a comma separated string. It is used
 * to find the longest CSS animation in a set of multiple animations.
 * @param {string} string - The comma separated string.
 * @function get_max_time
 * @returns {number}
 * @example
 * get_max_time(get_style(DOMNode, "animation-duration"));
 */
export function get_max_time(string) {
    var ret = 0, i, tmp, s = string;

    if (typeof(s) === "string") {
        s = s.split(",");
        for (i = 0; i < s.length; i++) {
            tmp = parseFloat(s[i]);

            if (tmp > 0) {
                if (-1 === s[i].search("ms")) tmp *= 1000;
                if (tmp > ret) ret = tmp;
            }
        }
    }

    return ret|0;
}

/**
* Returns the longest animation duration of CSS animations and transitions.
* @param {HTMLElement} element - The element to evalute the animation duration for.
* @function get_duration
* @returns {number}
*/
export function get_duration(element) {
    return Math.max(get_max_time(get_style(element, "animation-duration")) +
                    get_max_time(get_style(element, "animation-delay")),
                    get_max_time(get_style(element, "transition-duration")) +
                    get_max_time(get_style(element, "transition-delay")));
}

/**
 * Returns the DOM node with the given ID. Shorthand for document.getElementById.
 * @param {string} id - The ID to search for
 * @function get_id
 * @returns {HTMLElement}
 */
export function get_id(id) {
    return document.getElementById(id);
}

/**
 * Returns all elements as NodeList of a given class name. Optionally limit the list
 * to all children of a specific DOM node. Shorthand for element.getElementsByClassName.
 * @param {string} class - The name of the class
 * @param {DOMNode} element - Limit search to child nodes of this element. Optional.
 * @returns {NodeList}
 * @function get_class
 */
export function get_class(cls, element) {
    return (element ? element : document).getElementsByClassName(cls);
}

/**
 * Returns all elements as NodeList of a given tag name. Optionally limit the list
 * to all children of a specific DOM node. Shorthand for element.getElementsByTagName.
 * @param {string} tag - The name of the tag
 * @param {DOMNode} element - Limit search to child nodes of this element. Optional.
 * @returns {NodeList}
 * @function get_tag
 */
export function get_tag(tag, element) {
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
    var n = document.createElement(tag);
    var i, v;
    for (i = 1; i < arguments.length; i++) {
        v = arguments[i];
        if (typeof v === "object") {
            for (var key in v) {
                if (v.hasOwnProperty(key))
                    n.setAttribute(key, v[key]);
            }
        } else if (typeof v === "string") {
            add_class(n, v);
        } else throw new Error("unsupported argument to element");
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
 * @function set_text
 */
export function set_text(element, text) {
    if (element.childNodes.length === 1 && typeof element.childNodes[0].data === "string")
        element.childNodes[0].data = text;
    else
        element.textContent = text;
}

/**
 * Returns a documentFragment containing the result of a string parsed as HTML.
 * @param {string} html - A string to parse as HTML
 * @returns {HTMLFragment}
 * @function html
 */
export function html(string) {
    /* NOTE: setting innerHTML on a document fragment is not supported */
    var e = document.createElement("div");
    var f = document.createDocumentFragment();
    e.innerHTML = string;
    while (e.firstChild) f.appendChild(e.firstChild);
    return f;
}


/**
 * Sets the (exclusive) content of an HTMLElement.
 * @param {HTMLElement} element - The element receiving the content
 * @param{string|HTMLElement} content - A string or HTMLElement to set as content
 * @function set_content
 */
export function set_content(element, content) {
    if (is_dom_node(content)) {
        empty(element);
        if (content.parentNode) {
            warn("set_content: possible reuse of a DOM node. cloning\n");
            content = content.cloneNode(true);
        }
        element.appendChild(content);
    } else {
        set_text(element, content + "");
    }
}

/**
 * Inserts one HTMLELement after another in the DOM tree.
 * @param {HTMLElement} newnode - The new node to insert into the DOM tree
 * @param {HTMLElement} refnode - The reference element to add the new element after
 * @function insert_after
 */
export function insert_after(newnode, refnode) {
    if (refnode.parentNode)
        refnode.parentNode.insertBefore(newnode, refnode.nextSibling);
}

/**
 * Inserts one HTMLELement before another in the DOM tree.
 * @param {HTMLElement} newnode - The new node to insert into the DOM tree
 * @param {HTMLElement} refnode - The reference element to add the new element before
 * @function insert_before
 */
export function insert_before(newnode, refnode) {
    if (refnode.parentNode)
        refnode.parentNode.insertBefore(newnode, refnode);
}

/**
 * Returns the width of the viewport.
 * @returns {number}
 * @function width
 */
export function width() {
    return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0, document.body.clientWidth || 0);
}

/**
 * Returns the height of the viewport.
 * @returns {number}
 * @function height
 */
export function height() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0, document.body.clientHeight || 0);
}

/**
 * Returns the amount of CSS pixels the document or an optional element is scrolled from top.
 * @param {HTMLElement} element - The element to evaluate. Optional.
 * @returns {number}
 * @function scroll_top
 */
export function scroll_top(element) {
    if (element)
        return element.scrollTop;
    return Math.max(document.documentElement.scrollTop || 0, window.pageYOffset || 0, document.body.scrollTop || 0);
}

/**
 * Returns the amount of CSS pixels the document or an optional element is scrolled from left.
 * @param {HTMLElement} element - The element to evaluate. Optional.
 * @returns {number}
 * @function scroll_left
 */
export function scroll_left(element) {
    if (element)
        return element.scrollLeft;
    return Math.max(document.documentElement.scrollLeft, window.pageXOffset || 0, document.body.scrollLeft || 0);
}

/**
 * Returns the sum of CSS pixels an element and all of its parents are scrolled from top.
 * @param {HTMLElement} element - The element to evaluate
 * @returns {number}
 * @function scroll_all_top
 */
export function scroll_all_top(element) {
    var v = 0;
    while ((element = element.parentNode)) v += element.scrollTop || 0;
    return v;
}

/**
 * Returns the sum of CSS pixels an element and all of its parents are scrolled from left.
 * @param {HTMLElement} element - The element to evaluate
 * @returns {number}
 * @function scroll_all_left
 */
export function scroll_all_left(element) {
    var v = 0;
    while ((element = element.parentNode)) v += element.scrollLeft || 0;
    return v;
}

/**
 * Returns the position from top of an element in relation to the document
 * or an optional HTMLElement. Scrolling of the parent is taken into account.
 * @param {HTMLElement} element - The element to evaluate
 * @param {HTMLElement} relation - The element to use as reference. Optional.
 * @returns {number}
 * @function position_top
 */
export function position_top(e, rel) {
    var top    = parseInt(e.getBoundingClientRect().top);
    var f  = fixed(e) ? 0 : scroll_top();
    return top + f - (rel ? position_top(rel) : 0);
}

/**
 * Returns the position from the left of an element in relation to the document
 * or an optional HTMLElement. Scrolling of the parent is taken into account.
 * @param {HTMLElement} element - The element to evaluate
 * @param {HTMLElement} relation - The element to use as reference. Optional.
 * @returns {number}
 * @function position_left
 */
export function position_left(e, rel) {
    var left   = parseInt(e.getBoundingClientRect().left);
    var f = fixed(e) ? 0 : scroll_left();
    return left + f - (rel ? position_left(rel) : 0);
}

/**
 * Returns if an element is positioned fixed to the viewport
 * @param {HTMLElement} element - the element to evaluate
 * @returns {boolean}
 * @function fixed
 */
export function fixed(e) {
    return getComputedStyle(e).getPropertyValue("position") === "fixed";
}

/**
 * Gets or sets the outer width of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param {HTMLElement} element - the element to evaluate / manipulate
 * @param {boolean} margin - Determine if margin is included
 * @param {number} width - If defined the elements outer width is set to this value
 * @returns {number}
 * @function outer_width
 */
export function outer_width(element, margin, width) {
    var m = 0;
    if (margin) {
        var cs = getComputedStyle(element);
        m += parseFloat(cs.getPropertyValue("margin-left"));
        m += parseFloat(cs.getPropertyValue("margin-right"));
    }
    if (width !== void(0)) {
        if (box_sizing(element) === "content-box") {
            var css = css_space(element, "padding", "border");
            width -= css.left + css.right;
        }
        width -= m;
        // TODO: fixme
        if (width < 0) return 0;
        element.style.width = width + "px";
        return width;
    } else {
        var w = element.getBoundingClientRect().width;
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
 * @function outer_height
 */
export function outer_height(element, margin, height) {
    var m = 0;
    if (margin) {
        var cs = getComputedStyle(element, null);
        m += parseFloat(cs.getPropertyValue("margin-top"));
        m += parseFloat(cs.getPropertyValue("margin-bottom"));
    }
    if (height !== void(0)) {
        if (box_sizing(element) === "content-box") {
            var css = css_space(element, "padding", "border");
            height -= css.top + css.bottom;
        }
        height -= m;
        // TODO: fixme
        if (height < 0) return 0;
        element.style.height = height + "px";
        return height;
    } else {
        var h = element.getBoundingClientRect().height;
        return h + m;
    }
}

/**
 * Gets or sets the inner width of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param {HTMLElement} element - the element to evaluate / manipulate
 * @param {number} width - If defined the elements inner width is set to this value
 * @returns {number}
 * @function inner_width
 */
export function inner_width(element, width) {
    var css = css_space(element, "padding", "border");
    var x = css.left + css.right;
    if (width !== void(0)) {
        if (box_sizing(element) === "border-box")
            width += x;
        // TODO: fixme
        if (width < 0) return 0;
        element.style.width = width + "px";
        return width;
    } else {
        var w = element.getBoundingClientRect().width;
        return w - x;
    }
}

/**
 * Gets or sets the inner height of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param {HTMLElement} element - the element to evaluate / manipulate
 * @param {number} height - If defined the elements outer height is set to this value
 * @returns {number}
 * @function inner_height
 */
export function inner_height(element, height) {
    var css = css_space(element, "padding", "border");
    var y = css.top + css.bottom;
    if (height !== void(0)) {
        if (box_sizing(element) === "border-box")
            height += y;
        // TODO: fixme
        if (height < 0) return 0;
        element.style.height = height + "px";
        return height;
    } else {
        var h = element.getBoundingClientRect().height;
        return h - y;
    }
}

/**
 * Returns the box-sizing method of an HTMLElement.
 * @param {HTMLElement} element - The element to evaluate
 * @returns {string}
 * @function box_sizing
 */
export function box_sizing(element) {
    var cs = getComputedStyle(element, null);
    if (cs.getPropertyValue("box-sizing")) return cs.getPropertyValue("box-sizing");
    if (cs.getPropertyValue("-moz-box-sizing")) return cs.getPropertyValue("-moz-box-sizing");
    if (cs.getPropertyValue("-webkit-box-sizing")) return cs.getPropertyValue("-webkit-box-sizing");
    if (cs.getPropertyValue("-ms-box-sizing")) return cs.getPropertyValue("-ms-box-sizing");
    if (cs.getPropertyValue("-khtml-box-sizing")) return cs.getPropertyValue("-khtml-box-sizing");
}

/**
 * Returns the overall spacing around an HTMLElement of all given attributes.
 * @param {HTMLElement} element - The element to evaluate
 * @param{...string} The CSS attributes to take into account
 * @returns {object} An object with the members "top", "bottom", "lfet", "right"
 * @function css_space
 * @example
 * css_space(element, "padding", "border");
 */
export function css_space(element) {
    var cs = getComputedStyle(element, null);
    var o = {top: 0, right: 0, bottom: 0, left: 0};
    var a;
    var s;
    for (var i = 1; i < arguments.length; i++) {
        a = arguments[i];
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                s = a + "-" + p;
                if (a === "border") s += "-width";
            }
            o[p] += parseFloat(cs.getPropertyValue(s));
        }
    }
    return o;
}

/**
 * Set multiple CSS styles onto an HTMLElement.
 * @param {HTMLElement} element - the element to add the styles to
 * @param {object} styles - A mapping containing all styles to add
 * @function set_styles
 * @example
 * set_styles(element, {"width":"100px", "height":"100px"});
 */
export function set_styles(elem, styles) {
    var key, v;
    var s = elem.style;
    for (key in styles) if (styles.hasOwnProperty(key)) {
        v = styles[key];
        if (typeof v !== "number" && !v) {
            delete s[key];
        } else {
            if (typeof v === "number") {
                warn("set_styles: use of implicit px conversion is _deprecated_ and will be removed in the future.");
                v = v.toFixed(3) + "px";
            }
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
 * @function set_style
 */
export function set_style(e, style, value) {
    if (typeof value === "number") {
        /* By default, numbers are transformed to px. I believe this is a very _dangerous_ default
         * behavior, because it breaks other number like properties _without_ warning.
         * this is now deprecated. */
        warn("set_style: use of implicit px conversion is _deprecated_ and will be removed in the future.");
        value = value.toFixed(3) + "px";
    }
    e.style[style] = value;
}

var _id_cnt = 0;

/**
 * Generate a unique ID string.
 * @returns {string}
 * @function unique_id
 */
export function unique_id() {
    var id;
    do { id = "tk-" + _id_cnt++; } while (document.getElementById(id));
    return id;
}

/**
 * Creates and returns an SVG child element.
 * @param {string} tag - The element to create as string, e.g. "line" or "g"
 * @param {object} arguments - The attributes to set onto the element
 * @returns {SVGElement}
 */
export function make_svg(tag, args) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', "svg:" + tag);
    for (var k in args)
        el.setAttribute(k, args[k]);
    return el;
}

export function is_dom_node(o) {
    /* this is broken for SVG */
    return typeof o === "object" && o instanceof Node;
}

/**
 * True if the current browser supports CSS transforms.
 */
export const supports_transform = 'transform' in document.createElement("div").style;

/**
 * Check if a device is touch-enabled.
 * @returns {boolean}
 * @function is_touch
 */
export function is_touch() {
    return 'ontouchstart' in window || // works on most browsers
           'onmsgesturechange' in window; // works on ie10
}


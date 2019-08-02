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

const data_store = new WeakMap();;

function data(e) {
    let r;

    r = data_store.get(e);

    if (!r) {
        r = {};
        data_store.set(e, r);
    }

    return r;
};

function store(e, key, val) {
    /**
     * Store a piece of data in an object.
     * @param {object} object - The object to store the data
     * @param {string} key - The key to identify the memory
     * @param {*} data - The data to store
     * @function store
     */
    data(e)[key] = val;
}

function retrieve(e, key) {
    /**
     * Retrieve a piece of data from an object.
     * @param {object} object - The object to retrieve the data from
     * @param {string} key - The key to identify the memory
     * @function retrieve
     * @returns {*}
     */
    return data(e)[key];
}

/**
 * Move SVG for some sub-pixel if their position in viewport is not int.
 * @param {SVGElement} svg - The SVG to manipulate
 * @function seat_svg
 */
export function seat_svg(e) {
    if (retrieve(e, "margin-left") === null) {
        store(e, "margin-left", parseFloat(get_style(e, "margin-left")));
    } else {
        e.style.marginLeft = retrieve(e, "margin-left") || 0;
    }
    var l = parseFloat(retrieve(e, "margin-left")) || 0;
    var b = e.getBoundingClientRect();
    var x = b.left % 1;
    if (x) {
        if (x < 0.5) l -= x;
        else l += (1 - x);
    }
    if (e.parentElement && get_style(e.parentElement, "text-align") === "center")
        l += 0.5;
    e.style.marginLeft = l + "px";
    //console.log(l);
    if (retrieve(e, "margin-top") === null) {
        store(e, "margin-top", parseFloat(get_style(e, "margin-top")));
    } else {
        e.style.marginTop = retrieve(e, "margin-top") || 0;
    }
    var t = parseFloat(retrieve(e, "margin-top") || 0);
    var b = e.getBoundingClientRect();
    var y = b.top % 1;
    if (y) {
        if (x < 0.5) t -= y;
        else t += (1 - y);
    }
    //console.log(t);
    e.style.marginTop = t + "px";
}

/**
 * Searches for all SVG that don't have the class "svg-fixed" and re-positions them
 * in order to avoid blurry lines.
 * @param {HTMLElement} parent - If set only children of parent are searched
 * @function seat_all_svg
 */
export function seat_all_svg(parent) {
    var a = get_tag("svg", parent);
    for (var i = 0; i < a.length; i++) {
        if (!has_class(a[i], "svg-fixed"))
            seat_svg(a[i]);
    }
}


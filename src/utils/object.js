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

/**
 * Collection of functions operating on objects.
 *
 * @module utils/object
 */

/**
 * Merge two or more objects. The second and all following objects
 * will be merged into the first one.
 * @param {...object} object - The objects to merge
 * @returns {object}
 * @function merge
 */

/* jshint -W089 */
export function merge(dst) {
  //console.log("merging", src, "into", dst);
  var key, i, src;
  for (i = 1; i < arguments.length; i++) {
    src = arguments[i];
    for (key in src) {
      dst[key] = src[key];
    }
  }
  return dst;
}
/* jshint +W089 */

/**
 * Filter an object via white list.
 * @param {object} origin - The object to filter
 * @param {object} filter - The object containing the white list
 * @returns {object} The filtered result
 * @function objectAnd
 */
export function objectAnd(orig, filter) {
  var ret = {};
  for (var key in orig) {
    if (filter[key]) ret[key] = orig[key];
  }
  return ret;
}

/**
 * Filter an object via black list.
 * @param {object} origin - The object to filter
 * @param {object} filter - The object containing the black list
 * @returns {object} The filtered result
 * @function objectSub
 */

/* jshint -W089 */
export function objectSub(orig, filter) {
  var ret = {};
  for (var key in orig) {
    if (!filter[key]) ret[key] = orig[key];
  }
  return ret;
}
/* jshint +W089 */

/**
 * Convert any collection (like NodeList) into an array.
 * @param {collection} collection - The collection to convert into an array
 * @returns {array}
 * @function toArray
 */
export function toArray(collection) {
  var ret = new Array(collection.length);
  var i;

  for (i = 0; i < ret.length; i++) {
    ret[i] = collection[i];
  }

  return ret;
}

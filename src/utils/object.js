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

/**
 * Filter an object via white list.
 * @param {object} origin - The object to filter
 * @param {object} filter - The object containing the white list
 * @returns {object} The filtered result
 * @function object_and
 */
export function object_and(orig, filter) {
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
 * @function object_sub
 */
export function object_sub(orig, filter) {
  var ret = {};
  for (var key in orig) {
    if (!filter[key]) ret[key] = orig[key];
  }
  return ret;
}

/**
 * Convert any collection (like NodeList) into an array.
 * @param {collection} collection - The collection to convert into an array
 * @returns {array}
 * @function to_array
 */
export function to_array(collection) {
  var ret = new Array(collection.length);
  var i;

  for (i = 0; i < ret.length; i++) {
    ret[i] = collection[i];
  }

  return ret;
}

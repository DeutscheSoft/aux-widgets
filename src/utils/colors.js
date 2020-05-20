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
 * @module utils/colors
 *
 * @description Colors provides functions for easy-to-use color calculations
 * and conversions. Functions requiring RGB or HSL color definitions as
 * arguments (all `rgb2x` and `hsl2x`) can be called with different types of arguments
 * to make using them more convenient. Examples:
 * <ul>
 * <li><code>RGBToHSL(240, 128, 128)</code></li>
 * <li><code>RGBToHSL({'r':240,'g':128,'b':128}</code></li>
 * <li><code>RGBToHSL([240, 128, 128])</code></li>
 * </ul>
 *
 * The universal functions `color2x` take even more flexible arguments.
 * The following examples all define the same color:
 * <ul>
 * <li><code>"lightcoral"</code></li>
 * <li><code>"#F08080"</code></li>
 * <li><code>[0,0.31,0.28]</code></li>
 * <li><code>240,128,128</code></li>
 * <li><code>{"r":240,"g":128,"b":128}</code></li>
 * </ul>
 *
 */

const color_names = {
  lightcoral: 'f08080',
  salmon: 'fa8072',
  darksalmon: 'e9967a',
  lightsalmon: 'ffa07a',
  crimson: 'dc143c',
  red: 'ff0000',
  firebrick: 'b22222',
  darkred: '8b0000',
  pink: 'ffc0cb',
  lightpink: 'ffb6c1',
  hotpink: 'ff69b4',
  deeppink: 'ff1493',
  mediumvioletred: 'c71585',
  palevioletred: 'db7093',
  coral: 'ff7f50',
  tomato: 'ff6347',
  orangered: 'ff4500',
  darkorange: 'ff8c00',
  orange: 'ffa500',
  gold: 'ffd700',
  yellow: 'ffff00',
  lightyellow: 'ffffe0',
  lemonchiffon: 'fffacd',
  lightgoldenrodyellow: 'fafad2',
  papayawhip: 'ffefd5',
  moccasin: 'ffe4b5',
  peachpuff: 'ffdab9',
  palegoldenrod: 'eee8aa',
  khaki: 'f0e68c',
  darkkhaki: 'bdb76b',
  lavender: 'e6e6fa',
  thistle: 'd8bfd8',
  plum: 'dda0dd',
  violet: 'ee82ee',
  orchid: 'da70d6',
  fuchsia: 'ff00ff',
  magenta: 'ff00ff',
  mediumorchid: 'ba55d3',
  mediumpurple: '9370db',
  amethyst: '9966cc',
  blueviolet: '8a2be2',
  darkviolet: '9400d3',
  darkorchid: '9932cc',
  darkmagenta: '8b008b',
  purple: '800080',
  indigo: '4b0082',
  slateblue: '6a5acd',
  darkslateblue: '483d8b',
  mediumslateblue: '7b68ee',
  greenyellow: 'adff2f',
  chartreuse: '7fff00',
  lawngreen: '7cfc00',
  lime: '00ff00',
  limegreen: '32cd32',
  palegreen: '98fb98',
  lightgreen: '90ee90',
  mediumspringgreen: '00fa9a',
  springgreen: '00ff7f',
  mediumseagreen: '3cb371',
  seagreen: '2e8b57',
  forestgreen: '228b22',
  green: '008000',
  darkgreen: '006400',
  yellowgreen: '9acd32',
  olivedrab: '6b8e23',
  olive: '808000',
  darkolivegreen: '556b2f',
  mediumaquamarine: '66cdaa',
  darkseagreen: '8fbc8f',
  lightseagreen: '20b2aa',
  darkcyan: '008b8b',
  teal: '008080',
  aqua: '00ffff',
  cyan: '00ffff',
  lightcyan: 'e0ffff',
  paleturquoise: 'afeeee',
  aquamarine: '7fffd4',
  turquoise: '40e0d0',
  mediumturquoise: '48d1cc',
  darkturquoise: '00ced1',
  cadetblue: '5f9ea0',
  steelblue: '4682b4',
  lightsteelblue: 'b0c4de',
  powderblue: 'b0e0e6',
  lightblue: 'add8e6',
  skyblue: '87ceeb',
  lightskyblue: '87cefa',
  deepskyblue: '00bfff',
  dodgerblue: '1e90ff',
  cornflowerblue: '6495ed',
  royalblue: '4169e1',
  blue: '0000ff',
  mediumblue: '0000cd',
  darkblue: '00008b',
  navy: '000080',
  midnightblue: '191970',
  cornsilk: 'fff8dc',
  blanchedalmond: 'ffebcd',
  bisque: 'ffe4c4',
  navajowhite: 'ffdead',
  wheat: 'f5deb3',
  burlywood: 'deb887',
  tan: 'd2b48c',
  rosybrown: 'bc8f8f',
  sandybrown: 'f4a460',
  goldenrod: 'daa520',
  darkgoldenrod: 'b8860b',
  peru: 'cd853f',
  chocolate: 'd2691e',
  saddlebrown: '8b4513',
  sienna: 'a0522d',
  brown: 'a52a2a',
  maroon: '800000',
  white: 'ffffff',
  snow: 'fffafa',
  honeydew: 'f0fff0',
  mintcream: 'f5fffa',
  azure: 'f0ffff',
  aliceblue: 'f0f8ff',
  ghostwhite: 'f8f8ff',
  whitesmoke: 'f5f5f5',
  seashell: 'fff5ee',
  beige: 'f5f5dc',
  oldlace: 'fdf5e6',
  floralwhite: 'fffaf0',
  ivory: 'fffff0',
  antiquewhite: 'faebd7',
  linen: 'faf0e6',
  lavenderblush: 'fff0f5',
  mistyrose: 'ffe4e1',
  gainsboro: 'dcdcdc',
  lightgrey: 'd3d3d3',
  silver: 'c0c0c0',
  darkgray: 'a9a9a9',
  gray: '808080',
  dimgray: '696969',
  lightslategray: '778899',
  slategray: '708090',
  darkslategray: '2f4f4f',
  black: '000000',
};

/* helpers */

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function decodeArgs() {
  /*
   * Decode random arguments. Expects an arguments array
   * from another function call as first argument and a
   * series of member names the arguments should be decoded
   * to. E.g. decodeArgs(arguments, "r", "g", "b")
   * Arguments array can consist of:
   * A single array: member names are mapped to the array
   * ([[50,100,150]],"r","g","b") => {"r":50,"g":100,"b":150}
   *
   * An object already containing the members: object is returned
   * ([{"r":50,"g":100,"b":150}, ...) => {"r":50,"g":100,"b":150}
   *
   * Multiple values: values are mapped to member names
   * ([50,100,150],"r","g","b") => {"r":50,"g":100,"b":150}
   */
  var out = {};
  if (arguments[0][0] instanceof Array) {
    for (let i = 0; i < arguments.length - 1; i++)
      out[arguments[i + 1]] = arguments[0][0][i];
  } else if (typeof arguments[0][0] === 'object') {
    out = arguments[0][0];
  } else {
    for (let i = 0; i < arguments.length - 1; i++)
      out[arguments[i + 1]] = arguments[0][i];
  }
  return out;
}

function decodeColor(args) {
  /* detects type of input and disassembles it to a useful object.
   * Only argument is an arguments array from another function.
   * (["lightcoral"]) => {"type":"string","hex":"#F08080","string":"lightcoral","r":240,"g":128,"b":128}
   * (["#F08080"]) => {"type":"hex","hex":"#F08080","r":240,"g":128,"b":128}
   * ([[0,0.31,0.28]] => {"type":"hsl","h":0,"s":0.31,"l":0.28}
   * ([240,128,128] => {"type":"rgb","r":240,"g":128,"b":128}
   * ([{"r":240,"g":128,"b":128}] => {"type":"rgb","r":240,"g":128,"b":128}
   */
  if (typeof args[0] === 'string' && args[0][0] === '#') {
    // HEX string
    let res = hexToRGB(args[0]);
    res.type = 'hex';
    res.hex = args[0];
    return res;
  }
  if (typeof args[0] === 'string' && color_names[args[0]]) {
    // color string
    let res = hexToRGB('#' + color_names[args[0]]);
    res.type = 'string';
    res.string = args[0];
    res.hex = color_names[args[0]];
    return res;
  }
  var S = decodeArgs(arguments, 'a', 'b', 'c');
  if ((S.a > 0 && S.a < 1) || (S.b > 0 && S.b < 1) || (S.c > 0 && S.c < 1)) {
    // HSL
    return { h: S.a, s: S.b, l: S.c, type: 'hsl' };
  }
  // RGB
  return { r: S.a, g: S.b, b: S.c, type: 'rgb' };
}

/* RGB */

/**
 * Returns a hex color string
 * from a RGB color.
 *
 * @function RGBToHex
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or object with members `r, g, b` or array of RGB or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function RGBToHex() {
  var col = decodeArgs(arguments, 'r', 'g', 'b');
  return (
    pad(parseInt(col.r).toString(16), 2) +
    pad(parseInt(col.g).toString(16), 2) +
    pad(parseInt(col.b).toString(16), 2)
  );
}

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l')
 * from a RGB color.
 *
 * @function RGBToHSL
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or object with members `r, g, b` or array of RGB or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {object} Object with members h, s and l as numbers (0..1)
 */
export function RGBToHSL() {
  var col = decodeArgs(arguments, 'r', 'g', 'b');
  var r = col.r,
    g = col.g,
    b = col.b;

  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }
  return {
    h: Math.min(1, Math.max(0, h)),
    s: Math.min(1, Math.max(0, s)),
    l: Math.min(1, Math.max(0, l)),
  };
}

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument
 * from a RGB color.
 *
 * @function RGBToBW
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or object with members `r, g, b` or array of RGB or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function RGBToBW() {
  return RGBToGray.apply(null, arguments) >= 0.5 ? '#000000' : '#ffffff';
}

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument
 * from a RGB color.
 *
 * @function RGBToWB
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or object with members `r, g, b` or array of RGB or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function RGBToWB() {
  return RGBToGray.apply(null, arguments) < 0.5 ? '#000000' : '#ffffff';
}

/**
 * Returns a hex color string of the grayscaled argument
 * from a RGB color.
 *
 * @function RGBToGray
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or object with members `r, g, b` or array of RGB or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function RGBToGray() {
  var col = decodeArgs(arguments, 'r', 'g', 'b');
  return (col.r * 0.2126 + col.g * 0.7152 + col.b * 0.0722) / 255;
}

/* HSL */

export function hueToRGB(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return Math.min(1, Math.max(0, p));
}

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b')
 * from a HSL color.
 *
 * @function HSLToRGB
 *
 * @param {number|array|object} 1st_value - hue (0..1) or object with members `h, s, l` or array of HSL.
 * @param {number} [2nd_value] - saturation (0..1)
 * @param {number} [3rd_value] - lightness (0..1)
 *
 * @returns {object} Object with members r, g and b as numbers (0..255)
 */
export function HSLToRGB() {
  var col = decodeArgs(arguments, 'h', 's', 'l');
  var h = col.h,
    s = col.s,
    l = col.l;

  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hueToRGB(p, q, h + 1 / 3);
    g = hueToRGB(p, q, h);
    b = hueToRGB(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Returns a hex color string
 * from a HSL color.
 *
 * @function HSLToHex
 *
 * @param {number|array|object} 1st_value - hue (0..1) or object with members `h, s, l` or array of HSL.
 * @param {number} [2nd_value] - saturation (0..1)
 * @param {number} [3rd_value] - lightness (0..1)
 *
 * @returns {string} Hex color string.
 */
export function HSLToHex() {
  return RGBToHex(HSLToRGB.apply(null, arguments));
}

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument
 * from a HSL color.
 *
 * @function HSLToBW
 *
 * @param {number|array|object} 1st_value - hue (0..1) or object with members `h, s, l` or array of HSL.
 * @param {number} [2nd_value] - saturation (0..1)
 * @param {number} [3rd_value] - lightness (0..1)
 *
 * @returns {string} Hex color string.
 */
export function HSLToBW() {
  return RGBToBW(HSLToRGB.apply(null, arguments));
}

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument
 * from a HSL color.
 *
 * @function HSLToWB
 *
 * @param {number|array|object} 1st_value - hue (0..1) or object with members `h, s, l` or array of HSL.
 * @param {number} [2nd_value] - saturation (0..1)
 * @param {number} [3rd_value] - lightness (0..1)
 *
 * @returns {string} Hex color string.
 */
export function HSLToWB() {
  return RGBToWB(HSLToRGB.apply(null, arguments));
}

/**
 * Returns a hex color string of the grayscaled argument
 * from a HSL color.
 *
 * @function HSLToGray
 *
 * @param {number|array|object} 1st_value - hue (0..1) or object with members `h, s, l` or array of HSL.
 * @param {number} [2nd_value] - saturation (0..1)
 * @param {number} [3rd_value] - lightness (0..1)
 *
 * @returns {string} Hex color string.
 */
export function HSLToGray() {
  return RGBToGray(HSLToRGB.apply(null, arguments));
}

/* HEX */

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b')
 * from a hex color string.
 *
 * @function hexToRGB
 *
 * @param {string} hex - Hex color string.
 *
 * @returns {object} Object with members r, g and b as numbers (0..255)
 */
export function hexToRGB(hex) {
  hex = hex || '000000';
  if (hex[0] == '#') hex = hex.substr(1);
  if (hex.length == 3)
    return {
      r: parseInt('0x' + hex[0] + hex[0]),
      g: parseInt('0x' + hex[1] + hex[1]),
      b: parseInt('0x' + hex[2] + hex[2]),
    };
  return {
    r: parseInt('0x' + hex.substr(0, 2)),
    g: parseInt('0x' + hex.substr(2, 2)),
    b: parseInt('0x' + hex.substr(4, 2)),
  };
}

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l')
 * from a hex color string.
 *
 * @function hexToHSL
 *
 * @param {string} hex - Hex color string.
 *
 * @returns {object} Object with members h, s and l as numbers (0..1)
 */
export function hexToHSL(hex) {
  return RGBToHSL(hexToRGB(hex));
}

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument
 * from a hex color string.
 *
 * @function hexToBW
 *
 * @param {string} hex - Hex color string.
 *
 * @returns {string} Hex color string.
 */
export function hexToBW(hex) {
  return RGBToBW(hexToRGB(hex));
}

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument
 * from a hex color string.
 *
 * @function hexToWB
 *
 * @param {string} hex - Hex color string.
 *
 * @returns {string} Hex color string.
 */
export function hexToWB(hex) {
  return RGBToWB(hexToRGB(hex));
}

/**
 * Returns a hex color string of the grayscaled argument
 * from a hex color string.
 *
 * @function hexToGray
 *
 * @param {string} hex - Hex color string.
 *
 * @returns {string} Hex color string.
 */
export function hexToGray(hex) {
  return RGBToGray(hexToRGB(hex));
}

/* STRING */

/**
 * Returns a hex color string
 * from a color name.
 *
 * @function nameToHex
 *
 * @param {string} color - Color name.
 *
 * @returns {string} Hex color string.
 */
export function nameToHex(name) {
  return color_names[name.toLowerCase];
}

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b')
 * from a color name.
 *
 * @function nameToRGB
 *
 * @param {string} color - Color name.
 *
 * @returns {object} Object with members r, g and b as numbers (0..255)
 */
export function nameToRGB(name) {
  return hexToRGB(color_names[name.toLowerCase]);
}

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l')
 * from a color name.
 *
 * @function nameToHSL
 *
 * @param {string} color - Color name.
 *
 * @returns {object} Object with members h, s and l as numbers (0..1)
 */
export function nameToHSL(name) {
  return hexToHSL(color_names[name.toLowerCase]);
}

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument
 * from a color name.
 *
 * @function nameToBW
 *
 * @param {string} color - Color name.
 *
 * @returns {string} Hex color string.
 */
export function nameToBW(name) {
  return hexToBW(color_names[name.toLowerCase]);
}

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument
 * from a color name.
 *
 * @function nameToWB
 *
 * @param {string} color - Color name.
 *
 * @returns {string} Hex color string.
 */
export function nameToWB(name) {
  return hexToWB(color_names[name.toLowerCase]);
}

/**
 * Returns a hex color string of the grayscaled argument
 * from a color name.
 *
 * @function nameToGray
 *
 * @param {string} color - Color name.
 *
 * @returns {string} Hex color string.
 */
export function nameToGray(name) {
  return hexToGray(color_names[name.toLowerCase]);
}

/* COLOR */

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b')
 * from any type of valid color.
 *
 * @function colorToRGB
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or hue (0..1) or object with members `r, g, b` or `h, s, l` or array of RGB or HSL or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {object} Object with members r, g and b as numbers (0..255)
 */
export function colorToRGB() {
  var C = decodeColor(arguments);
  switch (C.type) {
    case 'rgb':
      return C;
    case 'hex':
      return C;
    case 'hsl':
      return RGBToHSL(C);
    case 'string':
      return C;
  }
}

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l')
 * from any type of valid color.
 *
 * @function colorToHSL
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or hue (0..1) or object with members `r, g, b` or `h, s, l` or array of RGB or HSL or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {object} Object with members h, s and l as numbers (0..1)
 */
export function colorToHSL() {
  var C = decodeColor(arguments);
  switch (C.type) {
    case 'rgb':
      return RGBToHSL(C);
    case 'hex':
      return RGBToHSL(C);
    case 'hsl':
      return C;
    case 'string':
      return RGBToHSL(C);
  }
}

/**
 * Returns a hex color string
 * from any type of valid color.
 *
 * @function colorToHex
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or hue (0..1) or object with members `r, g, b` or `h, s, l` or array of RGB or HSL or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function colorToHex() {
  var C = decodeColor(arguments);
  switch (C.type) {
    case 'rgb':
      return RGBToHex(C);
    case 'hex':
      return C.hex;
    case 'hsl':
      return HSLToHex(C);
    case 'string':
      return RGBToHex(C);
  }
}

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument
 * from any type of valid color.
 *
 * @function colorToBW
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or hue (0..1) or object with members `r, g, b` or `h, s, l` or array of RGB or HSL or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function colorToBW() {
  var C = decodeColor(arguments);
  switch (C.type) {
    case 'rgb':
      return RGBToBW(C);
    case 'hex':
      return RGBToBW(C);
    case 'hsl':
      return HSLToBW(C);
    case 'string':
      return RGBToBW(C);
  }
}

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument
 * from any type of valid color.
 *
 * @function colorToWB
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or hue (0..1) or object with members `r, g, b` or `h, s, l` or array of RGB or HSL or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function colorToWB() {
  var C = decodeColor(arguments);
  switch (C.type) {
    case 'rgb':
      return RGBToWB(C);
    case 'hex':
      return RGBToWB(C);
    case 'hsl':
      return HSLToWB(C);
    case 'string':
      return RGBToWB(C);
  }
}

/**
 * Returns a hex color string of the grayscaled argument
 * from any type of valid color.
 *
 * @function colorToGray
 *
 * @param {number|array|object|string} 1st_value - red (0..255) or hue (0..1) or object with members `r, g, b` or `h, s, l` or array of RGB or HSL or color name or hex string.
 * @param {number} [2nd_value] - green (0..255) or saturation (0..1)
 * @param {number} [3rd_value] - blue (0..255) or lightnes (0..1)
 *
 * @returns {string} Hex color string.
 */
export function colorToGray() {
  var C = decodeColor(arguments);
  switch (C.type) {
    case 'rgb':
      return RGBToBW(C);
    case 'hex':
      return RGBToBW(C);
    case 'hsl':
      return HSLToBW(C);
    case 'string':
      return RGBToBW(C);
  }
}

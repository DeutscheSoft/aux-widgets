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
 * Module containing sprintf like formatting functions.
 *
 * @module utils/sprintf
 */

/**
 * Generates formatting functions from sprintf-style format strings.
 * This is generally faster when the same format string is used many times.
 *
 * @returns {function} A formatting function.
 * @param {string} fmt - The format string.
 * @function FORMAT
 * @example
 * var f = FORMAT("%.2f Hz");
 * @see sprintf
 */
export function FORMAT(fmt) {
  const args = [];
  let s = 'return ';
  let res;
  let last = 0;
  let argnum = 0;
  let precision;
  const regexp = /%(\.\d+)?([bcdefgosO%])/g;
  let argname;

  while ((res = regexp.exec(fmt))) {
    if (argnum) s += '+';
    s += JSON.stringify(
      fmt.substr(last, regexp.lastIndex - res[0].length - last)
    );
    s += '+';
    argname = 'a' + argnum;
    if (args.indexOf(argname) === -1) args.push(argname);
    if (argnum + 1 < arguments.length) {
      argname =
        '(' + sprintf(arguments[argnum + 1].replace('%', '%s'), argname) + ')';
    }
    switch (res[2].charCodeAt(0)) {
      case 100: // d
        s += '(' + argname + ' | 0)';
        break;
      case 102: // f
        if (res[1]) {
          // length qualifier
          precision = parseInt(res[1].substr(1));
          s += '(+' + argname + ').toFixed(' + precision + ')';
        } else {
          s += '(+' + argname + ')';
        }
        break;
      case 115: // s
        s += argname;
        break;
      case 37:
        s += '"%"';
        argnum--;
        break;
      case 79:
      case 111:
        s += 'JSON.stringify(' + argname + ')';
        break;
      default:
        throw new Error('unknown format:' + res[0]);
    }
    argnum++;
    last = regexp.lastIndex;
  }

  if (argnum) s += '+';
  s += JSON.stringify(fmt.substr(last));
  /* jshint -W054 */
  return new Function(args, s);
}

/**
 * Formats the arguments according to a given format string.
 * @returns {function} A formatting function.
 * @param {string} fmt - The format string.
 * @param {...*} args - The format arguments.
 * @function sprintf
 * @example
 * sprintf("%d Hz", 440);
 * @see FORMAT
 */
export function sprintf(fmt) {
  let i, last_fmt;
  let c,
    arg_num = 1;
  const ret = [];
  let precision, s;
  let has_precision = false;

  for (
    last_fmt = 0;
    -1 !== (i = fmt.indexOf('%', last_fmt));
    last_fmt = i + 1
  ) {
    if (last_fmt < i) {
      ret.push(fmt.substring(last_fmt, i));
    }

    i++;

    if ((has_precision = fmt.charCodeAt(i) === 46) /* '.' */) {
      i++;
      precision = parseInt(fmt.substr(i));
      while ((c = fmt.charCodeAt(i)) >= 48 && c <= 57) i++;
    }

    c = fmt.charCodeAt(i);

    if (c === 37) {
      ret.push('%');
      continue;
    }

    s = arguments[arg_num++];

    switch (fmt.charCodeAt(i)) {
      case 102 /* f */:
        s = +s;
        if (has_precision) {
          s = s.toFixed(precision);
        }
        break;
      case 100 /* d */:
        s = s | 0;
        break;
      case 115 /* s */:
        break;
      case 79: /* O */
      case 111 /* o */:
        s = JSON.stringify(s);
        break;
      default:
        throw new Error('Unsupported format.');
    }

    ret.push(s);

    last_fmt = i + 1;
  }

  if (last_fmt < fmt.length) {
    ret.push(fmt.substring(last_fmt, fmt.length));
  }

  return ret.join('');
}

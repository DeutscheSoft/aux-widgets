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

let ok;

export function assert(x, msg) {
  if (!x) throw new Error(msg || 'Assertion failed.');
  ok++;
}

export function assertError(cb) {
  try {
    cb();
    assert(false, 'Expected an error.');
  } catch (err) {
    ok++;
    // we expect this
  }
}

export function test(name, cb) {
  let err;

  try {
    ok = 0;
    cb();
  } catch (e) {
    err = e;
  }

  /* jshint -W117 */
  console.log(' - %s .. %s (%d checks)', name, err ? 'FAIL' : 'OK', ok);

  if (err) console.error(err);
  /* jshint +W117 */
}

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

function typecheck(v, typename) {
  if (typeof v !== typename) throw new TypeError('expected ' + typename + '.');
}

export function typecheckFunction(v) {
  typecheck(v, 'function');
}

export function typecheckNumber(v) {
  typecheck(v, 'number');
}

export function typecheckObject(v) {
  typecheck(v, 'object');
}

export function typecheckString(v) {
  typecheck(v, 'string');
}

export function typecheckInstance(v, cl) {
  if (typeof v !== 'object' || !(v instanceof cl))
    throw new TypeError('expected instance of ' + cl.name);
}

export function typecheckInteger(v) {
  if (!Number.isInteger(v)) throw new TypeError('expected Integer.');
}

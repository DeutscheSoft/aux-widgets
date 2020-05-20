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

import {
  add_class,
  remove_class,
  has_class,
  toggle_class,
} from '../src/index.js';

describe('CSSHelpers', () => {
  const div = document.createElement('DIV');

  it('add_class()', (done) => {
    add_class(div, 'foobar');
    if (div.classList.contains('foobar')) done();
    else done(new Error('class not found'));
    div.classList.remove('foobar');
  });
  it('remove_class()', (done) => {
    add_class(div, 'foobar');
    remove_class(div, 'foobar');
    if (!div.classList.contains('foobar')) done();
    else done(new Error('class found'));
  });
});

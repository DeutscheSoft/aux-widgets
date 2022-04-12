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

import { sprintf, FORMAT } from '../src/utils/sprintf.js';
import { assert } from './helpers.js';

describe('sprintf', () => {
  it('sprintf()', (done) => {
    assert(sprintf('%d', 234) === '234'); 
    assert(sprintf('%s', '234') === '234'); 
    assert(sprintf('%.1f', 1.45) === '1.5');
    done();
  });

  it('FORMAT()', (done) => {
    assert(FORMAT('%d')(234) === '234'); 
    assert(FORMAT('%s')('234') === '234'); 
    assert(FORMAT('%.1f')(1.45) === '1.5');
    done();
  });
});

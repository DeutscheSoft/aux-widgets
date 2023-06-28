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

import {
  addClass,
  removeClass,
  isDocumentFragment,
  setContent,
  isDomNode,
} from '../src/index.js';
import { assert } from './helpers.js';

describe('CSSHelpers', () => {
  const div = document.createElement('DIV');

  it('addClass()', (done) => {
    addClass(div, 'a', [ 'b' ], 'c  d');
    const c = div.classList;
    if (c.contains('a') && c.contains('b') && c.contains('c') && c.contains('d')) done();
    else done(new Error('class not found'));
    div.classList.remove('a', 'b', 'c', 'd');
  });
  it('removeClass()', (done) => {
    addClass(div, 'a', [ 'b' ], 'c  d');
    removeClass(div, 'a', [ 'b' ], 'c  d');
    const c = div.classList;
    if (!c.contains('a') && !c.contains('b') && !c.contains('c') && !c.contains('d')) done();
    else done(new Error('class found'));
  });
  it('isDocumentFragment()', (done) => {
    assert(isDocumentFragment(document.createDocumentFragment()));
    assert(!isDocumentFragment(0));
    assert(!isDocumentFragment(document.createElement('div')));
    done();
  });
  it('isDomNode()', (done) => {
    assert(isDomNode(document.createDocumentFragment()));
    assert(!isDomNode(0));
    assert(isDomNode(document.createElement('div')));
    done();
  });
  it('setContent()', (done) => {
    const div = document.createElement('div');

    setContent(div, 'foobar');
    assert(div.textContent === 'foobar');

    setContent(div, 'bar');
    assert(div.textContent === 'bar');

    const fragment1 = document.createDocumentFragment();
    fragment1.textContent = 'foo';
    setContent(div, fragment1);

    // fragment is unchanged
    assert(fragment1.textContent, 'foo');
    assert(div.textContent, 'foo');

    done();
  });
});

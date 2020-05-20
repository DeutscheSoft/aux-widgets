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

import { define_class, define_child_element } from './../../widget_helpers.js';
import {
  inner_width,
  inner_height,
  scrollbar_size,
  add_class,
  remove_class,
} from './../../utils/dom.js';

import { Widget } from './../../widgets/widget.js';

export const Canvas = define_class({
  Extends: Widget,
  _options: Object.assign(Object.create(Widget.prototype._options), {}),
  options: {},
  initialize: function (options) {
    Widget.prototype.initialize.call(this, options);
  },
});

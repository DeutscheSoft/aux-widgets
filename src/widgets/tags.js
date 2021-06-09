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

import { defineClass } from '../widget_helpers.js';
import { Widget } from './widget.js';
import { Tag } from './tag.js';

export const Tags = defineClass({
  Extends: Widget,

  _options: Object.assign(Object.create(Widget.prototype._options), {
    tag_class: 'object',
  }),
  options: {
    tag_class: Tag,
  },

  initialize: function (options) {
    this.tags = new Map();
    this.tag_to_name = new Map();
    Widget.prototype.initialize.call(this, options);
  },
  tagToString: function (tag) {
    if (typeof tag == 'string') {
      return tag;
    } else if (Object.prototype.isPrototypeOf.call(Tag.prototype, tag)) {
      if (!tag.isDestructed()) {
        return tag.options.tag;
      } else {
        return this.tag_to_name.get(tag);
      }
    } else {
      return tag.tag;
    }
  },
  findTag: function (tag) {
    return this.tags.get(this.tagToString(tag));
  },
  requestTag: function (tag, options) {
    var C = this.options.tag_class;
    var t = this.tagToString(tag);

    if (this.tags.has(t)) {
      tag = this.tags.get(t);
      if (!tag.isDestructed()) return tag;
    }

    if (typeof tag == 'string') {
      var o = Object.assign(options || {}, { tag: tag });
      tag = new C(o);
    } else if (Object.prototype.isPrototypeOf.call(C.prototype, tag)) {
      /* empty */
    } else {
      tag = new C(tag);
    }
    tag.show();
    this.tags.set(t, tag);
    this.tag_to_name.set(tag, t);
    return tag;
  },
  removeTag: function (tag) {
    tag = this.findTag(tag);
    this.tags.delete(this.tagToString(tag));
    this.tag_to_name.delete(tag);
  },
  empty: function () {
    this.tags = new Map();
    this.tag_to_name = new Map();
  },
});

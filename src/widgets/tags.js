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
import { define_class } from '../widget_helpers.js';
import { Widget } from './widget.js';
import { Tag } from './tag.js';

export const Tags = define_class({
    
    Extends: Widget,
    
    _options: Object.assign(Object.create(Widget.prototype._options), {
        tag_class: "object",
    }),
    options: {
        tag_class: Tag,
    },
    
    initialize: function (options) {
        this.tags = new Map();
        this.tag_to_name = new Map();
        Widget.prototype.initialize.call(this, options);
    },
    tag_to_string: function (tag) {
        if (typeof tag == "string") {
            return tag;
        } else if (Tag.prototype.isPrototypeOf(tag)) {
            if (!tag.is_destructed()) {
              return tag.options.tag;
            } else {
              return this.tag_to_name.get(tag);
            }
        } else {
            return tag.tag;
        }
    },
    find_tag: function (tag) {
        return this.tags.get(this.tag_to_string(tag));
    },
    request_tag: function (tag, options) {
        var C = this.options.tag_class;
        var t = this.tag_to_string(tag);

        if (this.tags.has(t)) {
          tag = this.tags.get(t);
          if (!tag.is_destructed()) return tag;
        }

        if (typeof tag == "string") {
            var o = Object.assign(options || {}, {tag:tag});
            tag = new C(o);
        } else if (C.prototype.isPrototypeOf(tag)) {
            tag = tag;
        } else {
            tag = new C(tag);
        }
        tag.show();
        this.tags.set(t, tag);
        this.tag_to_name.set(tag, t);
        return tag;
    },
    remove_tag: function (tag) {
        tag = this.find_tag(tag);
        this.tags.delete(this.tag_to_string(tag));
        this.tag_to_name.delete(tag);
    },
    empty: function() {
        this.tags = new Map();
        this.tag_to_name = new Map();
    },
});

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
import { Tag } from './tag.js';
import { Tags } from './tags.js';
import { Container } from './container.js';
import { Button } from './button.js';

function add(e) {
  this.emit('addtag', e);
}

function remove(e, tagnode) {
  this.emit('removetag', tagnode);
  if (!this.options.async) this.removeTag(tagnode.tag, tagnode);
}

export const Taggable = defineClass({
  _options: {
    tags: 'array',
    backend: 'object',
    add_label: 'string',
    show_add: 'boolean',
    async: 'boolean',
    tag_class: 'object',
    tag_options: 'object',
  },
  options: {
    tags: [],
    backend: false,
    add_label: '✚',
    show_add: true,
    async: false,
    tag_class: Tag,
    tag_options: {},
  },
  static_events: {
    destroy: function () {
      this.tags.destroy();
      this.add.destroy();
    },
  },
  initialize: function () {
    var O = this.options;
    this.taglist = [];
    if (!O.backend) O.backend = new Tags({});

    this.tags = new Container({
      class: 'aux-tags',
    });
    this.appendChild(this.tags);

    this.add = new Button({
      container: this.element,
      label: O.add_label,
      class: 'aux-add',
      onclick: add.bind(this),
    });
    this.appendChild(this.add);

    this.addTags(O.tags);
  },

  requestTag: function (tag, tag_class, tag_options) {
    return this.options.backend.requestTag(
      tag,
      tag_class || this.options.tag_class,
      tag_options || this.options.tag_options
    );
  },
  addTags: function (tags) {
    for (var i = 0; i < tags.length; i++) this.addTag(tags[i]);
  },
  addTag: function (tag, options) {
    var B = this.options.backend;
    tag = B.requestTag(tag, options);
    if (this.hasTag(tag)) return;

    var node = tag.createNode(options);
    this.tags.appendChild(node);

    node.on('remove', remove.bind(this));

    var t = { tag: tag, node: node };
    this.taglist.push(t);
    this.emit('tagadded', tag, node);
    return t;
  },
  hasTag: function (tag) {
    tag = this.requestTag(tag);
    for (var i = 0; i < this.taglist.length; i++) {
      if (this.taglist[i].tag === tag) return true;
    }
    return false;
  },
  removeTag: function (tag, node, purge) {
    var B = this.options.backend;
    tag = B.requestTag(tag);
    if (!this.hasTag(tag)) return;
    for (var i = 0; i < this.taglist.length; i++) {
      if (this.taglist[i].tag === tag) {
        this.taglist.splice(i, 1);
        break;
      }
    }

    if (!node) {
      var c = this.tags.children;
      if (c) {
        for (let j = 0; j < c.length; j++) {
          var tagnode = c[j];
          if (tagnode.tag === tag) {
            tag.removeNode(tagnode);
            this.removeChild(tagnode);
            break;
          }
        }
      }
    } else {
      tag.removeNode(node);
    }
    if (purge) B.removeTag(tag);
    this.emit('tagremoved', tag);
  },
  empty: function () {
    var T = this.taglist;
    while (T.length) this.removeTag(T[0].tag, T[0].node);
  },
  tagToString: function (tag) {
    return this.options.backend.tagToString.call(this, tag);
  },
  findTag: function (tag) {
    this.options.backend.findTag.call(this, tag);
  },
});

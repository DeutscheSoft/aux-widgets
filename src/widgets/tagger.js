/*
 * This file is part of Toolkit.
 *
 * Toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Toolkit is distributed in the hope that it will be useful,
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
import { Dialog } from './dialog.js';
import { Taggable } from './taggable.js';
import { add_class, element, remove_class } from '../utils/dom.js';

function keyup (e) {
    if (e.keyCode != 13) return;
    new_tag_from_input.call(this);
}
function addclicked (e) {
    new_tag_from_input.call(this);
}
function new_tag_from_input () {
    var val = this._input.value;
    if (!val) return;
    this._input.value = "";
    var t = false;
    if (!this.options.async)
        t = this.add_tag(val);
    this.fire_event("newtag", val, t);
    if (this.options.closenew)
        this.close();
}

export const Tagger = define_class({
    
    _class: "Tagger",
    Extends: Dialog,
    Implements: Taggable,
    
    _options: Object.assign(Object.create(Dialog.prototype._options), {
        closenew: "boolean",
        add: "boolean",
    }),
    options: {
        closenew: true,
        visible: false,
        add: true,
    },
    initialize: function (options) {
        Dialog.prototype.initialize.call(this, options);
        add_class(this.element, "aux-tagger");
        
        Taggable.prototype.initialize.call(this);
        this.append_child(this.tags);
        this.add_event("addtag", new_tag_from_input.bind(this));
        
        this.set("add", this.options.add);
    },
    destroy: function (options) {
        Taggable.prototype.destroy.call(this);
        Dialog.prototype.destroy.call(this);
    },
    redraw: function () {
        Dialog.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;
        if (I.add) {
            I.add = false;
            if (O.add) {
                if (!this._input) {
                    this._input = element("input", "aux-input");
                    this._input.addEventListener("keyup", keyup.bind(this), true);
                    this._input.type = "text";
                    this._input.placeholder = "New tag";
                    this.element.appendChild(this._input);
                }
                this.add.set("container", this.element);
                add_class(this.element, "aux-has-input");
            } else if (!O.add) {
                if (this._input) {
                    this.element.removeChild(this._input);
                    this._input = null;
                }
                this.add.set("container", false);
                remove_class(this.element, "aux-has-input");
            }
        }
    },
    add_tag: function (tag, options) {
        var t = Taggable.prototype.add_tag.call(this, tag, options);
        if (!t) return;
        t.node.label.add_event("click", (function (that, tag) {
            return function (e) {
                that.fire_event("tagclicked", tag.tag, tag.node);
            }
        })(this, t));
        if (this.options.visible)
          this.reposition();
        return t;
    },
    remove_tag: function (tag, node, purge) {
      Taggable.prototype.remove_tag.call(this, tag, node, purge);
      if (!this.taglist.length)
        this.close();
      if (this.options.visible)
          this.reposition();
    },
});

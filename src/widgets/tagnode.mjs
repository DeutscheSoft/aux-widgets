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
import { define_class } from '../widget_helpers.mjs';
import { ChildWidget } from '../child_widget.mjs';
import { Container } from './container.mjs';
import { Label } from './label.mjs';
import { Button } from './button.mjs';
import { ConfirmButton } from './confirmbutton.mjs';
import { Colors } from './colors.mjs';

export const TagNode = define_class({
  
  Extends: Container,
  Implements: Colors,
  
  _options: Object.assign(Object.create(Container.prototype._options), {
    label: "string",
    color: "string|null",
    confirm: "boolean",
  }),
  options: {
    label: "",
    color: null,
    confirm: false,
  },
  
  initialize: function (options, tag) {
    Container.prototype.initialize.call(this, options);
    this.tag = tag;
    this.add_class("toolkit-tag");
    
  },
  
  redraw: function () {
    Container.prototype.redraw.call(this);
    var I = this.invalid;
    var O = this.options;
    if (I.color) {
      I.color = false;
      this.element.style.backgroundColor = O.color;
      if (O.color)
        this.element.style.color = this.rgb2bw(this.hex2rgb(O.color));
      else
        this.element.style.color = null;
    }
  }
});

ChildWidget(TagNode, "label", {
    create: Label,
    show: true,
    map_options: {
        tag: "label",
    },
    toggle_class: true,
});
ChildWidget(TagNode, "colorize", {
    create: Button,
    show: false,
    toggle_class: true,
    static_events: {
      click: function (e) { this.parent.fire_event("colorize", e); }
    },
    default_options: {
        class: "toolkit-colorize"
    },
});
ChildWidget(TagNode, "remove", {
    create: ConfirmButton,
    show: true,
    toggle_class: true,
    static_events: {
      confirmed: function (e) { this.parent.fire_event("remove", e, this.parent); }
    },
    default_options: {
        class: "toolkit-remove",
        label : "",
        confirm: false,
    },
});

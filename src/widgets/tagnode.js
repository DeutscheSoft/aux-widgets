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
import { define_child_widget } from '../child_widget.js';
import { Container } from './container.js';
import { Label } from './label.js';
import { Button } from './button.js';
import { ConfirmButton } from './confirmbutton.js';
import { rgb2bw, hex2rgb } from '../utils/colors.js';

export const TagNode = define_class({
  
  Extends: Container,
  
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
    this.add_class("aux-tag");
    
  },

  draw: function(O, element)
  {
    add_class(element, "aux-tag");

    Container.prototype.draw.call(this, O, element);
  },
  
  redraw: function () {
    Container.prototype.redraw.call(this);
    var I = this.invalid;
    var O = this.options;
    if (I.color) {
      I.color = false;
      this.element.style.backgroundColor = O.color;
      if (O.color)
        this.element.style.color = rgb2bw(hex2rgb(O.color));
      else
        this.element.style.color = null;
    }
  }
});

define_child_widget(TagNode, "label", {
    create: Label,
    show: true,
    map_options: {
        tag: "label",
    },
    toggle_class: true,
});
define_child_widget(TagNode, "colorize", {
    create: Button,
    show: false,
    toggle_class: true,
    static_events: {
      click: function (e) { this.parent.emit("colorize", e); }
    },
    default_options: {
        class: "aux-colorize"
    },
});
define_child_widget(TagNode, "remove", {
    create: ConfirmButton,
    show: true,
    toggle_class: true,
    static_events: {
      confirmed: function (e) { this.parent.emit("remove", e, this.parent); }
    },
    default_options: {
        class: "aux-remove",
        label : "",
        confirm: false,
    },
});

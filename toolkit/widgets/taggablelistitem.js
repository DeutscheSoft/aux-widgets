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
"use strict";
(function (w, TK) {

TK.TaggableListItem = TK.class({
    
    _class: "TaggableListItem",
    Extends: TK.ListItem,
    Implements: TK.Taggable,
    
    initialize: function (options) {
        TK.ListItem.prototype.initialize.call(this, options);
        TK.Taggable.prototype.initialize.call(this);
        TK.add_class(this.element, "toolkit-taggable-list-item");
    },
    destroy: function () {
        TK.Taggable.prototype.destroy.call(this);
        TK.ListItem.prototype.destroys.call(this, options);
    }
});
    
})(this, this.TK);

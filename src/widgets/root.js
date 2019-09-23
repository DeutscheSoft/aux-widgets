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
import { Container } from './container.js';
import { add_class } from '../utils/dom.js';

function visibility_change() {
    if (document.hidden) {
        this.disable_draw();
    } else {
        this.enable_draw();
    }
}
function resized() {
    if (!this.resize_event) {
        this.resize_event = true;
        this.trigger_resize();
    }
}
/**
 * @extends Container
 * 
 * @class Root
 */
export const Root = define_class({
    Extends: Container,
    _class: "Root",
    _options: Object.create(Container.prototype._options),
    static_events: {
        initialized: function () {
            window.addEventListener("resize", this._resize_cb);
            document.addEventListener("visibilitychange", this._visibility_cb, false);
            this.enable_draw();
        },
        destroy: function() {
            window.removeEventListener("resize", this._resize_cb);
            document.removeEventListener("visibilitychange", this._visibility_cb)
            this._resize_cb = this._visibility_cb = null;
        },
        redraw: function() {
            if (this.resize_event)
                this.resize_event = false;
        },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Root#element - The main DIV container.
         *   Has class <code.aux-root</code>.
         */
        add_class(this.element, "aux-root");
        this._resize_cb = resized.bind(this);
        this._visibility_cb = visibility_change.bind(this);
        this.resize_event = false;
    },
});

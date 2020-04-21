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

/* jshint -W086 */

import { define_class } from './../widget_helpers.js';
import { Widget } from './widget.js';
import { S } from '../dom_scheduler.js';
import { element, add_class, remove_class, get_duration, empty, is_dom_node } from '../utils/dom.js';
import { warn } from '../utils/log.js';

function after_hiding() {
    this.__hide_id = false;
    if (this.options.visible !== "hiding") return;
    remove_class(this.element, 'aux-hiding');
    this.set("visible", false);
}
function after_showing() {
    this.__hide_id = false;
    if (this.options.visible === "showing")
    remove_class(this.element, 'aux-showing');
    this.set("visible", true);
}
export const Container = define_class({
    /**
     * Container represents a <code>&lt;DIV></code> element contining various
     *   other widgets or DOMNodes.
     *
     * Containers have four different display states: <code>show</code>, <code>hide</code>,
     * <code>showing</code> and <code>hiding</code>. Each of these states has a corresponding
     * CSS class called <code>.aux-show</code>, <code>.aux-hide</code>, <code>.aux-showing</code>
     * and <code>.aux-hiding</code>, respectively. The display state can be controlled using
     * the methods {@link Container#show}, {@link Container#hide} and {@link Widget#toggle_hidden}.
     *
     * A container can keep track of the display states of its child widgets.
     * The display state of a child can be changed using {@link Container#hide_child},
     * {@link Container#show_child} and {@link Container#toggle_child}.
     *
     * @class Container
     * 
     * @extends Widget
     *
     * @param {Object} [options={ }] - An object containing initial options.
     * @param {Array<TK.Widget>} [options.children=[]] - Add child widgets on init. Will not be maintained on runtime! Just for convenience purposes on init.
     * 
     * @property {String|HTMLElement} [options.content] - The content of the container. It can either be
     *   a string which is interpreted as HTML or a DOM node. Note that this option will remove all
     *   child nodes from the container element including those added via append_child.
     * @property {Number} [options.hiding_duration] - The duration in ms of the hiding CSS
     *   transition/animation of this container. If this option is not set, the transition duration
     *   will be determined by the computed style, which can be rather
     *   expensive. Setting this option explicitly can therefore be an optimization.
     * @property {Number} [options.showing_duration] - The duration in ms of the showing CSS
     *   transition/animation of this container.
     */
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        content: "string|DOMNode",
        visible: "string|boolean",
        hiding_duration: "number",
        showing_duration: "number",
        children: "array",
    }),
    options: {
        children: [],
    },
    static_events: {
        set_visible: function(val)
        {
          if (val === 'showing')
          {
            if (!this.is_drawn())
              this.enable_draw();
          }
        },
    },
    initialize: function (options) {
        if (!options.element) options.element = element('div');
        Widget.prototype.initialize.call(this, options);
        this.hidden_children = [];
        /** 
         * @member {HTMLDivElement} Container#element - The main DIV element. Has class <code>.aux-container</code> 
         */

        this.__after_hiding = after_hiding.bind(this);
        this.__after_showing = after_showing.bind(this);
        this.__hide_id = false;
        
        if (this.options.children)
            this.append_children(this.options.children);
    },
    
    set_parent : function(parent, no_remove_child) {
        if (parent && !(parent instanceof Container)) {
            warn("Container %o should not be child of non-container %o", this, parent);
        }
        Widget.prototype.set_parent.call(this, parent, no_remove_child);
    },
    add_child : function(child) {
        var H = this.hidden_children;
        if (!H) this.hidden_children = H = [];
        H.push(false);
        Widget.prototype.add_child.call(this, child);
    },
    remove_child : function(child) {
        var C = this.children;
        var i;

        // if this child is not found, Widget.remove_child will generate an
        // error for us
        if (C !== null && (i = C.indexOf(child)) !== -1) {
          this.hidden_children.splice(i, 1);
        }

        Widget.prototype.remove_child.call(this, child);
    },
    enable_draw_children: function () {
        var C = this.children;
        var H = this.hidden_children;
        if (C) for (var i = 0; i < C.length; i++) if (!H[i]) C[i].enable_draw();
    },
    disable_draw_children: function () {
        var C = this.children;
        var H = this.hidden_children;
        if (C) for (var i = 0; i < C.length; i++) if (!H[i]) C[i].disable_draw();
    },
    /** 
     * Starts the transition of the <code>visible</code> to <code>false</code>.
     *
     * @method Container#hide
     *
     */
    hide: function () {
        if (!this.hidden())
          this.update("visible", 'hiding');
    },
    force_hide: function () {
        const E = this.element;
        this.set('visible', false);
        add_class(E, "aux-hide");
        remove_class(E, "aux-show", "aux-hiding", "aux-showing");
    },
    /** 
     * Starts the transition of the <code>visible</code> to <code>true</code>.
     *
     * @method Container#show
     *
     */
    show: function() {
        if (!this.is_drawn()) this.enable_draw();
        if (this.hidden()) this.update('visible', 'showing');
    },
    force_show: function() {
        const E = this.element;
        this.set('visible', true);
        add_class(E, "aux-show");
        remove_class(E, "aux-hide", "aux-hiding", "aux-showing");
    },
    show_nodraw_children: function() {
        var C = this.children;
        var H = this.hidden_children;
        if (C) for (let i = 0; i < C.length; i++) if (!H[i]) C[i].show_nodraw();
    },
    hide_nodraw_children: function() {
        var C = this.children;
        var H = this.hidden_children;
        if (C) for (let i = 0; i < C.length; i++) if (!H[i]) C[i].hide_nodraw();
    },
    /**
     * Switches the hidden state of a child to <code>hidden</code>.
     * The argument is either the child index or the child itself.
     *
     * @method Container#hide_child
     * @param {Object|integer} child - Child or its index.
     *
     */
    hide_child: function(i) {
        var C = this.children;
        var H = this.hidden_children;

        if (typeof i !== "number")
        {
            i = C.indexOf(i);
        }

        const child = C[i];

        if (!child)
          throw new Error("Cannot find child.");

        H[i] = true;

        if (this.is_drawn())
        {
          child.hide();
        }
        else
        {
          child.force_hide();
        }
    },

    /**
     * Switches the hidden state of a child to <code>shown</code>.
     * The argument is either the child index or the child itself.
     *
     * @method Container#show_child
     * @param {Object|integer} child - Child or its index.
     *
     */
    show_child: function(i) {
        var C = this.children;
        var H = this.hidden_children;

        if (typeof i !== "number") {
            i = C.indexOf(i);
        }

        const child = C[i];

        if (!child)
          throw new Error("Cannot find child.");

        if (H[i]) {
            H[i] = false;
            if (this.is_drawn()) C[i].show();
            else C[i].force_show();
        }
    },

    /**
     * Toggles the hidden state of a child.
     * The argument is either the child index or the child itself.
     *
     * @method Container#toggle_child
     * @param {Object|integer} child - Child or its index.
     *
     */
    toggle_child: function(i) {
        var C = this.children;
        var H = this.hidden_children;

        if (typeof i !== "number") {
            i = C.indexOf(i);
            if (i === -1) throw new Error("Cannot find child.");
        }
        if (H[i]) this.show_child(i);
        else this.hide_child(i);
    },

    visible_children: function(a) {
        if (!a) a = [];
        var C = this.children;
        var H = this.hidden_children;
        if (C) for (var i = 0; i < C.length; i++) {
            if (H[i]) continue;
            a.push(C[i]);
            C[i].visible_children(a);
        }
        return a;
    },

    hidden: function() {
        var state = this.options.visible;
        return Widget.prototype.hidden.call(this) || state === "hiding";
    },

    draw: function(O, element)
    {
      add_class(element, "aux-container");
      add_class(element, "aux-show");

      Widget.prototype.draw.call(this, O, element);
    },

    redraw: function() {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;

        if (I.visible) {
            var time;
            remove_class(E, 'aux-hiding', 'aux-showing', 'aux-hide', 'aux-show');

            if (this.__hide_id !== false) {
                window.clearTimeout(this.__hide_id);
                this.__hide_id = false;
            }

            switch (O.visible) {
            case 'hiding':
                add_class(E, 'aux-hiding');
                time = O.hiding_duration || get_duration(E);
                if (time > 0)
                {
                  this.__hide_id = window.setTimeout(this.__after_hiding, time);
                }
                else
                {
                  remove_class(E, 'aux-hiding');
                  this.set('visible', false);
                }
                break;
            case 'showing':
                add_class(E, 'aux-showing');
                time = O.showing_duration || get_duration(E);
                if (time > 0)
                {
                  this.__hide_id = window.setTimeout(this.__after_showing, time);
                }
                else
                {
                  remove_class(E, 'aux-showing');
                  this.set('visible', true);
                }
                break;
            }
        }

        Widget.prototype.redraw.call(this);

        if (I.content) {
            I.content = false;
            const content = O.content;
            empty(E);
            if (typeof content === "string")
            {
              E.innerHTML = content;
            }
            else if (is_dom_node(content))
            {
              E.appendChild(content);
            }
            else if (content !== void(0))
            {
              warn('Unsupported content option: %o', content);
            }
        }
    },
});

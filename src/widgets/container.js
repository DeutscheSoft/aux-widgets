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
import { element, add_class, remove_class, get_duration, empty } from '../utils/dom.js';
import { warn } from '../utils/log.js';

function after_hiding() {
    this.__hide_id = false;
    if (this.options.display_state === "hiding")
        this.set("display_state", "hide");
}
function after_showing() {
    this.__hide_id = false;
    if (this.options.display_state === "showing")
        this.set("display_state", "show");
}
function enable_draw_self() {
    if (this._drawn) return;
    this._drawn = true;
    if (this.needs_redraw) {
        S.add(this._redraw, 1);
    }
    /**
     * Is fired when the container is shown.
     * 
     * @event Container#show
     */
    this.emit("show");
}
function enable_draw_children() {
    var C = this.children;
    var H = this.hidden_children;
    if (C) for (var i = 0; i < C.length; i++) if (!H[i]) C[i].enable_draw();
}
function disable_draw_self() {
    if (!this._drawn) return;
    this._drawn = false;
    if (this.needs_redraw) {
        S.remove(this._redraw, 1);
        S.remove_next(this._redraw, 1);
    }
    /**
     * Is fired when the container is hidden.
     * 
     * @event Container#hide
     */
    this.emit("hide");
}
function disable_draw_children() {
    var C = this.children;
    var H = this.hidden_children;
    if (C) for (var i = 0; i < C.length; i++) if (!H[i]) C[i].disable_draw();
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
     * @property {String} [options.display_state="show"] - The current display state of this container.
     *   Do not modify, manually.
     * @property {Array<TK.Widget>} [options.children=[]] - Add child widgets on init. Will not be maintained on runtime! Just for convenience purposes on init.
     */
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        content: "string|DOMNode",
        display_state: "string",
        hiding_duration: "number",
        showing_duration: "number",
        children: "array",
    }),
    options: {
        display_state: "show",
        children: [],
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
    
    /**
     * Calls {@link Container#append_child} for an array of widgets.
     * 
     * @method Container#append_children
     *
     * @param {Array.<Widget>} children - The child widgets to append.
     */
    append_children : function (a) {
        a.map(this.append_child, this);
    },
    /**
     * Appends <code>child.element</code> to the container element and
     * registers <code>child</code> as a child widget.
     * 
     * @method Container#append_child
     *
     * @param {Widget} child - The child widget to append.
     */
    append_child : function(child) {
        this.element.appendChild(child.element);
        this.add_child(child);
    },
    set_parent : function(parent) {
        if (parent && !(parent instanceof Container)) {
            warn("Container %o should not be child of non-container %o", this, parent);
        }
        Widget.prototype.set_parent.call(this, parent);
    },
    add_child : function(child) {
        Widget.prototype.add_child.call(this, child);
        var H = this.hidden_children;
        if (!H) this.hidden_children = H = [];
        H.push(false);
    },
    remove_child : function(child) {
        if (!child) return;
        child.disable_draw();
        child.parent = null;
        var C = this.children;
        if (C === null) return;
        var H = this.hidden_children;
        var i = C.indexOf(child);
        if (i !== -1) {
            C.splice(i, 1);
            H.splice(i, 1);
        }
    },
    enable_draw: function () {
        if (this._drawn) return;
        enable_draw_self.call(this);
        enable_draw_children.call(this);
    },
    disable_draw: function () {
        if (!this._drawn) return;
        disable_draw_self.call(this);
        disable_draw_children.call(this);
    },
    /** 
     * Starts the transition of the <code>display_state</code> to <code>hide</code>.
     *
     * @method Container#hide
     *
     */
    hide: function () {
        var O = this.options;
        disable_draw_children.call(this);
        if (O.display_state === "hide") return;
        enable_draw_self.call(this);
        this.update("display_state", "hiding");
    },
    /** 
     * Immediately switches the display state of this container to <code>hide</code>.
     * Unlike {@link Container#hide} this method does not perform the hiding transition
     * and immediately modifies the DOM by setting the <code>.aux-hide</code> class.
     *
     * @method Container#force_hide
     *
     */
    force_hide: function () {
        var O = this.options;
        if (O.display_state === "hide" && !this.is_drawn()) return;
        this.disable_draw();
        var E = this.element;
        O.display_state = "hide";
        add_class(E, "aux-hide");
        remove_class(E, "aux-hiding", "aux-showing", "aux-show");
        this.update('visible', false);
    },
    /** 
     * Starts the transition of the <code>display_state</code> to <code>show</code>.
     *
     * @method Container#show
     *
     */
    show: function() {
        var O = this.options;
        enable_draw_self.call(this);
        this.update("display_state", "showing");
        this.update('visible', true);
    },
    /** 
     * Immediately switches the display state of this container to <code>show</code>.
     * Unlike {@link Container#hide} this method does not perform the hiding transition
     * and immediately modifies the DOM by setting the <code>.aux-show</code> class.
     *
     * @method Container#force_show
     *
     */
    force_show: function() {
        var O = this.options;
        if (O.display_state === "show" && this.is_drawn()) return;
        this.enable_draw();
        var E = this.element;
        O.display_state = "show";
        this.update('visible', true);
        add_class(E, "aux-show");
        remove_class(E, "aux-hiding", "aux-showing", "aux-hide");
    },
    show_nodraw: function() {
        var O = this.options;
        if (O.display_state === "show") return;
        this.set("display_state", "show");
        this.update('visible', true);

        var C = this.children;
        var H = this.hidden_children;
        if (C) for (let i = 0; i < C.length; i++) if (!H[i]) C[i].show_nodraw();
    },
    hide_nodraw: function() {
        var O = this.options;
        if (O.display_state === "hide") return;
        this.set("display_state", "hide");
        this.update('visible', false);

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

        if (typeof i !== "number") {
            i = C.indexOf(i);
            if (i === -1) throw new Error("Cannot find child.");
        }

        H[i] = true;
        C[i].hide();
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
            if (i === -1) throw new Error("Cannot find child.");
        }

        if (H[i]) {
            H[i] = false;
            if (this.is_drawn()) C[i].show();
            else C[i].show_nodraw();
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
        var state = this.options.display_state;
        return Widget.prototype.hidden.call(this) || state === "hiding" || state === "hide";
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

        if (I.display_state) {
            I.display_state = false;
            var time;
            remove_class(E, "aux-hiding", "aux-hide", "aux-showing", "aux-show");

            if (this.__hide_id) {
                window.clearTimeout(this.__hide_id);
                this.__hide_id = false;
            }

            switch (O.display_state) {
            case "hiding":
                add_class(E, "aux-hiding");
                time = O.hiding_duration || get_duration(E);
                if (time > 0) {
                    this.__hide_id = window.setTimeout(this.__after_hiding, time);
                    break;
                }
                this.set("display_state", "hide");
                remove_class(E, "aux-hiding");
                /* FALL THROUGH */
            case "hide":
                add_class(E, "aux-hide");
                disable_draw_self.call(this);
                this.update('visible', false);
                break;
            case "showing":
                add_class(E, "aux-showing");
                time = O.showing_duration || get_duration(E);
                if (time > 0) {
                    this.__hide_id = window.setTimeout(this.__after_showing, time);
                    enable_draw_children.call(this);
                    break;
                }
                this.set("display_state", "show");
                remove_class(E, "aux-showing");
                /* FALL THROUGH */
            case "show":
                add_class(E, "aux-show");
                enable_draw_children.call(this);
                break;
            }

            // also mark visible as 'done' to prevent the Widget redraw method
            // from replacing our css classes
            I.visible = false;
        }

        Widget.prototype.redraw.call(this);

        if (I.content) {
            I.content = false;
            empty(E);
            if (typeof O.content === "string") E.innerHTML = O.content;
            else E.appendChild(O.content);
        }
    },
});

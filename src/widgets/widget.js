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
import { S } from '../dom_scheduler.js';
import { toggle_class, set_styles, add_class, remove_class, has_class, set_style, get_style } from './../utils/dom.js';
import { warn, error } from './../utils/log.js';
import { define_class } from './../widget_helpers.js';
import { Base } from './../implements/base.js';

function Invalid(options) {
    for (var key in options) this[key] = true;
}
Invalid.prototype = {
    validate : function() {
        var i = 0, key;
        var ret = false;
        for (i = 0; i < arguments.length; i++) {
            key = arguments[i];
            if (this.hasOwnProperty(key) && this[key]) {
                this[key] = false;
                ret = true;
            }
        }

        return ret;
    },
    test : function() {
        var i = 0, key;
        for (i = 0; i < arguments.length; i++) {
            key = arguments[i];
            if (this.hasOwnProperty(key) && this[key]) {
                return true;
            }
        }
    }
};
function redraw(fun) {
    if (!this._drawn) return;

    if (this.needs_draw)
    {
      this.needs_draw = false;
      this.draw(this.options, this.element);
    }

    this.needs_redraw = false;
    /**
     * Is fired when a redraw is executed.
     * 
     * @event Widget#redraw
     */
    this.emit("redraw");
    fun.call(this);
}
function resize() {
    if (this.is_destructed()) return;
    this.resize();
}
function onvisibilitychange() {
  if (document.hidden)
  {
    this.disable_draw();
  }
  else
  {
    this.enable_draw();
  }
}
function onresize() {
  this.trigger_resize();
}
function dblclick (e) {
    /**
     * Is fired after a double click appeared. Set `dblclick` to 0 to
     * disable click event handling.
     * 
     * @event Widget#doubleclick
     * 
     * @param {string} event - The browsers `MouseEvent`.
     * 
     */
    var O = this.options;
    var dbc = O.dblclick;
    if (!dbc) return;
    var d = + new Date();
    if (this.__lastclick + dbc > d) {
        e.lastclick = this.__lastclick;
        this.emit("doubleclick", e);
        this.__lastclick = 0;
    } else {
        this.__lastclick = d;
    }
}

function set_preset (preset) {
    let O = this.options;
    let _O = this.options;
    let key, val;
    if (this._last_preset) {
        this.remove_class("aux-preset-" + this._last_preset);
    }
    this.add_class("aux-preset-" + preset);
    this._last_preset = preset;
    
    let preset_options = O.presets[preset] || {};
    this._presetting = true;
    for (key in preset_options) {
        if (!this._preset_origins.hasOwnProperty(key))
            this._preset_origins[key] = O[key];
        if (preset_options.hasOwnProperty(key))
            val = preset_options[key];
        else
            val = this._preset_origins[key];
        this.set(key, val);
    }
    this._presetting = false;
}

export const Widget = define_class({
    /**
     * Widget is the base class for all widgets drawing DOM elements. It
     * provides basic functionality like delegating events, setting options and
     * firing some events.
     *
     * @class Widget
     * 
     * @extends Base
     *
     * @property {HTMLElement} Widget#element - The main element.
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {String} [options.class=""] - A class to add to the class attribute of the main element.
     * @property {HTMLElement} [options.container] - A container the main element shall be added to.
     * @property {String} [options.id=""] - A string to be set as id attribute on the main element.
     * @property {String} [options.title=""] - A string to be set as title attribute on the main element to be displayed as tooltip.
     * @property {Object} [options.styles=""] - An object containing CSS declarations to be added directly to the main element.
     * @property {Boolean} [options.disabled=false] - Toggles the class <code>.aux-disabled</code>. By default it disables all pointer events on the widget via CSS to make it unusable to the user.
     * @property {HTMLElement} [options.element] - An element to be used as the main element.
     * @property {Boolean} [options.active] - Toggles the class <code>.aux-inactive</code>.
     * @property {Boolean} [options.visible] - Toggles the class <code>.aux-hide</code> and <code>.aux-show</code>. This option also enables and disabled rendering by
     *  calling Widget#hide and Widget#show.
     * @property {Boolean} [options.needs_resize=true] - Set to true if the resize function shall be called before the next redraw.
     * @property {Boolean} [options.dblclick=400] - Set a time in milliseconds for triggering double click event. If 0, no double click events are fired.
     * @property {String} [options.preset] - Set a preset. This string
     *   gets set as class attribute `aux-preset-[preset]`. If `options.presets` has a member
     *   of this name, all options of its option object are set on the Widget. Non-existent
     *   options are reset to the default. Defaults are updated on initialization and runtime.
     * @property {Object} [options.presets={}] - An object with available preset
     *   specific options. Refer to `options.preset` for more information.
     */
    /**
     * The <code>set</code> event is emitted when an option was set using the {@link Widget#set}
     * method. The arguments are the option name and its new value.
     *
     * Note that this happens both for user interaction and programmatical option changes.
     *
     * @event Widget#set
     */
    /**
     * The <code>redraw</code> event is emitted when a widget is redrawn. This can be used
     * to do additional DOM modifications to a Widget.
     *
     * @event Widget#redraw
     */
    /**
     * The <code>resize</code> event is emitted whenever a widget is being resized. This event can
     * be used to e.g. measure its new size. Note that some widgets do internal adjustments after
     * the <code>resize</code> event. If that is relevant, the {@link Widget#resized} event can
     * be used instead.
     *
     * @event Widget#resize
     */
    /**
     * The <code>resized</code> event is emitted after each rendering frame, which was triggered by
     * a resize event.
     *
     * @event Widget#resized
     */
    /**
     * The <code>hide</code> event is emitted when a widget is hidden and is not rendered anymore.
     * This happens both with browser visibility changes and also internally when using layout widgets
     * such as {@link Pager}.
     *
     * @event Widget#hide
     */
    /**
     * The <code>show</code> event is emitted when a widget is shown and is being rendered. This is the
     * counterpart to {@link Widget#hide}.
     *
     * @event Widget#show
     */
    Extends : Base,
    _options: {
        // A CSS class to add to the main element
        class: "string",
        // A DOM element as container to inject the element
        // into
        container: "object",
        // a id to set on the element. If omitted a random
        // string is generated.
        id: "string",
        styles: "object",
        disabled: "boolean",
        element: "object",
        active: "boolean",
        visible: "boolean",
        needs_resize: "boolean",
        dblclick: "number",
        interacting: "boolean",
        presets: "object",
        preset: "string",
        title: "string",
    },
    options: {
        // these options are of less use and only here to show what we need
        disabled:  false,  // Widgets can be disabled by setting this to true
        visible: true,
        needs_resize: true,
        dblclick: 0,
        interacting: false,
        presets: {},
    },
    static_events: {
        set_container: function() {
            throw new Error('container is not a dynamic option.');
        },
        set_styles: function() {
            throw new Error('styles is not a dynamic option.');
        },
        set_class: function() {
            throw new Error('class is not a dynamic option.');
        },
        set_dblclick: function (val) {
            const event_target = this.getEventTarget();
            if (!event_target) return;
            if (!!val)
                event_target.addEventListener("click", this.__dblclick_cb);
            else
                event_target.removeEventListener("click", this.__dblclick_cb);
        },
        initialized: function () {
            var v = this.options.dblclick;
            if (v > 0)
              this.set("dblclick", v);
        },
        set_preset: function (v) { set_preset.call(this, v); },
        set: function (key, val) {
            if (!this._presetting && this._preset_origins.hasOwnProperty(key)) {
                this._preset_origins[key] = val;
            }
        },
        set_visible: function(val)
        {
          if (val === true)
          {
            if (!this.is_drawn())
              this.enable_draw();
          }
        }
    },
    constructor: function (options) {
      if (!options) options = {};
      Base.call(this, options);
    },
    initialize: function (options) {
      Base.prototype.initialize.call(this, options);
      // Main actions every widget needs to take
      var E = options.element || null;
      if (E !== null && !E.isAuxWidget)
      {
        E.auxWidget = this;
        E.isAuxWidget = true;
      }
      this.element = E;
      this.invalid = new Invalid(this.options);
      if (!this.value_time) this.value_time = null;
      this.needs_redraw = false;
      this.needs_draw = true;
      this._drawn = false;
      this._redraw = redraw.bind(this, this.redraw);
      this.__resize = resize.bind(this);
      this._schedule_resize = this.schedule_resize.bind(this);
      this.parent = void(0);
      this.children = null;
      this.draw_queue = null;
      this.__lastclick = 0;
      this.__dblclick_cb = dblclick.bind(this);
      this._onresize = onresize.bind(this);
      this._onvisibilitychange = onvisibilitychange.bind(this);
      this._interaction_count = 0;
      this._preset_origins = {};
      this._last_preset;
      this._presetting = false;
    },

    getStyleTarget: function() {
      return this.element;
    },

    getClassTarget: function() {
      return this.element;
    },

    getEventTarget: function() {
      return this.element;
    },

    is_destructed: function() {
        return this.options === null;
    },

    startInteracting: function() {
      if (!this._interaction_count++)
      {
        this.set('interacting', true);
      }
    },
    stopInteracting: function() {
      if (!--this._interaction_count)
      {
        this.set('interacting', false);
      }
    },

    invalidate_all: function() {
        for (var key in this.options) {
            if (!this._options[key]) {
                if (key.charCodeAt(0) !== 95)
                    warn("%O %s: unknown option %s", this, this._class, key);
            } else this.invalid[key] = true;
        }
    },

    assert_none_invalid: function() {
        var warn = [];
        for (var key in this.invalid) {
            if (this.invalid[key] === true) {
                warn.push(key);
            }
        }

        if (warn.length) {
            warn("found", warn.length, "invalid in", this, ":", warn);
        }
    },

    trigger_resize: function() {
        if (!this.options.needs_resize) {
            if (this.is_destructed()) {
                // This object was destroyed but trigger resize was still scheduled for the next frame.
                // FIXME: fix this whole problem properly
                return;
            }

            this.set("needs_resize", true);

            var C = this.children;

            if (!C) return;

            for (var i = 0; i < C.length; i++) {
                C[i].trigger_resize();
            }
        }
    },

    trigger_resize_children: function() {
        var C = this.children;

        if (!C) return;

        for (var i = 0; i < C.length; i++) {
            C[i].trigger_resize();
        }
    },

    schedule_resize: function() {
        if (this.__resize === null) return;
        S.add(this.__resize, 0);
    },

    resize: function() {
        /**
         * Is fired when a resize is requested.
         * 
         * @event Widget#resize
         */
        this.emit("resize");

        if (this._options.resized)
            this.set("resized", true);
        
        /**
         * Is fired after the resize was executed and the DOM is updated.
         * 
         * @event Widget#resized
         */
        if (this.has_event_listeners("resized")) {
            S.after_frame(this.emit.bind(this, "resized"));
        }
    },

    trigger_draw: function() {
        if (!this.needs_redraw) {
            this.needs_redraw = true;
            if (this._drawn) S.add(this._redraw, 1);
        }
    },

    trigger_draw_next : function() {
        if (!this.needs_redraw) {
            this.needs_redraw = true;
            if (this._drawn) S.add_next(this._redraw, 1);
        }
    },

    initialized: function () {
        // Main actions every widget needs to take
        /**
         * Is fired when a widget is initialized.
         * 
         * @event Widget#initialized
         */
        Base.prototype.initialized.call(this);
        this.trigger_draw();
    },
    draw_once: function(fun) {
        var q = this.draw_queue;

        if (q === null) {
            this.draw_queue = [ fun ];
        } else {
            for (var i = 0; i < q.length; i++) if (q[i] === fun) return;
            q[i] = fun;
        }
        this.trigger_draw();
    },
    draw: function (O, element) {
      let E;

      if (O.container)
        O.container.appendChild(element);

      add_class(element, "aux-widget");

      if (O.id)
        element.setAttribute("id", O.id);

      if (O.class && (E = this.getClassTarget()))
      {
        const tmp = O.class.split(" ");
        for (let i = 0; i < tmp.length; i++)
          add_class(E, tmp[i]);
      }

      if (O.styles && (E = this.getStyleTarget()))
      {
        set_styles(E, O.styles);
      }

      this.schedule_resize();
    },
    redraw: function () {
        var I = this.invalid;
        var O = this.options;
        var E = this.element;

        if (I.visible)
        {
          I.visible = false;

          const visible = O.visible;

          if (visible === true)
          {
            remove_class(E, "aux-hide");
            add_class(E, "aux-show");
          }
          else if (visible === false)
          {
            remove_class(E, "aux-show");
            add_class(E, "aux-hide");
            this.disable_draw();
            return;
          }
        }

        E = this.getStyleTarget();

        if (E) {
            if (I.active) {
                I.active = false;
                toggle_class(E, "aux-inactive", !O.active);
            }

            if (I.disabled) {
                I.disabled = false;
                toggle_class(E, "aux-disabled", O.disabled);
            }
        }

        if (I.needs_resize) {
            I.needs_resize = false;

            if (O.needs_resize) {
                O.needs_resize = false;

                S.after_frame(this._schedule_resize);
            }
        }
        
        if (I.title) {
            I.title = false;
            E.setAttribute("title", O.title);
        }

        var q = this.draw_queue;

        this.draw_queue = null;

        if (q) for (var i = 0; i < q.length; i++) {
            q[i].call(this, O);
        }
    },
    destroy: function () {
        /**
         * Is fired when a widget is destroyed.
         * 
         * @event Widget#destroy
         */
        if (this.is_destructed()) {
          warn("destroy called twice on ", this);
          return;
        }
        this.emit("destroy");

        this.disable_draw();
        this.set_parent(void(0));

        if (this.children)
        {
          this.remove_children(this.children);
          this.children = null;
        }

        Base.prototype.destroy.call(this);

        this._redraw = null;
        this.__resize = null;
        this._schedule_resize = null;
        this.options = null;

        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    },
    add_class: function (cls) {
        add_class(this.getClassTarget(), cls);
    },
    remove_class: function (cls) {
        remove_class(this.getClassTarget(), cls);
    },
    has_class: function (cls) {
        return has_class(this.getClassTarget(), cls);
    },
    set_style: function (name, value) {
        set_style(this.getStyleTarget(), name, value);
    },
    /**
     * Sets a CSS style property in this widget's DOM element.
     *
     * @method Widget#set_style
     */
    set_styles: function (styles) {
        set_styles(this.getStyleTarget(), styles);
    },
    /**
     * Returns the computed style of this widget's DOM element.
     *
     * @method Widget#get_style
     */
    get_style: function (name) {
        return get_style(this.getStyleTarget(), name);
    },
    // GETTER & SETTER
    /**
     * Sets an option.
     *
     * @method Widget#set
     * 
     * @param {string} key - The option name.
     * @param value - The option value.
     */
    set: function (key, value) {
        /* These options are special and need to be handled immediately, in order
         * to preserve correct ordering */
        if (this._options[key]) {
            this.invalid[key] = true;
            if (this.value_time && this.value_time[key])
                this.value_time[key] = Date.now();
            this.trigger_draw();
        } else if (key.charCodeAt(0) !== 95) {
            warn("%O: %s.set(%s, %O): unknown option.", this, this._class, key, value);
        }
        Base.prototype.set.call(this, key, value);
        return value;
    },
    track_option: function(key) {
        if (!this.value_time) this.value_time = {};
        this.value_time[key] = Date.now();
    },
    enable_draw_self: function() {
    },
    /**
     * Enables rendering for all children of this widget.
     *
     * @method Widget#enable_draw_children
     */
    enable_draw_children: function() {
      var C = this.children;
      if (C) for (var i = 0; i < C.length; i++) C[i].enable_draw();
    },
    /**
     * Schedules this widget for drawing.
     *
     * @method Widget#enable_draw
     * 
     * @emits Widget#show
     */
    enable_draw: function () {
      if (this._drawn) return;
      this._drawn = true;
      if (this.needs_redraw) {
          S.add(this._redraw, 1);
      }
      /**
       * Is fired when a widget gets enabled for drawing.
       * 
       * @event Widget#show
       */
      this.emit("show");
      this.enable_draw_children();
    },
    disable_draw_children: function() {
        var C = this.children;
        if (C) for (var i = 0; i < C.length; i++) C[i].disable_draw();
    },
    /**
     * Stop drawing this widget.
     *
     * @method Widget#enable_draw
     * 
     * @emits Widget#hide
     */
    disable_draw: function () {
        if (!this._drawn) return;
        this._drawn = false;
        if (this.needs_redraw) {
            S.remove(this._redraw, 1);
            S.remove_next(this._redraw, 1);
        }
        /**
         * Is fired when a widget is hidden and not rendered anymore.
         * 
         * @event Widget#hide
         */
        /**
         * Is fired when the visibility state changes. The first argument
         * is the visibility state, which is either <code>true</code>
         * or <code>false</code>.
         * 
         * @event Widget#visibility
         */
        this.emit("hide");
        this.disable_draw_children();
    },
    /**
     * Make the widget visible. This will apply the class <code>aux-show</code>
     * during the next rendering step.
     *
     * @method Widget#show
     */
    show: function () {
        if (this.hidden()) this.set('visible', true);
        if (!this.is_drawn()) this.enable_draw();
    },
    /**
     * This is an alias for hide, which may be overloaded.
     * See {@link Container} for an example.
     *
     * @method Widget#force_show
     */
    force_show: function() {
        this.update('visible', true);
        this.enable_draw();
        this._redraw();
    },
    /**
     * Hide the widget. This will result in the class <code>aux-hide</code>
     * being applied to this widget in the next rendering step.
     *
     * @method Widget#hide
     */
    hide: function () {
      if (!this.hidden())
        this.set('visible', false);
    },
    /**
     * Hide the widget immediately.
     *
     * @method Widget#force_hide
     */
    force_hide: function () {
        var O = this.options;
        this.update('visible', false);
        this.enable_draw();
        this._redraw();
        this.disable_draw();
    },
    show_nodraw_children: function() {
      var C = this.children;
      if (C) for (let i = 0; i < C.length; i++) C[i].show_nodraw();
    },
    show_nodraw: function() {
      if (this.options.visible === true) return;
      this.update('visible', true);
      this.show_nodraw_children();
    },
    hide_nodraw_children: function() {
      var C = this.children;
      if (C) for (let i = 0; i < C.length; i++) C[i].hide_nodraw();
    },
    hide_nodraw: function() {
      if (this.options.visible === false) return;
      this.update('visible', false);
      this.hide_nodraw_children();
    },
    /**
     * Returns the current hidden status.
     *
     * @method Widget#hidden
     */
    hidden: function() {
        return this.options.visible === false;
    },
    is_drawn: function() {
        return this._drawn;
    },
    /**
     * Toggle the hidden status. This is equivalent to calling hide() or show(), depending on
     * the current hidden status of this widget.
     *
     * @method Widget#toggle_hidden
     */
    toggle_hidden: function() {
        if (this.hidden()) this.show();
        else this.hide();
    },
    set_parent: function(parent, no_remove_child) {
        const old_parent = this.parent;

        if (old_parent === parent) return;

        this.parent = parent;

        if (parent === null)
        {
          if (old_parent !== parent)
          {
            window.addEventListener("resize", this._onresize);
            document.addEventListener("DOMContentLoaded", this._onresize);
            document.addEventListener("visibilitychange", this._onvisibilitychange, false);
            this._onvisibilitychange();
          }
        }
        else if (parent !== null && old_parent === null)
        {
          window.removeEventListener("resize", this._onresize);
          document.removeEventListener("DOMContentLoaded", this._onresize);
          document.removeEventListener("visibilitychange", this._onvisibilitychange);
        }


        if (old_parent && !no_remove_child) {
            old_parent.remove_child(this);
        }
    },
    has_child: function(child)
    {
      const C = this.children;

      return C !== null && C.indexOf(child) !== -1;
    },
    /**
     * Registers a widget as a child widget. This method is used to build up the widget tree. It does not modify the DOM tree.
     *
     * @method Widget#add_child
     * 
     * @param {Widget} child - The child to add.
     * 
     * @see Container#append_child
     */
    add_child: function(child) {
        var C = this.children;
        if (!C) this.children = C = [];

        if (C.indexOf(child) !== -1)
          throw new Error('Adding child twice.');

        child.set_parent(this);
        C.push(child);
        if (this.is_drawn()) {
            child.enable_draw();
        } else {
            child.disable_draw();
        }
        child.trigger_resize();
        this.emit('child_added', child);
    },
    /**
     * Removes a child widget. Note that this method only modifies
     * the widget tree and does not change the DOM.
     *
     * @method Widget#remove_child
     * 
     * @param {Widget} child - The child to remove.
     */
    remove_child : function(child) {
        if (this.is_destructed()) return;
        if (child.parent === this)
          child.set_parent(void(0), true);
        child.disable_draw();
        var C = this.children;
        var i;
        if (C !== null && (i = C.indexOf(child)) !== -1) {
          C.splice(i, 1);
          this.emit('child_removed', child);
          if (!C.length) this.children = null;
        } else {
            error("%o is not a child of %o", child, this);
        }
    },
    /**
     * Calls {@link Widget#append_child} for an array of widgets.
     * 
     * @method Widget#append_children
     *
     * @param {Array.<Widget>} children - The child widgets to append.
     */
    append_children : function (a) {
        a.map(this.append_child, this);
    },
    /**
     * Appends <code>child.element</code> to the widget element and
     * registers <code>child</code> as a child widget.
     * 
     * @method Widget#append_child
     *
     * @param {Widget} child - The child widget to append.
     */
    append_child : function(child) {
        this.element.appendChild(child.element);
        this.add_child(child);
    },
    /**
     * Removes an array of children.
     *
     * @method Widget#remove_children
     * 
     * @param {Array.<Widget>} a - An array of Widgets.
     */
    remove_children : function(a) {
        a.map(this.remove_child, this);
    },
    /**
     * Registers an array of widgets as children.
     *
     * @method Widget#add_children
     * 
     * @param {Array.<Widget>} a - An array of Widgets.
     */
    add_children : function (a) {
        a.map(this.add_child, this);
    },

    /**
     * Returns an array of all visible children.
     *
     * @method Widget#visible_children
     */
    visible_children: function(a) {
        if (!a) a = [];
        var C = this.children;
        if (C) for (var i = 0; i < C.length; i++) {
            a.push(C[i]);
            C[i].visible_children(a);
        }
        return a;
    },

    /**
     * Returns an array of all children.
     *
     * @method Widget#all_children
     */
    all_children: function(a) {
        if (!a) a = [];
        var C = this.children;
        if (C) for (var i = 0; i < C.length; i++) {
            a.push(C[i]);
            C[i].all_children(a);
        }
        return a;
    },

    get_children: function() {
        var C = this.children;
        return C !== null ? C : [];
    },
});
/**
 * Generic DOM events. Please refer to
 *   <a href="https://www.w3schools.com/jsref/dom_obj_event.asp">
 *   W3Schools
 *   </a> for further details.
 * 
 * @event Widget##GenericDOMEvents
 */

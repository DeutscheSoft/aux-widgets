 /* toolkit provides different widgets, implements and modules for 
 * building audio based applications in webbrowsers.
 * 
 * Invented 2013 by Markus Schmidt <schmidt@boomshop.net>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
 * Boston, MA  02110-1301  USA
 */
"use strict";
(function(w){
w.TK.Pager = w.Pager = $class({
    /**
     * TK.Pager, also known as Notebook in other UI toolkits, provides
     * multiple containers for displaying contents which are switchable
     * via a {@link TK.ButtonArray}.
     * 
     * @class TK.Pager
     * 
     * @param {Object} options
     * @property {integer} [options.position="top"] - The position of the ButtonArray
     * @property {Array} [options.pages=[]] -
     *          An array of mappings (objects) containing the members "label" and "content".
     *          "label" is a string for the buttons label or an object containing options for
     *          a button and content is either a HTML string or a HTMLElement node.
     * @property {integer} [options.show=-1] - The page to show
     * @property {boolean} [options.overlap=false] - If false,  pages are automatically resized so that the {@link TK.ButtonArray} does not overlap the page contents.
     *
     * @extends TK.Container
     * @example
     * var pager = new TK.Pager({
     *  pages: [
     *   {
     *     label: "Empty Page 1",
     *     content: document.createElement("span")
     *   },
     *   {
     *     label: { label:"Foobar", class:"foobar" },
     *     content: "<h1>Foobar</h1><p>Lorem ipsum dolor sit amet</p>"
     *   }
     *  ]
     * });
     */
    _class: "Pager",
    Extends: TK.Container,
    _options: Object.assign(Object.create(TK.Container.prototype._options), {
        position:  "int",
        direction: "string",
        pages:     "array",
        show:      "int",
        overlap:   "boolean",
    }),
    options: {
        position:  "top",
        direction: "forward",
        pages:     [],
        show:      -1,
        overlap:   false
    },
    
    initialize: function (options) {
        this.pages = [];
        TK.Container.prototype.initialize.call(this, options);
        /**
         * The main pager element. It has the CSS classes <code>toolkit-container</code> and <code>toolkit-pager</code>.
         *
         * @member TK.Pager#element
         */
        /** @member {HTMLDivElement} TK.Pager#_buttonarray_wrapper - An internal container for layout purposes containing the #TK.ButtonArray.
         *      Has classes <code>toolkit-buttonarray-wrapper</code> and <code>toolkit-wrapper</code>.
         */
        /** @member {HTMLDivElement} TK.Pager#_container_wrapper - An internal container for layout purposes containing the _clip element.
         *      Has classes <code>toolkit-wrapper</code> and <code>toolkit-container-wrapper</code>.
         */
        /** @member {HTMLDivElement} TK.Pager#_clip - The clipping area containing the pages.
         *      Has class <code>toolkit-clip</code>.
         */
        TK.add_class(this.element, "toolkit-pager");
        /**
         * The {@link TK.ButtonArray} instance acting as the menu.
         *
         * @member TK.Pager#buttonarray
         */
        this.buttonarray = new TK.ButtonArray({
            container: this.element,
            onchanged: function(button, n) {
                this.set("show", n); 
            }.bind(this),
        });
        this._clip = TK.element("div", "toolkit-clip");
        this.element.appendChild(this._clip);
        
        this.add_child(this.buttonarray);
        this.add_pages(this.options.pages);
        this.set("position", this.options.position);
        this.set("show", this.options.show);
    },
    
    redraw: function () {
        TK.Container.prototype.redraw.call(this);
        var O = this.options;
        var I = this.invalid;
        var E = this.element;

        if (I.overlap)
            TK[(O.overlap ? "add_" : "remove_") + "class"](E, "toolkit-overlap");
        
        if (I.direction) {
            I.direction = false;
            TK.remove_class(E, "toolkit-forward");
            TK.remove_class(E, "toolkit-backward");
            TK.add_class(E, "toolkit-" + O.direction);
        }
        
        if (I.position) {
            I.position = false;
            TK.remove_class(E, "toolkit-top");
            TK.remove_class(E, "toolkit-right");
            TK.remove_class(E, "toolkit-bottom");
            TK.remove_class(E, "toolkit-left");
            TK.remove_class(E, "toolkit-vertical");
            TK.remove_class(E, "toolkit-horizontal");
            switch (O.position) {
                case "top":
                    TK.add_class(E, "toolkit-top");
                    TK.add_class(E, "toolkit-vertical");
                    break;
                case "bottom":
                    TK.add_class(E, "toolkit-bottom");
                    TK.add_class(E, "toolkit-vertical");
                    break;
                case "left":
                    TK.add_class(E, "toolkit-left");
                    TK.add_class(E, "toolkit-horizontal");
                    break;
                case "right":
                    TK.add_class(E, "toolkit-right");
                    TK.add_class(E, "toolkit-horizontal");
                    break;
                default:
                    TK.warn("Unsupported position", O.position);
            }
            I.layout = true;
        }
        
        if (I.layout) {
            // the following code will fire after the buttonarray.element
            // has been added to the dom. We are sure that is the case because it happens
            // with priority 0 and the following code is executed in priority 1.
            I.layout = false;
            TK.S.add(function() {
                var size;
                if (O.position == "top" || O.position == "bottom") {
                    size = TK.outer_height(this.buttonarray.element) + "px";
                } else {
                    size = TK.outer_width(this.buttonarray.element) + "px";
                }
                TK.S.add(function() {
                    switch (O.position) {
                        case "top":
                            this._clip.style.top = size;
                            this._clip.style.bottom = null;
                            this._clip.style.left = null;
                            this._clip.style.right = null;
                            break;
                        case "bottom":
                            this._clip.style.bottom = size;
                            this._clip.style.top = null;
                            this._clip.style.left = null;
                            this._clip.style.right = null;
                            break;
                        case "left":
                            this._clip.style.left = size;
                            this._clip.style.right = null;
                            this._clip.style.top = null;
                            this._clip.style.bottom = null;
                            break;
                        case "right":
                            this._clip.style.right = size;
                            this._clip.style.left = null;
                            this._clip.style.top = null;
                            this._clip.style.bottom = null;
                            break;
                        default:
                            TK.warn("Unsupported position", O.position);
                    }
                    /* we essentially resize the pages container, so we need to call
                     * resize() on them */
                    TK.S.after_frame(TK.Container.prototype.resize.bind(this));
                }.bind(this));
            }.bind(this), 1);
        }
        
        if (I.show) {
            I.show = false;
            for (var i = 0; i < this.pages.length; i ++) {
                var page = this.pages[i];
                if (i == O.show)
                    page.add_class("toolkit-active");
                else
                    page.remove_class("toolkit-active");
            }
        }
    },
    
    add_pages: function (options) {
        /**
         * Adds an array of pages.
         *
         * @method TK.Pager#add_pages
         * @param {Array} options -
         *      An Array containing objects with options for the page and its button.
         *      Members are a string label for the corresponding button and content,
         *      which can be either a DOM node, a HTML string or a {@link TK.Container}
         *      widget.
         * @example
         * var p = new TK.Pager();
         * p.add_pages([
         *   {
         *     label: "Page 1",
         *     content: "<h1>Page1</h1>",
         *   }
         * ]);
         * 
         */
        for (var i = 0; i < options.length; i++)
            this.add_page(options[i].label, options[i].content);
    },
    
    add_page: function (button, content, position, options) {
        /**
         * Adds a {@link TK.Container} to the pager and a {@link TK.Button} to the pagers {@link TK.ButtonArray}.
         *
         * @method TK.Pager#add_page
         *
         * @param {string|Object} button - A string with the {@link TK.Button} s label or an object cotaining options for the {@link Button}
         * @param {TK.Widget|Class|string} content - The content of the page. Either a {@link TK.Container} (or derivate) widget,
         *   a class (needs option "options" to be set) or a string which get embedded in a new {@link TK.Container}
         * @param {Object} options - An object containing options for the {@link TK.Container} to add as a page
         * @param {integer|undefined} position - The position to add the new page to. If undefined, the page is added at the end.
         * @emits TK.Pager#added
         */
        var p;
        if (typeof button === "string")
            button = {label: button};
        this.buttonarray.add_button(button, position);

        if (typeof content === "string" || TK.is_dom_node(content)) {
            if (!options) options = {}; 
            options.content = content;
            p = new TK.Container(options);
        } else if (typeof content === "function") {
            // assume here content is a subclass of Container
            p = new content(options);
        } else {
            p = content;
        }

        p.add_class("toolkit-page");
        p.set("container", this._clip);

        var len = this.pages.length;

        if (position >= 0 && position < len - 1) {
            this.pages.splice(position, 0, p);
            this._clip.insertBefore(p.element, this._clip.childNodes[position]);
        } else {
            position = len;
            this.pages.push(p);
            this._clip.appendChild(p.element);
        }
        /**
         * A page was added to the TK.Pager.
         *
         * @event TK.Pager#added
         * @type {TK.Container}
         */
        this.fire_event("added", p);

        this.add_child(p);

        // TODO: not always necessary
        if (this.current() === p) {
            this.options.show = position;
            this.buttonarray.set("show", position);
            p.set("active", true);
            p.set("display_state", "show");
        } else {
            /* do not use animation */
            p.force_hide();
            this.hide_child(p);
        }
        this.invalid.layout = true;
        this.trigger_draw();
        return p;
    },

    remove_page: function (page) {
        /**
         * Removes a page from the TK.Pager.
         * @method TK.Pager#remove_page
         * @param {integer|TK.Container} page - The container to remove. Either a position or the {@link TK.Container} widget generated by add_page
         * @emits TK.Pager#removed
         */
        if (typeof page == "object")
            page = this.pages.indexOf(page);
        if (page < 0 || page >= this.pages.length)
            return;
        this.buttonarray.remove_button(page);
        if (page < this.options.show)
            this.set("show", this.options.show-1);
        else if (page === this.options.show)
            this.set("show", this.options.show);
        var p = this.pages[page];
        this.pages.splice(page, 1);
        p.destroy();
        this.remove_child(p);
        this.invalid.layout = true;
        this.trigger_draw();
        /**
         * A page was removed from the Pager
         *
         * @event TK.Pager#removed
         * @type Page
         */
        this.fire_event("removed", p);
    },
    
    resize: function () {
        this.invalid.show = true;
        this.invalid.layout = true;
        this.trigger_draw();
        TK.Container.prototype.resize.call(this);
    },

    current: function() {
        /** @method TK.Pager#current
         * @description Returns the currently displayed page or null.
         */
        var n = this.options.show;
        if (n >= 0 && n < this.pages.length) {
            return this.pages[n];
        }
        return null;
    },
    
    set: function (key, value) {
        var page;
        if (key === "show") {
            if (value < 0) value = 0;
            else if (value >= this.pages.length) value = this.pages.length - 1;

            if (value === this.options.show) return;
            if (value > this.options.show) {
                this.set("direction", "forward");
            } else {
                this.set("direction", "backward");
            }
            page = this.current();
            if (page) {
                this.hide_child(page);
                page.set("active", false);
            }

            this.buttonarray.set("show", value);
        }
        value = TK.Container.prototype.set.call(this, key, value);
        switch(key) {
            case "show":
                page = this.current();

                if (page) {
                    page.set("active", true);
                    this.show_child(page);
                    this.fire_event("changed", page, value);
                }

                break;
            case "pages":
                for (var i = 0; i < this.pages.length; i++)
                    this.pages[i].destroy();
                this.pages = [];
                this.add_pages(value);
                break;
            case "position":
                var badir;
                if (value === "top" || value === "bottom") {
                    badir = "horizontal";
                } else {
                    badir = "vertical";
                }
                this.buttonarray.set("direction", badir);
                break;
        }
        return value;
    },
    get: function (key) {
        if (key == "pages") return this.pages;
        return TK.Container.prototype.get.call(this, key);
    }
});
})(this);

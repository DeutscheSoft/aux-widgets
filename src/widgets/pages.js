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
 
 /**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>show</code>.
 *
 * @event Pages#useraction
 * 
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { define_class, define_child_element } from '../widget_helpers.js';
import { define_child_widget } from '../child_widget.js';
import { add_class, remove_class, is_dom_node } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import { Container } from './container.js';
import { Navigation } from './navigation.js';
 
export const Pages = define_class({
    /**
     * Pages contains different pages ({@link Container}s) which can
     * be swiched via option.
     * 
     * @class Pages
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Array<Container|DOMNode|String>} [options.pages=[]] -
     *   An array of either an instance of {@link Container} (or derivate),
     *   a DOMNode or a string which gets wrapped in a new {@link Container}.
     * @property {Integer} [options.show=-1] - The page to show.
     * @property {String} [options.animation="horizontal"] - The direction of the
     *   flip animation, einter `horizontal` or `vertical`.
     * 
     * @extends Container
     * 
     * @example
     * var pages = new Pages({
     *  pages: [
     *   document.createElement("span"),
     *   "<h1>Foobar</h1><p>Lorem ipsum dolor sit amet</p>"
     *  ]
     * });
     */
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        direction: "string",
        pages:     "array",
        show:      "int",
        animation: "string",
    }),
    options: {
        direction: "forward",
        pages:     [],
        show:      -1,
        animation: "horizontal",
    },
    static_events: {
        set_show: function(value) {
            var page = this.current();

            if (page) {
                page.set("active", true);
                this.show_child(page);
                /**
                 * The page to show has changed.
                 * 
                 * @param {Container} page - The {@link Container} instance of the newly selected page.
                 * @param {number} id - The ID of the page.
                 * 
                 * @event Pages#changed
                 */
                this.emit("changed", page, value);
            }
        },
        set_pages: function(value) {
            for (var i = 0; i < this.pages.length; i++)
                this.pages[i].destroy();
            this.pages = [];
            this.add_pages(value);
        },
        set_position: function(value) {
            var badir;
            if (value === "top" || value === "bottom") {
                badir = "horizontal";
            } else {
                badir = "vertical";
            }
        },
    },
    
    initialize: function (options) {
        this.pages = [];
        Container.prototype.initialize.call(this, options);
        /**
         * The main DIV element. Has the class <code>.aux-pages</code>.
         *
         * @member Pages#element
         */
        add_class(this.element, "aux-pages");
    },
    
    initialized: function () {
        Container.prototype.initialized.call(this);
        this.add_pages(this.options.pages);
        this.set("show", this.options.show);
    },
    
    redraw: function () {
        Container.prototype.redraw.call(this);
        var O = this.options;
        var I = this.invalid;
        var E = this.element;

        if (I.direction) {
            I.direction = false;
            remove_class(E, "aux-forward", "aux-backward");
            add_class(E, "aux-" + O.direction);
        }
        
        if (I.animation) {
            I.animation = false;
            remove_class(E, "aux-vertical", "aux-horizontal");
            switch (O.animation) {
                case "vertical":
                    add_class(E, "aux-vertical");
                    break;
                case "horizontal":
                    add_class(E, "aux-horizontal");
                    break;
                default:
                    warn("Unsupported animation", O.animation);
            }
            I.layout = true;
        }
        
        if (I.show) {
            I.show = false;
            for (var i = 0; i < this.pages.length; i ++) {
                var page = this.pages[i];
                if (i === O.show)
                    page.add_class("aux-active");
                else
                    page.remove_class("aux-active");
            }
        }
    },
    
    /**
     * Adds an array of pages.
     *
     * @method Pages#add_pages
     * 
     * @property {Array<Container|DOMNode|String>} [options.pages=[]] -
     *   An array of either an instance of {@link Container} (or derivate),
     *   a DOMNode or a string which gets wrapped in a new {@link Container}.
     * 
     * @example
     * var p = new Pages();
     * p.add_pages(['foobar']);
     * 
     */
    add_pages: function (pages) {
        for (var i = 0; i < pages.length; i++)
            this.add_page(pages[i]);
    },
    
    /**
     * Adds a {@link Container} to the pages and a corresponding {@link Button}
     *   to the pages {@link Navigation}.
     *
     * @method Pages#add_page
     *
     * @param {Widget|Class|string} content - The content of the page.
     *   Either a {@link Container} (or derivate) widget,
     *   a DOMNode (needs option `options` to be set) or a string which
     *   gets wrapped in a new {@link Container} with options from
     *   argument `options`.
     * @param {Object} [options={ }] - An object containing options for
     *   the {@link Container} to be added as page if `content` is
     *   either a string or a DOMNode.
     * @param {integer|undefined} position - The position to add the new
     *   page to. If undefined, the page is added at the end.
     * @emits Pages#added
     */
    add_page: function (content, position, options) {
        var p;
        if (typeof content === "string" || is_dom_node(content)) {
            if (!options) options = {}; 
            options.content = content;
            p = new Container(options);
        } else if (typeof content === "function") {
            // assume here content is a subclass of Container
            p = new content(options);
        } else {
            p = content;
        }

        p.add_class("aux-page");
        p.set("container", this.element);

        var len = this.pages.length;

        if (position >= 0 && position < len - 1) {
            this.pages.splice(position, 0, p);
            this.element.insertBefore(p.element, this.element.childNodes[position]);
        } else {
            position = len;
            this.pages.push(p);
            this.element.appendChild(p.element);
        }
        /**
         * A page was added to the Pages.
         *
         * @event Pages#added
         * 
         * @param {Container} page - The {@link Container} which was added as a page.
         */
        this.emit("added", p);

        this.add_child(p);

        // TODO: not always necessary
        if (this.current() === p) {
            this.options.show = position;
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

    /**
     * Removes a page from the Pages.
     * 
     * @method Pages#remove_page
     * 
     * @param {integer|Container} page - The container to remove. Either a
     *   position or the {@link Container} widget generated by <code>add_page</code>.
     * 
     * @emits Pages#removed
     */
    remove_page: function (page) {
        if (typeof page === "object")
            page = this.pages.indexOf(page);
        if (page < 0 || page >= this.pages.length)
            return;
        this.navigation.remove_button(page);
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
         * A page was removed from the Pages
         *
         * @event Pages#removed
         * 
         * @param {Container} page - The {@link Container} which was removed.
         */
        this.emit("removed", p);
    },

    current: function() {
        /**
         * Returns the currently displayed page or null.
         * 
         * @method Pages#current
         */
        var n = this.options.show;
        if (n >= 0 && n < this.pages.length) {
            return this.pages[n];
        }
        return null;
    },

    /**
     * Opens the first page of the pages. Returns <code>true</code> if a
     * first page exists, <code>false</code> otherwise.
     *
     * @method Pages#first
     */
    first: function() {
        if (this.pages.length) {
            this.set("show", 0);
            return true;
        }
        return false;
    },
    /**
     * Opens the last page of the pages. Returns <code>true</code> if a
     * last page exists, <code>false</code> otherwise.
     *
     * @method Pages#last
     */
    last: function() {
        if (this.pages.length) {
            this.set("show", this.pages.length-1);
            return true;
        }
        return false;
    },

    /**
     * Opens the next page of the pages. Returns <code>true</code> if a
     * next page exists, <code>false</code> otherwise.
     *
     * @method Pages#next
     */
    next: function() {
        var c = this.options.show;
        return this.set("show", c+1) !== c;
    },
    /**
     * Opens the previous page of the pages. Returns <code>true</code> if a
     * previous page exists, <code>false</code> otherwise.
     *
     * @method Pages#prev
     */
    prev: function() {
        var c = this.options.show;
        return this.set("show", c-1) !== c;
    },

    set: function (key, value) {
        var page;
        if (key === "show") {
            if (value < 0) value = 0;
            else if (value >= this.pages.length) value = this.pages.length - 1;

            if (value === this.options.show) return value;
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
        }
        return Container.prototype.set.call(this, key, value);
    },
    get: function (key) {
        if (key === "pages") return this.pages;
        return Container.prototype.get.call(this, key);
    }
});

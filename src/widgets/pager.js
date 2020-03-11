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
 
 /**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>show</code>.
 *
 * @event Pager#useraction
 * 
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { define_class } from '../widget_helpers.js';
import { define_child_widget } from '../child_widget.js';
import { add_class, remove_class } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import { Pages } from './pages.js';
import { Container } from './container.js';
import { Navigation } from './navigation.js';
 
export const Pager = define_class({
    /**
     * Pager, also known as Notebook in other UI toolkits, provides
     * multiple containers for displaying contents via {@link Pages} 
     * which are switchable via a {@link Navigation}.
     * 
     * @class Pager
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {String} [options.position="top"] - The position of the
     *   {@link Navigation}. Can either be `top`, `right`, `left` or `bottom`.
     * @property {Integer} [options.show] - The page to show. Set to -1
     *   to hide all pages.
     * @property {Array<Container|DOMNode|String>} [options.pages=[]] -
     *   An array of either an instance of {@link Container} (or derivate),
     *   a DOMNode or a string of HTML which gets wrapped in a new {@link Container}.
     * @extends Container
     * 
     * @example
     * var pager = new Pager({
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
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        pages:     "array",
        position:  "string",
        show:      "int",
    }),
    options: {
        pages:     [],
        position:  "top",
        show:      null,
    },
    static_events: {
        set_position: function(value) {
            var badir;
            if (value === "top" || value === "bottom") {
                badir = "horizontal";
            } else {
                badir = "vertical";
            }
            this.navigation.set("direction", badir);
            this.pages.set("animation", badir);
        },
        set_pages: function(value) {
            this.navigation.empty();
            this.pages.empty();
            this.add_pages(value);
        },
    },
    
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        /**
         * The main DIV element. Has the class <code>.aux-pager</code>.
         *
         * @member Pager#element
         */
    },
    
    initialized: function () {
        Container.prototype.initialized.call(this);
        this.add_pages(this.options.pages);
        this.set("position", this.options.position);
        this.set("show", this.options.show);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-pager");

      Container.prototype.draw.call(this, O, element);
    },
    
    redraw: function () {
        Container.prototype.redraw.call(this);
        var O = this.options;
        var I = this.invalid;
        var E = this.element;

        if (I.position) {
            I.position = false;
            remove_class(E, "aux-top", "aux-right", "aux-bottom",
                            "aux-left", "aux-vertical", "aux-horizontal");
            switch (O.position) {
                case "top":
                    add_class(E, "aux-top", "aux-vertical");
                    break;
                case "bottom":
                    add_class(E, "aux-bottom", "aux-vertical");
                    break;
                case "left":
                    add_class(E, "aux-left", "aux-horizontal");
                    break;
                case "right":
                    add_class(E, "aux-right", "aux-horizontal");
                    break;
                default:
                    warn("Unsupported position", O.position);
            }
        }
    },
    
    /**
     * Adds an array of pages.
     *
     * @method Pager#add_pages
     * 
     * @param {Array<Object>} options - An Array of objects with members
     *   `content` and all options available in {@link Button}.
     *   `content` is either a {@link Container} (or derivate) widget,
     *   a DOMNode or a string of HTML which
     *   gets wrapped in a new {@link Container} with options from
     *   argument `options`.
     * 
     * @example
     * var p = new Pager();
     * p.add_pages([
     *   {
     *     label: "Page 1",
     *     icon: "gear",
     *     content: "<h1>Page1</h1>",
     *   }
     * ]);
     * 
     */
    add_pages: function (pages) {
        for (var i = 0; i < pages.length; i++) {
            var con = pages[i].content;
            var but = pages[i];
            delete but.content;
            this.add_page(but, con);
        }
    },
    
    /**
     * Adds a {@link Container} to the pager and a corresponding {@link Button}
     *   to the pagers {@link Navigation}.
     *
     * @method Pager#add_page
     *
     * @param {string|Object} button - A string with the {@link Button}s label or
     *   an object containing options for the {@link Button} instance.
     * @param {Container|DOMNode|string} content - The content of the page.
     *   Either a {@link Container} (or derivate) widget,
     *   a DOMNode or a string of HTML which gets wrapped in a new
     *   {@link Container} using options from argument `options`.
     * @param {Object} [options={ }] - An object containing options for
     *   the {@link Container} to be added as page if `content` is
     *   either a string or a DOMNode.
     * @param {integer|undefined} [position] - The position to add the new
     *   page to. If undefined, the page is added at the end.
     * 
     * @emits Pager#added
     */
    add_page: function (button, content, options, position) {
        if (typeof button === "string")
            button = {label: button};
        this.navigation.add_button(button, position);
        const p = this.pages.add_page(content, position, options);
        this.emit("added", p);
        return p;
    },

    /**
     * Removes a page from the Pager.
     * 
     * @method Pager#remove_page
     * 
     * @param {integer|Container} page - The container to remove. Either an
     *   index or the {@link Container} widget generated by <code>add_page</code>.
     * 
     * @emits Pager#removed
     */
    remove_page: function (page) {
        const i = this.pages.pages.indexOf(page);
        if (i >= 0)
            this.navigation.remove_button(i);
        return this.pages.remove_page(page);
    },
    /**
     * Returns the currently displayed page or null.
     * 
     * @method Pager#current
     */
    current: function () {
        return this.pager.current();
    },

    /**
     * Opens the first page of the pager. Returns <code>true</code> if a
     * first page exists, <code>false</code> otherwise.
     *
     * @method Pager#first
     */
    first: function() {
        if (this.pages.pages.length) {
            this.set("show", 0);
            return true;
        }
        return false;
    },
    /**
     * Opens the last page of the pager. Returns <code>true</code> if a
     * last page exists, <code>false</code> otherwise.
     *
     * @method Pager#last
     */
    last: function() {
        if (this.pages.pages.length) {
            this.set("show", this.pages.pages.length-1);
            return true;
        }
        return false;
    },

    /**
     * Opens the next page of the pager. Returns <code>true</code> if a
     * next page exists, <code>false</code> otherwise.
     *
     * @method Pager#next
     */
    next: function() {
        var c = this.options.show;
        return this.set("show", c+1) !== c;
    },
    /**
     * Opens the previous page of the pager. Returns <code>true</code> if a
     * previous page exists, <code>false</code> otherwise.
     *
     * @method Pager#prev
     */
    prev: function() {
        var c = this.options.show;
        return this.set("show", c-1) !== c;
    },
});

/**
 * The {@link Navigation} instance acting as the menu.
 *
 * @member Pager#navigation
 */
define_child_widget(Pager, "navigation", {
    create: Navigation,
    show: true,
    map_options: {
        show: "select",
    },
    static_events: {
        userset: function(key, value) {
            if (key == "select") {
                this.parent.userset("show", value);
            } else {
                this.parent.userset(key, value);
            }
            return false;
        }
    },
});

/**
 * The {@link Pages} instance.
 *
 * @member Pager#pages
 */

/**
 * A page was removed from the Pager
 *
 * @event Pager#removed
 * 
 * @param {Container} page - The {@link Container} which was removed.
 */
/**
 * A page was added to the Pager.
 *
 * @event Pager#added
 * 
 * @param {Container} page - The {@link Container} which was added as a page.
 */

define_child_widget(Pager, "pages", {
    create: Pages,
    show: true,
    inherit_options: true,
    //static_events: {
        //"added" : function (p) { this.emit("added", p); },
        //"removed" : function (p) { this.emit("removed", p); },
    //},
    blacklist_options: [ "pages" ],
});

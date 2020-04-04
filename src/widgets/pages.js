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
 * @event Pages#useraction
 * 
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { define_class } from '../widget_helpers.js';
import { add_class, remove_class, is_dom_node } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import { Container } from './container.js';

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
     *   a DOMNode or a string of HTML which gets wrapped in a new {@link Container}.
     * @property {Integer} [options.show=-1] - The page to show. Set to -1 to hide all pages.
     * @property {String} [options.animation="horizontal"] - The direction of the
     *   flip animation, either `horizontal` or `vertical`.
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
            if (!page) return;
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
        },
        set_pages: function(value) {
            this.empty();
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
    },
    
    initialized: function () {
        Container.prototype.initialized.call(this);
        this.add_pages(this.options.pages);
        this.set("show", this.options.show);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-pages");

      Container.prototype.draw.call(this, O, element);
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
     * @param {Container|DOMNode|String} content - The content of the page.
     *   Either an instance of a {@link Container} (or derivate) widget,
     *   a DOMNode or a string of HTML which gets wrapped in a new {@link Container}
     *   with optional options from argument `options`.
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
            if (content.parentNode) content.remove();
            options.content = content;
            p = new Container(options);
        } else if (content instanceof Container) {
            // assume here content is an instance of Container
            p = content;
        } else {
          throw new TypeError('Unexpected argument type.');
        }
        
        const element = this.element;

        if (position >= 0 && position < element.childNodes.length - 1)
        {
            element.insertBefore(p.element, element.childNodes[position]);
        }
        else
        {
            element.appendChild(p.element);
        }

        this.add_child(p);

        return p;
    },
    add_child: function(child)
    {
      Container.prototype.add_child.call(this, child);

      if (child instanceof Container)
      {
        child.add_class("aux-page");

        const nodes = Array.from(this.element.childNodes);
        let position = nodes.indexOf(child.element);


        if (position === -1)
        {
          warn("child added to pages at unknown position.");
        }

        if (position >= 0 && position < this.pages.length - 1)
        {
          this.pages.splice(position, 0, child);
        }
        else
        {
          position = this.pages.length;
          this.pages.push(child);
        }

        /**
         * A page was added to the Pages.
         *
         * @event Pages#added
         * 
         * @param {Container} page - The {@link Container} which was added as a page.
         */
        this.emit("added", child, position);

        if (this.current() === child)
        {
            child.force_show();
            this.options.show = -1;
            this.set('show', position);
        }
        else
        {
            /* do not use animation */
            child.force_hide();
            this.hide_child(child);
        }
        this.invalid.layout = true;
        this.trigger_draw();
      }
    },
    /**
     * Removes a page from the Pages.
     * 
     * @method Pages#remove_page
     * 
     * @param {integer|Container} page - The container to remove. Either an
     *   index or the {@link Container} widget generated by <code>add_page</code>.
     * @param {Boolean} destroy - destroy the {@link Container} after removal.
     * 
     * @emits Pages#removed
     */
    remove_page: function (page, destroy)
    {
        if (typeof(page) === 'number')
        {
          page = this.pages[page];
        }

        if (this.pages.indexOf(page) === -1)
          throw new Error('Unknown page.');

        page.element.remove();
        this.remove_child(page);

        if (destroy)
            page.destroy();
    },
    remove_child: function (child)
    {
      Container.prototype.remove_child.call(this, child);

      if (this.pages.indexOf(child) !== -1)
      {
        const index = this.pages.indexOf(child);

        if (index < this.options.show)
            this.set("show", this.options.show-1);
        else if (index === this.options.show)
            this.set("show", this.options.show);
        this.pages.splice(index, 1);
        this.invalid.layout = true;
        this.trigger_draw();
        /**
         * A page was removed from the Pages
         *
         * @event Pages#removed
         * 
         * @param {Container} page - The {@link Container} which was removed.
         * @param {number} index - The index at which the container was.
         */
        this.emit("removed", child, index);
      }
    },
    
    /**
     * Removes all pages.
     * 
     * @method Pages#empty
     */
    empty: function () {
        while (this.pages.length)
            this.remove_page(0);
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
     * 
     * @returns {Boolean} True if successful, false otherwise.
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
     * 
     * @returns {Boolean} True if successful, false otherwise.
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
     * 
     * @returns {Boolean} True if successful, false otherwise.
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
     * 
     * @returns {Boolean} True if successful, false otherwise.
     */
    prev: function() {
        var c = this.options.show;
        return this.set("show", c-1) !== c;
    },

    set: function (key, value) {
        var page;
        if (key === "show") {
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
    },
    get_pages: function() {
        return this.pages;
    },
});

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
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../utils/subscriptions.js';
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
            if (this.navigation)
              this.navigation.set("direction", badir);
            if (this.pages)
              this.pages.set("animation", badir);
        },
    },

    initializePages: function()
    {
      this.pages_subscriptions = unsubscribe_subscriptions(this.pages_subscriptions);

      const pages = this.pages;
      const navigation = this.navigation;

      if (!pages || !navigation) return;

      // create one button for each page and keep the title synchronized
      // with the page title
      let subs = pages.pages.forEachAsync((page, position) => {
        let subs = init_subscriptions();

        const button = navigation.add_button({ label: page.get('title') }, position);

        this.page_to_button.set(page, button);

        subs = add_subscription(subs, page.subscribe('set_title', (title) => {
          button.set('label', title);
        }));

        subs = add_subscription(subs, () => {
          navigation.remove_button(button);
          this.page_to_button.delete(page);
        });

        this.emit('added', page);

        subs = add_subscription(subs, () => {
          this.emit('removed', page);
        });

        return subs;
      });

      // delegate the userset action from pages to pager
      subs = add_subscription(subs, pages.subscribe('userset', (key, value) => {
        if (key !== 'show') return;
        return this.userset('show', value);
      }));

      // delegate the set_show action from pages to pager
      subs = add_subscription(subs, pages.subscribe('set_show', (value) => {
        return this.update('show', value);
      }));

      // delegate the userset action from navigation to pager
      subs = add_subscription(subs, navigation.subscribe('userset', (key, value) => {
        if (key !== 'select') return;
        this.update('show', value);
      }));

      // delegate the set_select action from navigation to pager
      subs = add_subscription(subs, navigation.subscribe('set_select', (value) => {
        this.update('show', value);
      }));

      // delegate the set_show action from pager to both pages and navigation
      subs = add_subscription(subs, this.subscribe('set_show', (value) => {
        pages.update('show', value);
        navigation.update('select', value);
      }));

      // delegate the added and removed events from pages
      subs = add_subscription(subs, this.subscribe('set_show', (value) => {
        pages.update('show', value);
        navigation.update('select', value);
      }));

      this.pages.set('show', this.get('show'));
      this.navigation.set('select', this.get('show'));
      this.set("position", this.get('position'));

      this.pages_subscriptions = subs;
    },

    getButtonForPage: function(page)
    {
      return this.page_to_button.get(page);
    },
    
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        /**
         * The main DIV element. Has the class <code>.aux-pager</code>.
         *
         * @member Pager#element
         */
        this.pages_subscriptions = init_subscriptions();
        this.page_to_button = new Map();
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

    remove_child: function(child)
    {
      if (child instanceof Pages)
      {
        if (this.pages === child)
        {
          this.pages.element.remove();
          this.pages = null;
          this.initializePages();
        }
      }
      else if (child instanceof Navigation)
      {
        if (this.navigation === child)
        {
          this.navigation.element.remove();
          this.navigation = null;
          this.initializePages();
        }
      }

      Container.prototype.remove_child.call(this, child);
    },

    add_child: function(child)
    {
      Container.prototype.add_child.call(this, child);

      if (child instanceof Pages)
      {
        if (this.pages && this.pages !== child)
        {
          // this.pages is being replaced by a new instance (set by the user)
          this.remove_child(this.pages);
        }

        this.pages = child;
        this.initializePages();
      }
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
     *     title: "Page 1",
     *     icon: "gear",
     *     content: "<h1>Page1</h1>",
     *   }
     * ]);
     * 
     */
    add_pages: function (pages) {
        if (!Array.isArray(pages))
          throw new TypeError('Expected array of objects.');

        for (var i = 0; i < pages.length; i++)
        {
          if (typeof(pages[i]) !== 'object')
          {
            throw new TypeError('Expected array of objects.');
          }

          const options = Object.assign({}, pages[i]);
          const content = options.content;
          delete options.content;

          this.add_page(options, content);
        }
    },
    
    /**
     * Adds a {@link Container} to the pager and a corresponding {@link Button}
     *   to the pagers {@link Navigation}.
     *
     * @method Pager#add_page
     *
     * @param {string|Object} buttonOptions - A string with the {@link Button}s label or
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
    add_page: function (buttonOptions, content, options, position) {
        const p = this.pages.add_page(content, position, options);

        const button = this.getButtonForPage(p);

        if (typeof buttonOptions === 'string')
        {
          p.set('title', buttonOptions);
        }
        else if (typeof buttonOptions === 'object')
        {
          const label = buttonOptions.label;

          if (label)
            p.set('title', buttonOptions);

          for (var key in buttonOptions)
          {
            button.set(key, buttonOptions[key]);
          }
        }
        else
        {
          throw new TypeError('Unsupported API.');
        }

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
        this.pages.remove_page(page);
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
        if (this.pages.get_pages().length) {
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
        if (this.pages.get_pages().length) {
            this.set("show", this.pages.get_pages().length-1);
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

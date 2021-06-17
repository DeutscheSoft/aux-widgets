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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
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
import { defineClass } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { addClass, removeClass } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import {
  initSubscriptions,
  addSubscription,
  unsubscribeSubscriptions,
} from '../utils/subscriptions.js';
import { Pages } from './pages.js';
import { Container } from './container.js';
import { Navigation } from './navigation.js';

export const Pager = defineClass({
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
  _options: Object.assign({}, Container.prototype._options, {
    pages: 'array',
    position: 'string',
    show: 'int',
  }),
  options: {
    pages: [],
    position: 'top',
    show: null,
  },
  static_events: {
    set_position: function (value) {
      let badir;
      if (value === 'top' || value === 'bottom') {
        badir = 'horizontal';
      } else {
        badir = 'vertical';
      }
      if (this.navigation) this.navigation.set('direction', badir);
      if (this.pages) this.pages.set('animation', badir);
    },
  },

  initializePages: function () {
    this.pages_subscriptions = unsubscribeSubscriptions(
      this.pages_subscriptions
    );

    const pages = this.pages;
    const navigation = this.navigation;

    if (!pages || !navigation) return;

    // create one button for each page and keep label and icon synchronized
    // with the page label/icon
    let subs = pages.pages.forEachAsync((page, position) => {
      let _subs = initSubscriptions();
      const id = page.element.id || false;
      const button = navigation.addButton(
        {
          label: page.get('label') || false,
          icon: page.get('icon') || false,
          id: id ? id + '-button' : false,
        },
        position
      );

      this.page_to_button.set(page, button);

      _subs = addSubscription(
        _subs,
        page.subscribe('set_label', (label) => {
          button.set('label', label);
        })
      );

      _subs = addSubscription(
        _subs,
        page.subscribe('set_icon', (icon) => {
          button.set('icon', icon);
        })
      );

      _subs = addSubscription(_subs, () => {
        navigation.removeButton(button);
        this.page_to_button.delete(page);
      });

      this.emit('added', page);

      _subs = addSubscription(_subs, () => {
        this.emit('removed', page);
      });

      return _subs;
    });

    // delegate the userset action from pages to pager
    subs = addSubscription(
      subs,
      pages.subscribe('userset', (key, value) => {
        if (key !== 'show') return;
        return this.userset('show', value);
      })
    );

    // delegate the set_show action from pages to pager
    subs = addSubscription(
      subs,
      pages.subscribe('set_show', (value) => {
        return this.update('show', value);
      })
    );

    // delegate the userset action from navigation to pager
    subs = addSubscription(
      subs,
      navigation.subscribe('userset', (key, value) => {
        if (key !== 'select') return;
        return this.userset('show', value);
      })
    );

    // delegate the set_select action from navigation to pager
    subs = addSubscription(
      subs,
      navigation.subscribe('set_select', (value) => {
        this.update('show', value);
      })
    );

    // delegate the set_show action from pager to both pages and navigation
    subs = addSubscription(
      subs,
      this.subscribe('set_show', (value) => {
        pages.update('show', value);
        navigation.update('select', value);
      })
    );

    // delegate the added and removed events from pages
    subs = addSubscription(
      subs,
      this.subscribe('set_show', (value) => {
        pages.update('show', value);
        navigation.update('select', value);
      })
    );

    this.pages.set('show', this.get('show'));
    this.navigation.set('select', this.get('show'));
    this.set('position', this.get('position'));

    this.pages_subscriptions = subs;
  },

  getButtonForPage: function (page) {
    return this.page_to_button.get(page);
  },

  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    /**
     * The main DIV element. Has the class <code>.aux-pager</code>.
     *
     * @member Pager#element
     */
    this.pages_subscriptions = initSubscriptions();
    this.page_to_button = new Map();
  },

  initialized: function () {
    Container.prototype.initialized.call(this);
    this.addPages(this.options.pages);
    this.set('position', this.options.position);
    this.set('show', this.options.show);
  },
  draw: function (O, element) {
    addClass(element, 'aux-pager');

    Container.prototype.draw.call(this, O, element);
  },

  removeChild: function (child) {
    if (child instanceof Pages) {
      if (this.pages === child) {
        this.pages.element.remove();
        this.pages = null;
        this.initializePages();
      }
    } else if (child instanceof Navigation) {
      if (this.navigation === child) {
        this.navigation.element.remove();
        this.navigation = null;
        this.initializePages();
      }
    }

    Container.prototype.removeChild.call(this, child);
  },

  addChild: function (child) {
    Container.prototype.addChild.call(this, child);

    if (child instanceof Pages) {
      if (this.pages && this.pages !== child) {
        // this.pages is being replaced by a new instance (set by the user)
        this.removeChild(this.pages);
      }

      this.pages = child;
      this.initializePages();
    }
  },

  redraw: function () {
    Container.prototype.redraw.call(this);
    const O = this.options;
    const I = this.invalid;
    const E = this.element;

    if (I.position) {
      I.position = false;
      removeClass(
        E,
        'aux-top',
        'aux-right',
        'aux-bottom',
        'aux-left',
        'aux-vertical',
        'aux-horizontal'
      );
      switch (O.position) {
        case 'top':
          addClass(E, 'aux-top', 'aux-vertical');
          break;
        case 'bottom':
          addClass(E, 'aux-bottom', 'aux-vertical');
          break;
        case 'left':
          addClass(E, 'aux-left', 'aux-horizontal');
          break;
        case 'right':
          addClass(E, 'aux-right', 'aux-horizontal');
          break;
        default:
          warn('Unsupported position', O.position);
      }
    }
  },

  /**
   * Adds an array of pages.
   *
   * @method Pager#addPages
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
   * p.addPages([
   *   {
   *     label: "Page 1",
   *     icon: "gear",
   *     content: "<h1>Page1</h1>",
   *   }
   * ]);
   *
   */
  addPages: function (pages) {
    if (!Array.isArray(pages))
      throw new TypeError('Expected array of objects.');

    for (let i = 0; i < pages.length; i++) {
      if (typeof pages[i] !== 'object') {
        throw new TypeError('Expected array of objects.');
      }

      const options = Object.assign({}, pages[i]);
      const content = options.content;
      delete options.content;

      this.addPage(options, content);
    }
  },

  /**
   * Adds a {@link Container} to the pager and a corresponding {@link Button}
   *   to the pagers {@link Navigation}.
   *
   * @method Pager#addPage
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
  addPage: function (buttonOptions, content, options, position) {
    const p = this.pages.addPage(content, position, options);

    const button = this.getButtonForPage(p);

    if (typeof buttonOptions === 'string') {
      p.set('label', buttonOptions);
    } else if (typeof buttonOptions === 'object') {
      const label = buttonOptions.label;

      if (label) p.set('label', label);

      for (const key in buttonOptions) {
        if (Object.prototype.hasOwnProperty.call(buttonOptions, key))
          button.set(key, buttonOptions[key]);
      }
    } else {
      throw new TypeError('Unsupported API.');
    }

    return p;
  },

  /**
   * Removes a page from the Pager.
   *
   * @method Pager#removePage
   *
   * @param {integer|Container} page - The container to remove. Either an
   *   index or the {@link Container} widget generated by <code>addPage</code>.
   *
   * @emits Pager#removed
   */
  removePage: function (page) {
    this.pages.removePage(page);
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
  first: function () {
    if (this.pages.getPages().length) {
      this.set('show', 0);
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
  last: function () {
    if (this.pages.getPages().length) {
      this.set('show', this.pages.getPages().length - 1);
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
  next: function () {
    const c = this.options.show;
    return this.set('show', c + 1) !== c;
  },
  /**
   * Opens the previous page of the pager. Returns <code>true</code> if a
   * previous page exists, <code>false</code> otherwise.
   *
   * @method Pager#prev
   */
  prev: function () {
    const c = this.options.show;
    return this.set('show', c - 1) !== c;
  },

  getPages: function () {
    return this.pages.getPages();
  },
});

/**
 * The {@link Navigation} instance acting as the menu.
 *
 * @member Pager#navigation
 */
defineChildWidget(Pager, 'navigation', {
  create: Navigation,
  show: true,
  map_options: {
    show: 'select',
  },
  static_events: {
    userset: function (key, value) {
      if (key == 'select') {
        this.parent.userset('show', value);
      } else {
        this.parent.userset(key, value);
      }
      return false;
    },
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

defineChildWidget(Pager, 'pages', {
  create: Pages,
  show: true,
  inherit_options: true,
  //static_events: {
  //"added" : function (p) { this.emit("added", p); },
  //"removed" : function (p) { this.emit("removed", p); },
  //},
  blacklist_options: ['pages'],
});

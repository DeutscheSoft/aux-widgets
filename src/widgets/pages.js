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
 * @event Pages#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
import { defineClass } from '../widget_helpers.js';
import { addClass, removeClass, isDomNode } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import { Container } from './container.js';
import { ChildWidgets } from '../utils/child_widgets.js';

function onPageSetActive(value) {
  const pages = this.parent;

  if (value) {
    const index = pages.getPages().indexOf(this);
    pages.showChild(this);
    pages.update('show', index);
    /**
     * The page to show has changed.
     *
     * @param {Page} page - The {@link Page} instance of the newly selected page.
     * @param {number} id - The ID of the page.
     *
     * @event Pages#changed
     */
    pages.emit('changed', this, index);
  } else {
    pages.hideChild(this);
  }
}

function onPageAdded(page, position) {
  const pages = this.widget;

  page.addClass('aux-page');
  page.on('set_active', onPageSetActive);

  const current = pages.current();

  if (page.get('active')) {
    pages.set('show', position);
  } else {
    let show = pages.get('show');

    // if the current active page has been moved, we have to update the
    // show property
    if (show >= position && show >= 0 && show < this.getList().length - 1) {
      ++show;
    }

    // update all pages active option, possibly also that of the new page
    pages.set('show', show);
  }

  // the new page is active
  if (page.get('active')) {
    // we don't want any animation
    if (current && current !== page) pages.hideChild(current);

    // we do not want to animate pages when they are being added
    if (pages.isDrawn()) page.set('visible', true);
    pages.showChild(page);
  } else {
    page.forceHide();
  }

  /**
   * A page was added to the Pages.
   *
   * @event Pages#added
   *
   * @param {Page} page - The {@link Page} which was added as a page.
   */
  pages.emit('added', page, position);
}

function onPageRemoved(page, position) {
  const pages = this.widget;

  page.removeClass('aux-page');
  page.off('set_active', onPageSetActive);

  const show = pages.get('show');
  const length = this.getList().length;

  if (position < show) {
    pages.set('show', show - 1);
  } else if (position === show) {
    if (show < length) {
      // show the next page
      pages.set('show', show);
    } else if (length) {
      // show the previous page
      pages.set('show', show - 1);
    } else {
      pages.set('show', -1);
    }
  }
  /**
   * A page was removed from the Pages
   *
   * @event Pages#removed
   *
   * @param {Page} page - The {@link Page} which was removed.
   * @param {number} index - The index at which the container was.
   */
  pages.emit('removed', page, position);
}

export const Pages = defineClass({
  /**
   * Pages contains different pages ({@link Page}s) which can
   * be swiched via option.
   *
   * @class Pages
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Array<Page|DOMNode|String>} [options.pages=[]] -
   *   An array of either an instance of {@link Page} (or derivate),
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
   *   {
   *    content: document.createElement("span"),
   *   },
   *   {
   *    content: "<h1>Foobar</h1><p>Lorem ipsum dolor sit amet</p>",
   *   }
   *  ]
   * });
   */
  Extends: Container,
  _options: Object.assign({}, Container.getOptionTypes(), {
    direction: 'string',
    pages: 'array',
    show: 'int',
    animation: 'string',
  }),
  options: {
    direction: 'forward',
    pages: [],
    show: -1,
    animation: 'horizontal',
  },
  static_events: {
    set_show: function (value) {
      const list = this.pages.getList();

      for (let i = 0; i < list.length; i++) {
        const page = list[i];
        page.update('active', i === value);
      }
    },
  },

  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    /**
     * The main DIV element. Has the class <code>.aux-pages</code>.
     *
     * @member Pages#element
     */
    this.pages = new ChildWidgets(this, {
      filter: Page,
    });
    this.pages.on('child_added', onPageAdded);
    this.pages.on('child_removed', onPageRemoved);
  },

  initialized: function () {
    Container.prototype.initialized.call(this);
    this.addPages(this.options.pages);
    this.set('show', this.options.show);
  },
  draw: function (O, element) {
    addClass(element, 'aux-pages');

    Container.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    Container.prototype.redraw.call(this);
    const O = this.options;
    const I = this.invalid;
    const E = this.element;

    if (I.direction) {
      I.direction = false;
      removeClass(E, 'aux-forward', 'aux-backward');
      addClass(E, 'aux-' + O.direction);
    }

    if (I.animation) {
      I.animation = false;
      removeClass(E, 'aux-vertical', 'aux-horizontal');
      switch (O.animation) {
        case 'vertical':
          addClass(E, 'aux-vertical');
          break;
        case 'horizontal':
          addClass(E, 'aux-horizontal');
          break;
        default:
          warn('Unsupported animation', O.animation);
      }
    }

    if (I.show) {
      I.show = false;
      const pages = this.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (i === O.show) page.addClass('aux-active');
        else page.removeClass('aux-active');
      }
    }
  },

  /**
   * Adds an array of pages.
   *
   * @method Pages#addPages
   *
   * @property {Array<Page|DOMNode|String>} [options.pages=[]] -
   *   An array of either an instance of {@link Page} (or derivate),
   *   a DOMNode or a string which gets wrapped in a new {@link Page}.
   *
   * @example
   * var p = new Pages();
   * p.addPages(['foobar']);
   *
   */
  addPages: function (pages) {
    for (let i = 0; i < pages.length; i++) this.addPage(pages[i]);
  },

  createPage: function (content, options) {
    if (typeof content === 'string' || content === void 0) {
      if (!options) options = {};
      const page = new Page(options);
      page.element.innerHTML = content;
      return page;
    } else if (isDomNode(content)) {
      if (content.tagName === 'TEMPLATE') {
        content = content.content.cloneNode(true);
      }

      if (content.remove) content.remove();

      if (!options) options = {};
      const page = new Page(options);

      page.element.appendChild(content);

      return page;
    } else if (content instanceof Page) {
      return content;
    } else {
      throw new TypeError('Unexpected argument type.');
    }
  },

  /**
   * Adds a {@link Page} to the pages and a corresponding {@link Button}
   *   to the pages {@link Navigation}.
   *
   * @method Pages#addPage
   *
   * @param {Page|DOMNode|String} content - The content of the page.
   *   Either an instance of a {@link Page} (or derivate) widget,
   *   a DOMNode or a string of HTML which gets wrapped in a new {@link Container}
   *   with optional options from argument `options`.
   * @param {integer|undefined} position - The position to add the new
   *   page to. If undefined, the page is added at the end.
   * @param {Object} [options={ }] - An object containing options for
   *   the {@link Page} to be added as page if `content` is
   *   either a string or a DOMNode.
   * @emits Pages#added
   */
  addPage: function (content, position, options) {
    const page = this.createPage(content, options);
    const pages = this.getPages();
    const element = this.element;
    const length = pages.length;

    if (position !== void 0 && typeof position !== 'number')
      throw new TypeError('position: Argument must be a number.');

    if (!(position >= 0 && position < length)) {
      element.appendChild(page.element);
    } else {
      element.insertBefore(page.element, pages[position].element);
    }

    if (page.parent !== this) {
      // if this page is a web component, the above appendChild would have
      // already triggered a call to addChild
      this.addChild(page);
    }

    return page;
  },
  /**
   * Removes a page from the Pages.
   *
   * @method Pages#removePage
   *
   * @param {integer|Page} page - The container to remove. Either an
   *   index or the {@link Page} widget generated by <code>addPage</code>.
   * @param {Boolean} destroy - destroy the {@link Page} after removal.
   *
   * @emits Pages#removed
   */
  removePage: function (page, destroy) {
    let position = -1;

    if (page instanceof Page) {
      position = this.pages.indexOf(page);
    } else if (typeof page === 'number') {
      position = page;
      page = this.pages.at(position);
    }

    if (!page || position === -1) throw new Error('Unknown page.');

    this.element.removeChild(page.element);

    if (this.pages.at(position) === page) {
      // NOTE: if we remove a child which is a web component,
      // it will itself call removeChild
      this.removeChild(page);
    }

    if (destroy) page.destroy();
  },

  /**
   * Removes all pages.
   *
   * @method Pages#empty
   */
  empty: function () {
    while (this.getPages().length) this.removePage(0);
  },

  current: function () {
    /**
     * Returns the currently displayed page or null.
     *
     * @method Pages#current
     */
    return this.pages.at(this.options.show) || null;
  },

  /**
   * Opens the first page of the pages. Returns <code>true</code> if a
   * first page exists, <code>false</code> otherwise.
   *
   * @method Pages#first
   *
   * @returns {Boolean} True if successful, false otherwise.
   */
  first: function () {
    if (this.getPages().length) {
      this.set('show', 0);
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
  last: function () {
    const length = this.getPages().length;
    if (length) {
      this.set('show', length - 1);
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
  next: function () {
    const show = this.options.show;
    const length = this.getPages().length;

    if (show + 1 < length) {
      this.set('show', show + 1);
      return true;
    }

    return false;
  },
  /**
   * Opens the previous page of the pages. Returns <code>true</code> if a
   * previous page exists, <code>false</code> otherwise.
   *
   * @method Pages#prev
   *
   * @returns {Boolean} True if successful, false otherwise.
   */
  prev: function () {
    const show = this.options.show;
    const length = this.getPages().length;

    if (show === 0) return false;

    this.set('show', show - 1);

    return show - 1 < length;
  },

  set: function (key, value) {
    if (key === 'show') {
      if (value !== this.options.show) {
        if (value > this.options.show) {
          this.set('direction', 'forward');
        } else {
          this.set('direction', 'backward');
        }
      }
    } else if (key === 'pages') {
      this.options.pages.forEach((page) => this.removePage(page, true));
      value = this.addPages(value || []);
    }
    return Container.prototype.set.call(this, key, value);
  },
  getPages: function () {
    return this.pages.getList();
  },
});

export const Page = defineClass({
  /**
   * Page is the child widget to be used in {@link Pages}.
   *
   * @class Page
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {String} [options.label=""] - The label of the pages corresponding button
   * @property {Number} [options.hiding_duration=-1] - Default to auto-determine hiding duration from style.
   * @property {Number} [options.showing_duration=-1] - Default to auto-determine showing duration from style.
   *
   * @extends Container
   */
  Extends: Container,
  _options: Object.assign({}, Container.getOptionTypes(), {
    label: 'string',
    icon: 'string',
  }),
  options: {
    label: '',
    icon: '',
    hiding_duration: -1,
    showing_duration: -1,
  },
});

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

/* jshint -W014 */
/* jshint -W079 */

import { defineChildWidget } from '../child_widget.js';
import { Container } from './container.js';
import { Icon } from './icon.js';
import { Label } from './label.js';
import { Button } from './button.js';
import { Drag } from '../modules/drag.js';
import { Resize } from '../modules/resize.js';
import { setGlobalCursor, unsetGlobalCursor } from '../utils/global_cursor.js';
import { translateAnchor } from '../utils/anchor.js';
import {
  addClass,
  removeClass,
  outerWidth,
  outerHeight,
  positionLeft,
  positionTop,
  width as viewportWidth,
  innerWidth,
  innerHeight,
  height as viewportHeight,
  toggleClass,
  setContent,
} from '../utils/dom.js';
import { defineRender, defineMeasure, deferRender } from '../renderer.js';

function headerAction() {
  const that = this.parent;
  switch (that.options.header_action) {
    case 'shrink':
      that.toggleShrink();
      break;
    case 'maximize':
      that.toggleMaximize();
      break;
    case 'maximizehorizontal':
      that.toggleMaximizeHorizontal();
      break;
    case 'maximizevertical':
      that.toggleMaximizeVertical();
      break;
    case 'minimize':
      that.toggleMinimize();
      break;
    case 'close':
      that.destroyAndRemove();
      break;
  }
  /**
   * The user double-clicked on the header.
   * @event Window.headeraction
   * @param {string} action - The function which was executed, e.g. <code>shrink</code>, <code>maximize</code> or <code>close</code>.
   */
  that.emit('headeraction', that.options.header_action);
}
function mout() {
  if (this.options.auto_active && !this.dragging && !this.resizing)
    removeClass(this.element, 'aux-active');
}
function mover() {
  if (this.options.auto_active) addClass(this.element, 'aux-active');
}
function maxHeight() {
  // returns the max height of the window
  return this.options.max_height < 0
    ? Number.MAX_SAFE_INTEGER
    : this.options.max_height;
}
function maxWidth() {
  // returns the max width of the window
  return this.options.max_width < 0
    ? Number.MAX_SAFE_INTEGER
    : this.options.max_width;
}

function maxSize(size) {
  return size < 0 ? Number.MAX_SAFE_INTEGER : size;
}

function clipSize(size, min, max) {
  return Math.min(maxSize(max), Math.max(size, min));
}

function close() {
  /**
   * The user clicked the close button.
   * @event Window.closeclicked
   */
  this.emit('closeclicked');
  if (this.options.auto_close) {
    this.destroyAndRemove();
  }
}
function maximize() {
  if (this.options.auto_maximize) this.toggleMaximize();
  /**
   * The user clicked the maximize button.
   * @event Window.maximizeclicked
   * @param {Object} maximize - The maximize option.
   */
  this.emit('maximizeclicked', this.options.maximize);
}
function maximizeVertical() {
  if (this.options.auto_maximize) this.toggleMaximizeVertical();
  /**
   * The user clicked the maximize-vertical button.
   * @event Window.maximizeverticalclicked
   * @param {Object} maximize - The maximize option.
   */
  this.emit('maximizeverticalclicked', this.options.maximize.y);
}
function maximizeHorizontal() {
  if (this.options.auto_maximize) this.toggleMaximizeHorizontal();
  /**
   * The user clicked the maximize-horizontal button.
   * @event Window.maximizehorizontalclicked
   * @param {Object} maximize - The maximize option.
   */
  this.emit('maximizehorizontalclicked', this.options.maximize.x);
}
function minimize() {
  if (this.options.auto_minimize) this.toggleMinimize();
  /**
   * The user clicked the minimize button.
   * @event Window.minimizeclicked
   * @param {Object} minimize - The minimize option.
   */
  this.emit('minimizeclicked', this.options.minimize);
}
function shrink() {
  if (this.options.auto_shrink) this.toggleShrink();
  /**
   * The user clicked the shrink button.
   * @event Window.shrinkclicked
   * @param {Object} shrink - The shrink option.
   */
  this.emit('shrinkclicked', this.options.shrink);
}
function startResize(el, ev) {
  setGlobalCursor('se-resize');
  this.resizing = true;
  addClass(this.element, 'aux-resizing');
  /**
   * The user starts resizing the window.
   * @event Window.startresize
   * @param {DOMEvent} event - The DOM event.
   */
  this.emit('startresize', ev);
}
function stopResize(el, ev) {
  unsetGlobalCursor('se-resize');
  this.resizing = false;
  removeClass(this.element, 'aux-resizing');
  this.triggerResizeChildren();
  calculateDimensions.call(this);
  /**
   * The user stops resizing the window.
   * @event Window.stopresize
   * @param {DOMEvent} event - The DOM event.
   */
  this.emit('stopresize', ev);
}
function resizing(el, ev) {
  if (this.options.resizing === 'continuous') {
    this.triggerResizeChildren();
    calculateDimensions.call(this);
  }
  /**
   * The user resizes the window.
   * @event Window.resizing
   * @param {DOMEvent} event - The DOM event.
   */
  this.emit('resizing', ev);
}
function calculateDimensions() {
  const x = outerWidth(this.element, true);
  const y = outerHeight(this.element, true);
  this.dimensions.width = this.options.width = x;
  this.dimensions.height = this.options.height = y;
  this.dimensions.x2 = x + this.dimensions.x1;
  this.dimensions.y2 = y + this.dimensions.y1;
}
function calculatePosition() {
  const posx = positionLeft(this.element);
  const posy = positionTop(this.element);
  const pos1 = translateAnchor(
    this.options.anchor,
    posx,
    posy,
    this.options.width,
    this.options.height
  );
  this.dimensions.x = this.options.x = pos1.x;
  this.dimensions.y = this.options.y = pos1.y;
  this.dimensions.x1 = posx;
  this.dimensions.y1 = posy;
  this.dimensions.x2 = posx + this.dimensions.width;
  this.dimensions.y2 = posy + this.dimensions.height;
}
function horizMax() {
  // returns true if maximized horizontally
  return this.options.maximize.x;
}
function vertMax() {
  // returns if maximized vertically
  return this.options.maximize.y;
}
function startDrag(ev) {
  setGlobalCursor('move');
  addClass(this.element, 'aux-dragging');
  // if window is maximized, we have to replace the window according
  // to the position of the mouse
  let y = 0,
    x = 0;
  if (vertMax.call(this)) {
    y = !this.options.fixed ? window.scrollY : 0;
  }
  if (horizMax.call(this)) {
    x = ev.clientX - (ev.clientX / viewportWidth()) * this.options.width;
    x += !this.options.fixed ? window.scrollX : 0;
  }
  const pos = translateAnchor(
    this.options.anchor,
    x,
    y,
    this.options.width,
    this.options.height
  );

  if (horizMax.call(this)) this.options.x = pos.x;
  if (vertMax.call(this)) this.options.y = pos.y;

  this.drag._xpos += x;
  this.drag._ypos += y;

  /**
   * The user starts dragging the window.
   * @event Window.startdrag
   * @param {DOMEvent} event - The DOM event.
   */
  this.emit('startdrag', ev);
}
function stopDrag(ev) {
  this.dragging = false;
  calculatePosition.call(this);
  unsetGlobalCursor('move');
  /**
   * The user stops dragging the window.
   * @event Window.stopdrag
   * @param {DOMEvent} event - The DOM event.
   */
  this.emit('stopdrag', ev);
}
function dragging(ev) {
  if (!this.dragging) {
    this.dragging = true;
    // un-maximize
    if (horizMax.call(this)) {
      this.set('maximize', { x: false });
    }
    if (vertMax.call(this)) {
      this.set('maximize', { y: false });
    }
  }
  calculatePosition.call(this);
  /**
   * The user is dragging the window.
   * @event Window.dragging
   * @param {DOMEvent} event - The DOM event.
   */
  this.emit('dragging', ev);
}
function buildHeader() {
  buildFromConst.call(this, 'header');
  if (!this.drag) {
    this.drag = new Drag({
      node: this.element,
      handle: this.header.element,
      onStartdrag: startDrag.bind(this),
      onStopdrag: stopDrag.bind(this),
      onDragging: dragging.bind(this),
      min: { x: 0 - this.options.width + 20, y: 0 },
      max: { x: viewportWidth() - 20, y: viewportHeight() - 20 },
    });
    //this.header.on("dblclick", headerAction.bind(this));
  }
  /**
   * The header changed.
   * @event Window.headerchanged
   */
  this.emit('headerchanged');
}
function buildFooter() {
  buildFromConst.call(this, 'footer');
  /**
   * The footer changed.
   * @event Window.footerchanged
   */
  this.emit('footerchanged');
}
function buildFromConst(element) {
  const E = this[element].element;
  const L = this.options[element];
  const O = this.options;
  while (E.firstChild) E.firstChild.remove();
  if (!L) return;
  for (let i = 0; i < L.length; i++) {
    if (L[i] !== 'spacer') {
      this.set('show_' + L[i], true);
      E.appendChild(this[L[i]].element);
      if (L[i] === 'size' && !this.resize && this.size) {
        this.resize = new Resize({
          node: this.element,
          handle: this.size.element,
          min: { x: O.min_width, y: O.min_height },
          max: { x: maxWidth.call(this), y: maxHeight.call(this) },
          onResizestart: startResize.bind(this),
          onResizestop: stopResize.bind(this),
          onResizing: resizing.bind(this),
          active: O.resizable,
        });
      }
    } else {
      E.appendChild(element('div', 'aux-spacer'));
    }
  }
}

function statusTimeout() {
  const O = this.options;
  if (this.__status_to !== false) window.clearTimeout(this.__status_to);
  if (!O.hide_status) return;
  if (O.status)
    this.__status_to = window.setTimeout(
      function () {
        this.set('status', '');
        this.__status_to = false;
      }.bind(this),
      O.hide_status
    );
}

/**
 * This widget is a flexible overlay window.
 *
 * @class Window
 *
 * @extends Container
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.width=500] - Initial width, can be a CSS length or an integer (pixels).
 * @property {Number} [options.height=200] - Initial height, can be a CSS length or an integer (pixels).
 * @property {Number} [options.x=0] - X position of the window.
 * @property {Number} [options.y=0] - Y position of the window.
 * @property {Number} [options.min_width=64] - Minimum width of the window.
 * @property {Number} [options.max_width=-1] - Maximum width of the window, -1 ~ infinite.
 * @property {Number} [options.min_height=64] - Minimum height of the window.
 * @property {Number} [options.max_height=-1] - Maximum height of the window, -1 ~ infinite.
 * @property {String} [options.anchor="top-left"] - Anchor of the window, can be one out of
 *   `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right`
 * @property {Boolean} [options.modal=false] - If modal window blocks all other elements
 * @property {String} [options.dock=false] - Docking of the window, can be one out of
 *   `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right`
 * @property {Object|Boolean} [options.maximize=false] - Boolean or object with members <code>x</code> and <code>y</code> as boolean to determine the maximized state.
 * @property {Boolean} [options.minimize=false] - Minimize window (does only make sense with a
 *   window manager application to keep track of it)
 * @property {Boolean} [options.shrink=false] - Shrink rolls the window up into the title bar.
 * @property {String|HTMLElement|Container} [options.content=""] - The content of the window.
 *   Can be either a string, a HTMLElement or a {@link Container} to append to the content area.
 * @property {String} [options.open="center"] - initial position of the window, can be one out of
 *   `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right`
 * @property {Integer} [options.z_index=10000] - Z index for piling windows. does make more sense
 *   when used together with a window manager
 * @property {String|Array<String>} [options.header=["title", "maximize", "close"]] - Single element or array of
 *   `title`, `icon`, `close`, `minimize`, `shrink`, `maximize`, `maximizevertical`, `maximizehorizontal`, `status`, `resize`, `spacer`.
 * @property {String|Array<String>} [options.footer=false] - Single element or array of
 *   `title`, `icon`, `close`, `minimize`, `shrink`, `maximize`, `maximizevertical`, `maximizehorizontal`, `status`, `resize`, `spacer`.
 * @property {String} [options.title=false] - Window title.
 * @property {String} [options.status=false] Window status.
 * @property {String} [options.icon=false] URL to window icon.
 * @property {Boolean} [options.fixed=true] - Whether the window sticks to the viewport rather than the document
 * @property {Boolean} [options.auto_active=false] - Auto-toggle the active-class when mouseovered
 * @property {Boolean} [options.auto_close=true] - Set whether close destroys the window or not
 * @property {Boolean} [options.auto_maximize=true] - Set whether maximize toggles the window or not
 * @property {Boolean} [options.auto_minimize=true] - Set whether minimize toggles the window or not
 * @property {Boolean} [options.auto_shrink=true] - Set whether shrink toggles the window or not
 * @property {Boolean} [options.draggable=true] - Set whether the window is draggable
 * @property {Boolean} [options.resizable=true] - Set whether the window is resizable
 * @property {String} [options.resizing="continuous"] - Resizing policy, `continuous` or `stop`.
 *   The first one resizes all children continuously while resizing.
 * @property {String} [options.header_action="maximize"] - Action for double clicking the window header, one out of
 *   `close`, `minimize`, `shrink`, `maximize`, `maximizevertical`, `maximizehorizontal`
 * @property {Boolean} [options.active=true] - Active state of the window.
 * @property {Integer} [options.hide_status=0] - If set to !0 status message hides after [n] milliseconds.
 */

/**
 * @member {Drag} Window#drag - The {@link Drag} module.
 */
/**
 * @member {Resize} Window#resize - The {@link Resize} module.
 */

export class Window extends Container {
  static get _options() {
    return {
      width: 'number',
      height: 'number',
      x: 'number',
      y: 'number',
      min_width: 'number',
      max_width: 'number',
      min_height: 'number',
      max_height: 'number',
      anchor: 'string',
      modal: 'boolean',
      dock: 'boolean',
      maximize: 'boolean',
      minimize: 'boolean',
      shrink: 'boolean',
      open: 'int',
      z_index: 'int',
      header: 'array',
      footer: 'array',
      title: 'string',
      status: 'string',
      icon: 'string',
      fixed: 'boolean',
      auto_active: 'boolean',
      auto_close: 'boolean',
      auto_maximize: 'boolean',
      auto_minimize: 'boolean',
      auto_shrink: 'boolean',
      draggable: 'boolean',
      resizable: 'boolean',
      resizing: 'int',
      header_action: 'string',
      active: 'boolean',
      hide_status: 'int',
    };
  }

  static get options() {
    return {
      width: 500,
      height: 200,
      x: 0,
      y: 0,
      min_width: 64,
      max_width: -1,
      min_height: 64,
      max_height: -1,
      anchor: 'top-left',
      modal: false,
      dock: false,
      maximize: false,
      minimize: false,
      shrink: false,
      content: '',
      open: 'center',
      z_index: 10000,
      header: ['title', 'maximize', 'close'],
      footer: false,
      title: false,
      status: false,
      icon: false,
      fixed: true,
      auto_active: false,
      auto_close: true,
      auto_maximize: true,
      auto_minimize: true,
      auto_shrink: true,
      draggable: true,
      resizable: true,
      resizing: 'continuous',
      header_action: 'maximize',
      active: true,
      hide_status: 0,
      role: 'dialog',
    };
  }

  static get static_events() {
    return {
      mouseenter: mover,
      mouseleave: mout,
    };
  }

  static get renderers() {
    return [
      defineMeasure(
        [
          'width',
          'height',
          'min_width',
          'min_height',
          'max_width',
          'max_height',
          'maximize',
        ],
        function (
          width,
          height,
          min_width,
          min_height,
          max_width,
          max_height,
          maximize
        ) {
          const { dimensions, element } = this;
          let setWidth, setHeight;

          if (width >= 0) {
            width = clipSize(width, min_width, max_width);
            this.set('width', width);
            if (maximize.x) {
              dimensions.width = viewportWidth();
            } else {
              dimensions.width = width;
            }
            setWidth = true;
          } else {
            dimensions.width = outerWidth(element);
          }
          if (height >= 0) {
            height = clipSize(height, min_height, max_height);
            if (maximize.y) {
              dimensions.height = viewportHeight();
            } else {
              dimensions.height = height;
            }
            setHeight = true;
          } else {
            dimensions.height = outerHeight(element, true);
          }
          dimensions.x2 = dimensions.x1 + dimensions.width;
          dimensions.y2 = dimensions.y1 + dimensions.height;
          /**
           * The dimensions of the window changed.
           * @event Window.dimensionschanged
           * @param {Object} event - The {@link Window#dimensions} dimensions object.
           */
          this.emit('dimensionschanged', this.dimensions);

          if (!setWidth && !setHeight) return null;

          return deferRender(() => {
            if (setWidth) outerWidth(element, true, dimensions.width);
            if (setHeight) outerHeight(element, true, dimensions.height);

            this.triggerResize();
          });
        }
      ),
      defineMeasure(
        [
          'anchor',
          'x',
          'y',
          '_inner_width',
          '_inner_height',
          'maximize',
          'fixed',
        ],
        function (anchor, x, y, _inner_width, _inner_height, maximize, fixed) {
          const { element, dimensions } = this;

          const pos = translateAnchor(
            anchor,
            x,
            y,
            -_inner_width,
            -_inner_height
          );

          const left = maximize.x ? (fixed ? 0 : window.scrollX) : pos.x;
          const top = maximize.y ? (fixed ? 0 : window.scrollY) : pos.y;

          Object.assign(dimensions, {
            x,
            y,
            x1: pos.x,
            y1: pos.y,
            x2: pos.x + dimensions.width,
            y2: pos.y + dimensions.height,
          });
          /**
           * The position of the window changed.
           * @event Window.positionchanged
           * @param {Object} event - The {@link Window#dimensions} dimensions object.
           */
          this.emit('positionchanged', dimensions);

          return deferRender(() => {
            element.style.left = left + 'px';
            element.style.top = top + 'px';
          });
        }
      ),
      defineRender('maximize', function (maximize) {
        toggleClass(this.element, 'aux-maximized-horizontal', maximize.x);
        toggleClass(this.element, 'aux-maximized-vertical', maximize.y);
      }),
      defineRender('z_index', function (z_index) {
        this.element.style.zIndex = z_index;
      }),
      defineRender(['header', 'show_header'], function (header, show_header) {
        if (header && show_header) buildHeader.call(this);
      }),
      defineRender(['footer', 'show_footer'], function (footer, show_footer) {
        if (footer && show_footer) buildFooter.call(this);
      }),
      defineMeasure(['status', 'hide_status'], function (status, hide_status) {
        statusTimeout.call(this);
      }),
      defineRender('fixed', function (fixed) {
        this.element.style.position = fixed ? 'fixed' : 'absolute';
      }),
      defineRender('active', function (active) {
        toggleClass(this.element, 'aux-active', active);
      }),
      defineRender('shrink', function (shrink) {
        toggleClass(this.element, 'aux-shrinked', shrink);
      }),
      defineRender('draggable', function (draggable) {
        toggleClass(this.element, 'aux-draggable', draggable);
      }),
      defineRender('resizable', function (resizable) {
        toggleClass(this.element, 'aux-resizable', resizable);
      }),
      defineRender('content', function (content) {
        if (content) {
          if (
            Object.prototype.isPrototypeOf.call(Container.prototype, content)
          ) {
            setContent(this.content.element, '');
            this.appendChild(content);
          } else {
            setContent(this.content.element, content);
          }
        }
        this.triggerResize();
      }),
    ];
  }

  initialize(options) {
    this.dimensions = {
      anchor: 'top-left',
      x: 0,
      x1: 0,
      x2: 0,
      y: 0,
      y1: 0,
      y2: 0,
      width: 0,
      height: 0,
    };
    super.initialize(options);
    this.__status_to = false;
    this.set('maximize', this.options.maximize);
    this.set('minimize', this.options.minimize);
  }

  /**
   * Appends a new child to the window content area.
   * @method Window#appendChild
   * @param {Widget} child - The child widget to add to the windows content area.
   */
  appendChild(child) {
    this.content.appendChild(child.element);
    this.addChild(child);
  }

  /**
   * Toggles the overall maximize state of the window.
   * @method Window#toggleMaximize
   * @param {Boolean} maximize - State of maximization. If window is already
   *   maximized in one or both directions it is un-maximized, otherwise maximized.
   */
  toggleMaximize() {
    if (!vertMax.call(this) || !horizMax.call(this))
      this.set('maximize', { x: true, y: true });
    else this.set('maximize', { x: false, y: false });
  }

  /**
   * Toggles the vertical maximize state of the window.
   * @method Window#toggleMaximizeVertical
   * @param {Boolean} maximize - The new vertical maximization.
   */
  toggleMaximizeVertical() {
    this.set('maximize', { y: !this.options.maximize.y });
  }

  /**
   * Toggles the horizontal maximize state of the window.
   * @method Window#toggleMaximizeHorizontal
   * @param {Boolean} maximize - The new horizontal maximization.
   */
  toggleMaximizeHorizontal() {
    this.set('maximize', { x: !this.options.maximize.x });
  }

  /**
   * Toggles the minimize state of the window.
   * @method Window#toggleMinimize
   * @param {Boolean} minimize - The new minimization.
   */
  toggleMinimize() {
    this.set('minimize', !this.options.minimize);
  }

  /**
   * Toggles the shrink state of the window.
   * @method Window#toggleShrink
   * @param {Boolean} shrink - The new shrink state.
   */
  toggleShrink() {
    this.set('shrink', !this.options.shrink);
  }

  getResizeTargets() {
    return [this.element];
  }

  resize() {
    this.drag.set('min', { x: 0 - this.options.width + 20, y: 0 });
    this.drag.set('max', { x: viewportWidth() - 20, y: viewportHeight() - 20 });
    this.set('_inner_width', innerWidth(this.element));
    this.set('_inner_height', innerHeight(this.element));
    super.resize();
  }

  draw(O, element) {
    addClass(element, 'aux-window');

    super.draw(O, element);

    const { open, width, height, fixed, anchor } = O;

    if (open) {
      const x0 = fixed ? 0 : window.scrollX;
      const y0 = fixed ? 0 : window.scrollY;
      const pos1 = translateAnchor(
        open,
        x0,
        y0,
        window.innerWidth - width,
        window.innerHeight - height
      );
      const pos2 = translateAnchor(anchor, pos1.x, pos1.y, width, height);
      this.set('x', pos2.x);
      this.set('y', pos2.y);
    }
  }

  set(key, value) {
    if (key === 'maximize') {
      if (value === false) value = { x: false, y: false };
      else if (value === true) value = { x: true, y: true };
      else value = Object.assign({}, this.get('maximize'), value);
    }

    value = super.set(key, value);

    switch (key) {
      case 'maximize':
        if ((value.y || value.x) && this.get('shrink')) {
          this.set('shrink', false);
        }
        break;
      case 'shrink': {
        const maximize = this.get('maximize');
        if (value && maximize.y) {
          this.set('maximize', { y: false });
        }
        break;
      }
      case 'minimize':
        this.set('visible', !value);
        break;
      case 'resizable':
        this.resize.set('active', value);
        break;
    }

    return value;
  }
}

/**
 * @member {Icon} Window#icon - A {@link Icon} widget to display the window icon.
 */
defineChildWidget(Window, 'icon', {
  create: Icon,
  map_options: { icon: 'icon' },
  toggle_class: true,
});
/**
 * @member {Label} Window#title - A {@link Label} to display the window title.
 */
defineChildWidget(Window, 'title', {
  create: Label,
  default_options: { class: 'aux-title' },
  map_options: { title: 'label' },
  toggle_class: true,
});
/**
 * @member {Label} Window#status - A {@link Label} to display the window status.
 */
defineChildWidget(Window, 'status', {
  create: Label,
  default_options: { class: 'aux-status' },
  map_options: { status: 'label' },
  toggle_class: true,
});
/**
 * @member {Button} Window#close - The close button.
 */
/**
 * @member {Button} Window#minimize - The minimize button.
 */
/**
 * @member {Button} Window#maximize - The maximize button.
 */
/**
 * @member {Button} Window#maximizevertical - The maximizevertical button.
 */
/**
 * @member {Button} Window#maximizehorizontal - The maximizehorizontal button.
 */
/**
 * @member {Button} Window#shrink - The shrink button.
 */

function bFactory(name, handler) {
  defineChildWidget(Window, name, {
    create: Button,
    default_options: {
      class: 'aux-' + name,
      icon: 'window' + name,
    },
    static_events: {
      click: function (e) {
        handler.call(this.parent, e);
      },
      mousedown: function (e) {
        e.stopPropagation();
      },
    },
  });
}
bFactory('close', close);
bFactory('minimize', minimize);
bFactory('maximize', maximize);
bFactory('maximizevertical', maximizeVertical);
bFactory('maximizehorizontal', maximizeHorizontal);
bFactory('shrink', shrink);

/**
 * @member {Icon} Window#size - A {@link Icon} acting as handle for window resize.
 */
defineChildWidget(Window, 'size', {
  create: Icon,
  default_options: { icon: 'windowresize', class: 'aux-size' },
});
/**
 * @member {Container} Window#content - A {@link Container} for the window content.
 */
defineChildWidget(Window, 'content', {
  create: Container,
  toggle_class: true,
  show: true,
  default_options: { class: 'aux-content' },
});
/**
 * @member {Container} Window#header - The top header bar.
 */
defineChildWidget(Window, 'header', {
  create: Container,
  toggle_class: true,
  show: true,
  default_options: { class: 'aux-header' },
  static_events: {
    dblclick: headerAction,
  },
  append: function () {
    buildHeader.call(this);
    this.element.appendChild(this.header.element);
  },
});
/**
 * @member {Container} Window#footer - The bottom footer bar.
 */
defineChildWidget(Window, 'footer', {
  create: Container,
  toggle_class: true,
  show: false,
  default_options: { class: 'aux-footer' },
  append: function () {
    buildFooter.call(this);
    this.element.appendChild(this.footer.element);
  },
});

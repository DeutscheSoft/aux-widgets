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

/* jshint -W014 */
/* jshint -W079 */

import { defineClass } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { Container } from './container.js';
import { Icon } from './icon.js';
import { Label } from './label.js';
import { Button } from './button.js';
import { Drag } from '../modules/drag.js';
import { Resize } from '../modules/resize.js';
import { GlobalCursor } from '../implements/globalcursor.js';
import { translateAnchor } from '../utils/anchor.js';
import {
  addClass,
  removeClass,
  outerWidth,
  outerHeight,
  positionLeft,
  positionTop,
  width,
  innerWidth,
  innerHeight,
  height,
  toggleClass,
  setContent,
} from '../utils/dom.js';

function headerAction() {
  var that = this.parent;
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
      that.destroy();
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
function close() {
  /**
   * The user clicked the close button.
   * @event Window.closeclicked
   */
  this.emit('closeclicked');
  if (this.options.auto_close) this.destroy();
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
  this.globalCursor('se-resize');
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
  this.removeCursor('se-resize');
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
  var x = outerWidth(this.element, true);
  var y = outerHeight(this.element, true);
  this.dimensions.width = this.options.width = x;
  this.dimensions.height = this.options.height = y;
  this.dimensions.x2 = x + this.dimensions.x1;
  this.dimensions.y2 = y + this.dimensions.y1;
}
function calculatePosition() {
  var posx = positionLeft(this.element);
  var posy = positionTop(this.element);
  var pos1 = translateAnchor(
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
  this.globalCursor('move');
  addClass(this.element, 'aux-dragging');
  // if window is maximized, we have to replace the window according
  // to the position of the mouse
  let y = 0,
    x = 0;
  if (vertMax.call(this)) {
    y = !this.options.fixed ? window.scrollY : 0;
  }
  if (horizMax.call(this)) {
    x = ev.clientX - (ev.clientX / width()) * this.options.width;
    x += !this.options.fixed ? window.scrollX : 0;
  }
  var pos = translateAnchor(
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
  this.removeCursor('move');
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
function initPosition(pos) {
  var O = this.options;
  if (pos) {
    var x0 = O.fixed ? 0 : window.scrollX;
    var y0 = O.fixed ? 0 : window.scrollY;
    var pos1 = translateAnchor(
      O.open,
      x0,
      y0,
      window.innerWidth - O.width,
      window.innerHeight - O.height
    );
    var pos2 = translateAnchor(O.anchor, pos1.x, pos1.y, O.width, O.height);
    O.x = pos2.x;
    O.y = pos2.y;
  }
  setDimensions.call(this);
  setPosition.call(this);
}
function setPosition() {
  var O = this.options;
  var D = this.dimensions;
  var _width = innerWidth(this.element);
  var _height = innerHeight(this.element);
  var pos = translateAnchor(O.anchor, O.x, O.y, -_width, -_height);
  if (horizMax.call(this)) {
    this.element.style.left = (O.fixed ? 0 : window.scrollX) + 'px';
  } else {
    this.element.style.left = pos.x + 'px';
  }
  if (vertMax.call(this)) {
    this.element.style.top = (O.fixed ? 0 : window.scrollY) + 'px';
  } else {
    this.element.style.top = pos.y + 'px';
  }
  D.x = O.x;
  D.y = O.y;
  D.x1 = pos.x;
  D.y1 = pos.y;
  D.x2 = pos.x + D.width;
  D.y2 = pos.y + D.height;
  /**
   * The position of the window changed.
   * @event Window.positionchanged
   * @param {Object} event - The {@link Window#dimensions} dimensions object.
   */
  this.emit('positionchanged', D);
}
function setDimensions() {
  var O = this.options;
  var D = this.dimensions;
  if (O.width >= 0) {
    O.width = Math.min(maxWidth.call(this), Math.max(O.width, O.min_width));
    if (horizMax.call(this)) {
      outerWidth(this.element, true, width());
      D.width = width();
    } else {
      outerWidth(this.element, true, O.width);
      D.width = O.width;
    }
  } else {
    D.width = outerWidth(this.element);
  }
  if (O.height >= 0) {
    O.height = Math.min(maxHeight.call(this), Math.max(O.height, O.min_height));
    if (vertMax.call(this)) {
      outerHeight(this.element, true, height());
      D.height = height();
    } else {
      outerHeight(this.element, true, O.height);
      D.height = O.height;
    }
  } else {
    D.height = outerHeight(this.element, true);
  }
  D.x2 = D.x1 + D.width;
  D.y2 = D.y1 + D.height;
  /**
   * The dimensions of the window changed.
   * @event Window.dimensionschanged
   * @param {Object} event - The {@link Window#dimensions} dimensions object.
   */
  this.emit('dimensionschanged', this.dimensions);
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
      max: { x: width() - 20, y: height() - 20 },
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
  var E = this[element].element;
  var L = this.options[element];
  var O = this.options;
  while (E.firstChild) E.firstChild.remove();
  if (!L) return;
  for (var i = 0; i < L.length; i++) {
    if (L[i] !== 'spacer') {
      this.set('show_' + L[i], true);
      E.appendChild(this[L[i]].element);
      if (L[i] == 'size' && !this.resize && this.size) {
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
  var O = this.options;
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

export const Window = defineClass({
  /**
   * This widget is a flexible overlay window.
   *
   * @class Window
   *
   * @extends Container
   *
   * @mixes GlobalCursor
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

  Extends: Container,
  Implements: [GlobalCursor],
  _options: Object.assign(Object.create(Container.prototype._options), {
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
  }),
  options: {
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
  },
  static_events: {
    mouseenter: mover,
    mouseleave: mout,
  },
  initialize: function (options) {
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
    Container.prototype.initialize.call(this, options);
    var O = this.options;
    this.__status_to = false;
    initPosition.call(this, this.options.open);
    this.set('maximize', this.options.maximize);
    this.set('minimize', this.options.minimize);
  },

  /**
   * Appends a new child to the window content area.
   * @method Window#appendChild
   * @param {Widget} child - The child widget to add to the windows content area.
   */
  appendChild: function (child) {
    this.content.appendChild(child.element);
    this.addChild(child);
  },

  /**
   * Toggles the overall maximize state of the window.
   * @method Window#toggleMaximize
   * @param {Boolean} maximize - State of maximization. If window is already
   *   maximized in one or both directions it is un-maximized, otherwise maximized.
   */
  toggleMaximize: function () {
    if (!vertMax.call(this) || !horizMax.call(this))
      this.set('maximize', { x: true, y: true });
    else this.set('maximize', { x: false, y: false });
  },
  /**
   * Toggles the vertical maximize state of the window.
   * @method Window#toggleMaximizeVertical
   * @param {Boolean} maximize - The new vertical maximization.
   */
  toggleMaximizeVertical: function () {
    this.set('maximize', { y: !this.options.maximize.y });
  },
  /**
   * Toggles the horizontal maximize state of the window.
   * @method Window#toggleMaximizeHorizontal
   * @param {Boolean} maximize - The new horizontal maximization.
   */
  toggleMaximizeHorizontal: function () {
    this.set('maximize', { x: !this.options.maximize.x });
  },
  /**
   * Toggles the minimize state of the window.
   * @method Window#toggleMinimize
   * @param {Boolean} minimize - The new minimization.
   */
  toggleMinimize: function () {
    this.set('minimize', !this.options.minimize);
  },
  /**
   * Toggles the shrink state of the window.
   * @method Window#toggleShrink
   * @param {Boolean} shrink - The new shrink state.
   */
  toggleShrink: function () {
    this.set('shrink', !this.options.shrink);
  },

  resize: function () {
    this.drag.set('min', { x: 0 - this.options.width + 20, y: 0 });
    this.drag.set('max', { x: width() - 20, y: height() - 20 });
    Container.prototype.resize.call(this);
  },

  draw: function (O, element) {
    addClass(element, 'aux-window');

    Container.prototype.draw.call(this, O, element);
  },

  redraw: function () {
    var I = this.invalid;
    var O = this.options;
    var E = this.element;

    var setP = false;
    var setD = false;

    if (I.maximize) {
      I.maximize = false;
      if (O.shrink) {
        O.shrink = false;
        I.shrink = true;
      }
      toggleClass(this.element, 'aux-maximized-horizontal', O.maximize.x);
      toggleClass(this.element, 'aux-maximized-vertical', O.maximize.y);
      setD = true;
    }
    if (I.anchor) {
      I.anchor = false;
      this.dimensions.anchor = O.anchor;
      setP = setD = true;
    }
    if (I.width || I.height) {
      I.width = I.height = false;
      setD = true;
    }
    if (I.x || I.y) {
      I.x = I.y = false;
      setP = true;
    }
    if (I.z_index) {
      I.z_index = false;
      this.element.style.zIndex = O.z_index;
    }
    if (I.header) {
      I.header = false;
      this.set('show_header', !!O.header);
      if (O.header) buildHeader.call(this);
    }
    if (I.footer) {
      I.footer = false;
      this.set('show_footer', !!O.footer);
      if (O.footer) buildFooter.call(this);
    }
    if (I.status) {
      I.status = false;
      statusTimeout.call(this);
    }
    if (I.fixed) {
      this.element.style.position = O.fixed ? 'fixed' : 'absolute';
      setP = true;
    }
    if (I.active) {
      I.active = false;
      toggleClass(this.element, 'aux-active', O.active);
    }
    if (I.shrink) {
      I.shrink = false;
      this.options.maximize.y = false;
      toggleClass(this.element, 'aux-shrinked', O.shrink);
    }
    if (I.draggable) {
      I.draggable = false;
      toggleClass(this.element, 'aux-draggable', O.draggable);
    }
    if (I.resizable) {
      I.resizable = false;
      toggleClass(this.element, 'aux-resizable', O.resizable);
    }
    if (I.content) {
      I.content = false;
      if (O.content) {
        if (Container.prototype.isPrototypeOf(O.content)) {
          setContent(this.content.element, '');
          this.appendChild(O.content);
        } else {
          setContent(this.content.element, O.content);
        }
      }
      setD = true;
      setP = true;
    }

    if (setD) setDimensions.call(this);
    if (setP) setPosition.call(this);
    Container.prototype.redraw.call(this);
  },

  set: function (key, value) {
    var O = this.options;
    var E = this.element;

    if (key == 'maximize') {
      if (value === false)
        value = this.options.maximize = { x: false, y: false };
      else if (value === true)
        value = this.options.maximize = { x: true, y: true };
      else value = Object.assign(this.options.maximize, value);
    }
    O[key] = value;

    switch (key) {
      case 'shrink':
        O.maximize.y = false;
        break;
      case 'minimize':
        if (value) {
          if (!this.options.container && E.parentElement)
            O.container = E.parentElement;
          E.remove();
        } else if (O.container) {
          this.set('container', O.container);
        }
        break;
      case 'resizable':
        this.resize.set('active', value);
        break;
    }
    return Container.prototype.set.call(this, key, value);
  },
});

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

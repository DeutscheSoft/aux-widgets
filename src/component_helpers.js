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

import { warn, error } from './utils/log.js';
import { sprintf, FORMAT } from './utils/sprintf.js';
import { HTML } from './utils/dom.js';
import { isNativeEvent } from './implements/base.js';
import { subscribeOptionsAttributes } from './options.js';
import { SubscriberMap } from './utils/subscriber_map.js';
import {
  initSubscriptions,
  unsubscribeSubscriptions,
} from './utils/subscriptions.js';

function attributeForWidget(Widget) {
  const attributes = [];
  const skip = ['class', 'id', 'container', 'element', 'styles'];
  const rename = ['title', 'role', 'tabindex'];

  for (let i in Widget.getOptionTypes()) {
    if (skip.indexOf(i) !== -1) continue;

    if (rename.indexOf(i) !== -1) i = 'aux' + i;

    attributes.push(i);
  }

  // this is for supporting AUX-OPTIONS
  attributes.push('options');

  return attributes;
}

const FORMAT_TYPES = new Set([
  'js',
  'javascript',
  'json',
  'html',
  'string',
  'number',
  'integer',
  'int',
  'sprintf',
  'regexp',
  'bool',
  'boolean',
  'array',
]);

function lowParseAttribute(type, x) {
  switch (type) {
    case 'js':
    case 'javascript':
      return new Function([], 'return (' + x + ');').call(this);
    case 'json':
      return JSON.parse(x);
    case 'html':
      return HTML(x);
    case 'string':
      return x;
    case 'number': {
      const f = parseFloat(x);
      if (f === f) return f;

      throw new Error(sprintf('Invalid number: "%s"', x));
    }
    case 'integer':
    case 'int': {
      const i = parseInt(x);
      if (i === i) return i;

      throw new Error(sprintf('Invalid int: "%s"', x));
    }
    case 'sprintf':
      return FORMAT(x);
    case 'regexp':
      return new RegExp(x);
    case 'bool':
    case 'boolean':
      x = x.trim();
      if (x === 'true' || x === '') {
        return true;
      } else if (x === 'false') {
        return false;
      }
      throw new Error(sprintf('Malformed boolean "%s"', x));
    case 'array':
      try {
        return lowParseAttribute.call(this, 'json', x);
      } catch (err) {
        /* empty */
      }
      return lowParseAttribute.call(this, 'js', x);
    default:
      throw new Error(sprintf('Unsupported attribute type "%s"', type));
  }
}

function parseAttribute(option_type, value) {
  const pos = value.indexOf(':');

  if (pos !== -1) {
    const format = value.substring(0, pos);

    if (FORMAT_TYPES.has(format)) {
      return lowParseAttribute.call(this, format, value.substring(pos + 1));
    }
  }

  let types = option_type.includes('|')
    ? option_type.split('|')
    : [option_type];

  types = types.filter((type) => FORMAT_TYPES.has(type));

  if (!types.length) {
    throw new Error('Unable to parse attribute without explicit format.');
  }

  let last_error;

  for (let i = 0; i < types.length; i++) {
    const type = types[i];

    try {
      return lowParseAttribute.call(this, type, value);
    } catch (e) {
      last_error = e;
    }
  }

  throw last_error;
}

export function findParentNode(node) {
  while (node) {
    if (node.isAuxWidget) return node;

    // if the parent looks like a WebComponent which has not been upgraded, we
    // speculatively return it.
    const tagName = node.tagName;

    if (typeof tagName !== 'string') return null;

    // If it is a component but it has not been initialized, yet, we need to
    // assume it will become an aux widget in the future.
    if (tagName.includes('-') && !customElements.get(tagName.toLowerCase()))
      return node;

    node = node.parentNode;
  }

  return null;
}

const baseCache = new WeakMap();

function createComponent(base) {
  if (!base) base = HTMLElement;
  if (baseCache.has(base)) return baseCache.get(base);

  class BaseComponent extends base {
    _auxCalculateAttributes(parentAttributes) {
      const attribute_names = this.constructor.observedAttributes;
      const result = new Map();

      for (let i = 0; i < attribute_names.length; i++) {
        const name = attribute_names[i];
        if (!this.hasAttribute(name)) continue;

        if (name === 'options') {
          continue;
        } else {
          result.set(name, this.getAttribute(name));
        }
      }

      if (parentAttributes) {
        parentAttributes.forEach((value, key) => {
          if (result.has(key)) return;
          if (!attribute_names.includes(key)) return;
          result.set(key, value);
        });
      }

      return result;
    }

    _auxAttributeChanged(name, oldValue, newValue) {
      this._auxAttributes.set(name, newValue);

      if (name.startsWith('aux')) name = name.substring(3);

      try {
        const widget = this.auxWidget;
        const type = widget.getOptionType(name);

        if (typeof type !== 'string') {
          throw new TypeError('Option does not exist.');
        }

        if (newValue !== null) {
          const value = parseAttribute.call(this, type, newValue);
          widget.set(name, value);
        } else {
          widget.reset(name);
        }
      } catch (e) {
        warn(
          '%o: Setting attribute %o on generated an error: %o',
          this,
          name,
          e
        );
      }
    }

    _auxUpdateAttributes(parentAttributes) {
      const new_attributes = this._auxCalculateAttributes(parentAttributes);
      const current_attributes = this.auxAttributes();

      // delete and update
      current_attributes.forEach((oldValue, name) => {
        if (!new_attributes.has(name)) {
          this._auxAttributeChanged(name, oldValue, null);
        } else {
          const newValue = new_attributes.get(name);

          if (newValue !== oldValue) {
            this._auxAttributeChanged(name, oldValue, newValue);
          }
        }
      });

      // new attributes
      new_attributes.forEach((newValue, name) => {
        if (!current_attributes.has(name)) {
          this._auxAttributeChanged(name, null, newValue);
        }
      });
    }

    auxAttributes() {
      return this._auxAttributes;
    }

    auxOptions(WidgetType) {
      const ret = {};
      const _options = WidgetType.getOptionTypes();
      const attribute_names = this.constructor.observedAttributes;
      const attributes = this.auxAttributes();

      for (let i = 0; i < attribute_names.length; i++) {
        const name = attribute_names[i];

        if (!attributes.has(name)) continue;

        const option_name = name.startsWith('aux') ? name.substring(3) : name;

        const type = _options[option_name];
        const attribute_value = attributes.get(name);

        ret[option_name] = parseAttribute.call(this, type, attribute_value);
      }

      return ret;
    }

    constructor(widget) {
      super();
      this._auxEventHandlers = null;
      this._auxAttributesSubscription = null;
      this._auxAttributes = this._auxCalculateAttributes(null);
      this._auxParentNode = void 0;
      this._detachFromParent = initSubscriptions();
      this._positionIndependent = true;
    }

    _auxParentChanged() {
      const parentNode = findParentNode(this.parentNode);

      // The parent node has not changed, no need to do anything.
      if (parentNode === this._auxParentNode && this._positionIndependent) {
        return;
      }

      this._detachFromParent = unsubscribeSubscriptions(this._detachFromParent);

      if (!this.isConnected && parentNode === null) {
        this._auxParentNode = void 0;
        return null;
      }

      this._auxParentNode = parentNode;

      let unsubscribe;

      if (parentNode && !parentNode.isAuxWidget) {
        // We have a parent node but it has not been initialized, yet.
        unsubscribe = subscribeWhenDefined(parentNode.tagName, () => {
          // retry
          this._auxParentNode = void 0;
          this._auxParentChanged();
        });
      } else {
        const parentWidget = parentNode ? parentNode.auxWidget : null;
        unsubscribe = this._attachToParent(parentWidget);
      }

      this._detachFromParent = unsubscribe;
    }

    /*
     * Called with the given parentNode and parentWidget. This
     * method is only called when this node is part of a subtree.
     */
    _attachToParent(parentWidget) {
      return null;
    }

    connectedCallback() {
      if (!this.isConnected) return;

      const options = this.getAttribute('options');

      if (options) {
        // this will initially happen in the attributeChangedCallback after the
        // constructor and before the connectedCallback
        if (!this._auxAttributesSubscription)
          this._auxAttributesSubscription = subscribeOptionsAttributes(
            this.parentNode,
            options,
            (attr) => {
              this._auxUpdateAttributes(attr);
            }
          );
      }

      this._auxParentChanged();
    }

    disconnectedCallback() {
      this._auxAttributesSubscription = unsubscribeSubscriptions(
        this._auxAttributesSubscription
      );
      this._auxParentChanged();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      const attr = this.auxAttributes();

      // all attribute changed callbacks will fire once befor the initial
      // connectedCallback(). This check prevents those because we collect all
      // attributes initially in the constructor.
      if (oldValue === null && newValue === attr.get(name)) return;

      if (name === 'options') {
        if (!this.isConnected) return;
        if (oldValue === newValue) return;

        const subscriptions = this._auxAttributesSubscription;

        if (subscriptions) {
          this._auxAttributesSubscription = null;
          subscriptions();
        }

        const options = newValue;

        if (options) {
          this._auxAttributesSubscription = subscribeOptionsAttributes(
            this.parentNode,
            options,
            (attr) => {
              this._auxUpdateAttributes(attr);
            }
          );
        } else {
          this._auxUpdateAttributes(null);
        }
      } else {
        this._auxAttributeChanged(name, oldValue, newValue);
      }
    }

    addEventListener(type, ...args) {
      if (!isNativeEvent(type) && this.auxWidget) {
        let handlers = this._auxEventHandlers;

        if (handlers === null) {
          this._auxEventHandlers = handlers = new Map();
        }

        if (!handlers.has(type)) {
          const cb = (...args) => {
            this.dispatchEvent(
              new CustomEvent(type, { detail: { args: args } })
            );
          };

          handlers.set(type, cb);
          this.auxWidget.on(type, cb);
        }
      }

      super.addEventListener(type, ...args);
    }

    get isAuxWidget() {
      return true;
    }

    auxResize() {
      this.auxWidget.triggerResize();
    }
  }

  baseCache.set(base, BaseComponent);

  return BaseComponent;
}

const whenDefinedSubscribers = new SubscriberMap();

function subscribeWhenDefined(tagName, callback) {
  tagName = tagName.toLowerCase();

  if (!whenDefinedSubscribers.has(tagName)) {
    customElements.whenDefined(tagName).then(() => {
      whenDefinedSubscribers.call(tagName);
      whenDefinedSubscribers.removeAll(tagName);
    });
  }

  return whenDefinedSubscribers.subscribe(tagName, callback);
}

let a_div;

function defineOptionsAsProperties(component, options) {
  if (!a_div) a_div = document.createElement('div');

  options.forEach((name) => {
    const property_name = name in a_div ? 'aux' + name : name;
    Object.defineProperty(component.prototype, property_name, {
      get: function () {
        return this.auxWidget.get(name);
      },
      set: function (value) {
        const widget = this.auxWidget;
        if (value === void 0) {
          widget.reset(name);
        } else {
          widget.set(name, value);
        }
      },
    });
  });
}

export function componentFromWidget(Widget, base) {
  const compbase = createComponent(base);
  const attributes = attributeForWidget(Widget);

  const component = class extends compbase {
    static get observedAttributes() {
      return attributes;
    }

    constructor() {
      super();

      const options = this.auxOptions(Widget, attributes);

      options.element = this;

      this.auxWidget = new Widget(options);
    }

    _attachToParent(parentWidget) {
      const widget = this.auxWidget;

      if (parentWidget === null) {
        widget.setParent(null);
        return () => {
          widget.setParent(void 0);
          widget.disableDraw();
        };
      } else {
        parentWidget.addChild(widget);

        return () => {
          // There are situations where we are removed from the
          // parent programmatically.
          if (widget.parent === parentWidget) {
            parentWidget.removeChild(widget);
          }
          widget.disableDraw();
        };
      }
    }
  };

  defineOptionsAsProperties(component, attributes);

  return component;
}

export function subcomponentFromWidget(
  Widget,
  ParentWidget,
  appendCallback,
  removeCallback,
  base,
  positionSensitive
) {
  const compbase = createComponent(base);
  const attributes = attributeForWidget(Widget);

  if (!appendCallback)
    appendCallback = (parent, child) => {
      parent.addChild(child);
    };

  if (!removeCallback)
    removeCallback = (parent, child) => {
      parent.removeChild(child);
    };

  const component = class extends compbase {
    static get observedAttributes() {
      return attributes;
    }

    constructor() {
      super();
      this._positionIndependent = !positionSensitive;
      const options = this.auxOptions(Widget);

      options.class = this.getAttribute('class');

      this.auxWidget = new Widget(options);
    }

    connectedCallback() {
      super.connectedCallback();
      this.style.display = 'none';
    }

    _attachToParent(parentWidget) {
      if (parentWidget instanceof ParentWidget) {
        const widget = this.auxWidget;
        appendCallback(parentWidget, widget, this);
        return () => {
          removeCallback(parentWidget, widget, this);
          widget.disableDraw();
        };
      } else {
        error('Missing parent widget: ', this);
      }
    }
  };

  defineOptionsAsProperties(component, attributes);

  return component;
}

export function defineComponent(name, component, options) {
  customElements.define('aux-' + name, component, options);
}

/**
 * Interface implemented by all WebComponents based on AUX Widgets.
 *
 * Each Component maps both attributes and properties onto options of the same
 * name. The mapping of attributes is only one-directional, i.e. attributes are
 * turned into options but not the other way around.
 *
 * Properties are only defined on the corresponding component under the same name,
 * if the base Element class does not already define them, e.g. the property
 * `title` is already defined on the HTMLElement. Properties such as 'title'
 * for which the property would override an existing property are defined as
 * aliases with the prefix 'aux', e.g. 'auxtitle' is defined and maps onto the
 * 'title' option in the widget.
 *
 * @interface Component
 * @property auxWidget {Widget} - The AUX widget object of this component.
 * @property isAuxWidget {boolean} - Returns true. This can be used to detect AUX components.
 */
/**
 * Trigger a resize. This leads the widget to recalculates its size. Some
 * components, such as those which have scales, need this to redraw themselves
 * correctly.
 *
 * @method Component#auxResize
 */

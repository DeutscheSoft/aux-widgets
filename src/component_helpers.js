import { warn, error } from './utils/log.js';
import { sprintf, FORMAT } from './utils/sprintf.js';
import { html } from './utils/dom.js';
import { is_native_event } from './implements/base.js';
import { subscribeOptionsAttributes } from './options.js';

function attribute_for_widget(Widget)
{
  const attributes = [];
  const skip = ["class", "id", "container", "element", "styles" ];
  const rename = [ "title" ];

  for (var i in Widget.prototype._options)
  {
    if (skip.indexOf(i) !== -1)
      continue;

    if (rename.indexOf(i) !== -1)
      i = 'aux' + i;

    attributes.push(i);
  }

  // this is for supporting AUX-OPTIONS
  attributes.push('options');

  return attributes;
}

const FORMAT_TYPES = new Set([
  "js",
  "javascript",
  "json",
  "html",
  "string",
  "number",
  "int",
  "sprintf",
  "regexp",
  "bool",
  "boolean",
  "array"
]);

function low_parse_attribute(type, x) {
  switch (type) {
  case "js":
  case "javascript":
    return new Function([], "return ("+x+");").call(this);
  case "json":
    return JSON.parse(x);
  case "html":
    return html(x);
  case "string":
    return x;
  case "number":
    {
      const f = parseFloat(x);
      if (f === f) return f;

      throw new Error(sprintf('Invalid number: "%s"', x));
    }
  case "int":
    {
      const i = parseInt(x);
      if (i === i) return i;

      throw new Error(sprintf('Invalid int: "%s"', x));
    }
  case "sprintf":
    return FORMAT(x);
  case "regexp":
    return new RegExp(x);
  case "bool":
  case "boolean":
    x = x.trim();
    if (x === "true" || x === '') {
      return true;
    } else if (x === "false") {
      return false;
    }
    throw new Error(sprintf('Malformed boolean "%s"', x));
  case "array":
    try {
      return low_parse_attribute.call(this, 'json', x);
    } catch (err) {}
    return low_parse_attribute.call(this, 'js', x);
  default:
    throw new Error(sprintf('Unsupported attribute type "%s"', type));
  }
}

function parse_attribute(option_type, value)
{
  const pos = value.indexOf(':');

  if (pos !== -1)
  {
    const format = value.substr(0, pos);

    if (FORMAT_TYPES.has(format))
    {
      return low_parse_attribute.call(this, format, value.substr(pos+1));
    }
  }

  let types = option_type.includes('|') ? option_type.split('|') : [ option_type ];

  types = types.filter((type) => FORMAT_TYPES.has(type));

  if (!types.length)
  {
    throw new Error('Unable to parse attribute without explicit format.');
  }

  let last_error; 

  for (let i = 0; i < types.length; i++)
  {
    const type = types[i];

    try
    {
      return low_parse_attribute.call(this, type, value);
    }
    catch (e)
    {
      last_error = e;
    }
  }

  throw last_error;
}

function create_component (base) {
  if (!base) base = HTMLElement;
  return class extends base
  {
    _auxCalculateAttributes(parentAttributes)
    {
      const attribute_names = this.constructor.observedAttributes;
      const result = new Map();

      for (let i = 0; i < attribute_names.length; i++)
      {
        const name = attribute_names[i];
        if (!this.hasAttribute(name)) continue;
        
        if (name === 'options')
        {
          continue;
        }
        else
        {
          result.set(name, this.getAttribute(name));
        }
      }

      if (parentAttributes)
      {
        parentAttributes.forEach((value, key) => {
          if (result.has(key)) return;
          result.set(key, value);
        });
      }

      return result;
    }

    _auxAttributeChanged(name, oldValue, newValue)
    {
      this._auxAttributes.set(name, newValue);

      if (name.startsWith('aux'))
        name = name.substr(3);

      try {
        const widget = this.auxWidget;
        const type = widget._options[name];
        if (newValue !== null)
        {
          const value = parse_attribute.call(this, type, newValue);
          widget.set(name, value);
        }
        else
        {
          widget.reset(name);
        }
      } catch (e) {
        warn('Setting attribute generated an error:', e);
      }
    }

    _auxUpdateAttributes(parentAttributes)
    {
      const new_attributes = this._auxCalculateAttributes(parentAttributes);
      const current_attributes = this.auxAttributes();

      // delete and update
      current_attributes.forEach((oldValue, name) => {
        if (!new_attributes.has(name))
        {
          this._auxAttributeChanged(name, oldValue, null);
        }
        else
        {
          const newValue = new_attributes.get(name);

          if (newValue !== oldValue)
          {
            this._auxAttributeChanged(name, oldValue, newValue);
          }
        }
      });

      // new attributes
      new_attributes.forEach((newValue, name) => {

        if (!current_attributes.has(name))
        {
          this._auxAttributeChanged(name, null, newValue);
        }
      });
    }

    auxAttributes()
    {
      return this._auxAttributes;
    }

    auxOptions(WidgetType)
    {
      const ret = {};
      const _options = WidgetType.prototype._options;
      const attribute_names = this.constructor.observedAttributes;
      const attributes = this.auxAttributes();

      for (let i = 0; i < attribute_names.length; i++)
      {
        const name = attribute_names[i];

        if (!attributes.has(name)) continue;

        const option_name = name.startsWith('aux') ? name.substr(3) : name;

        const type = _options[option_name];
        const attribute_value = attributes.get(name);

        ret[option_name] = parse_attribute.call(this, type, attribute_value);
      }

      return ret;
    }

    constructor(widget)
    {
      super();
      this._auxEventHandlers = null;
      this._auxAttributesSubscription = null;
      this._auxAttributes = this._auxCalculateAttributes(null);
    }

    connectedCallback()
    {
      const options = this.getAttribute('options');

      if (options)
      {
        // this will initially happen in the attributeChangedCallback after the
        // constructor and before the connectedCallback
        if (this._auxAttributesSubscription) return;

        this._auxAttributesSubscription = subscribeOptionsAttributes(this.parentNode, options, (attr) => {
          this._auxUpdateAttributes(attr);
        });
      }
    }

    disconnectedCallback()
    {
      const subscriptions = this._auxAttributesSubscription;
      if (subscriptions)
      {
        this._auxAttributesSubscription = null;
        subscriptions();
        this._auxUpdateAttributes(null);
      }
    }
  
    attributeChangedCallback(name, oldValue, newValue)
    {
      const attr = this.auxAttributes();

      // all attribute changed callbacks will fire once befor the initial
      // connectedCallback(). This check prevents those because we collect all
      // attributes initially in the constructor.
      if (oldValue === null && newValue === attr.get(name)) return;

      if (name === 'options')
      {
        if (!this.isConnected) return;
        if (oldValue === newValue) return;

        const subscriptions = this._auxAttributesSubscription;

        if (subscriptions)
        {
          this._auxAttributesSubscription = null;
          subscriptions();
        }

        const options = newValue;

        if (options)
        {
          this._auxAttributesSubscription = subscribeOptionsAttributes(this.parentNode, options, (attr) => {
            this._auxUpdateAttributes(attr);
          });
        }
        else
        {
          this._auxUpdateAttributes(null);
        }
      }
      else
      {
        this._auxAttributeChanged(name, oldValue, newValue);
      }
    }
  
    addEventListener(type, ...args)
    {
      if (!is_native_event(type) && this.auxWidget)
      {
        let handlers = this._auxEventHandlers;

        if (handlers === null)
        {
          this._auxEventHandlers = handlers = new Map();
        }
  
        if (!handlers.has(type))
        {
          const cb = (...args) => {
            this.dispatchEvent(new CustomEvent(type, { detail: { args: args } }));
          };
  
          handlers.set(type, cb);
          this.auxWidget.on(type, cb);
        }
      }
  
      super.addEventListener(type, ...args);
    }

    get isAuxWidget()
    {
      return true;
    }

    auxResize()
    {
      this.auxWidget.trigger_resize();
    }
  };
}

function find_parent_node(node)
{
  do
  {
    if (node.isAuxWidget)
    {
      return node;
    }
    node = node.parentNode;
  } while (node);

  return null;
}

function find_parent_widget(node)
{
  const parentNode = find_parent_node(node);

  if (parentNode) return parentNode.auxWidget;

  return null;
}

let a_div;

function define_options_as_properties(component, options)
{
  if (!a_div)
    a_div = document.createElement('div');

  options.forEach((name) => {
    let property_name = (name in a_div) ? ('aux' + name) : name;
    Object.defineProperty(component.prototype, property_name, {
      get: function()
      {
        return this.auxWidget.get(name);
      },
      set: function(value)
      {
        const widget = this.auxWidget;
        if (value === void(0))
          return widget.reset(name);
        else
          return widget.set(name, value);
      },
    });
  });
}

export function component_from_widget(Widget, base)
{
  let compbase = create_component(base);
  const attributes = attribute_for_widget(Widget);

  const component = class extends compbase
  {
    static get observedAttributes()
    {
      return attributes;
    }

    constructor()
    {
      super();

      const options = this.auxOptions(Widget, attributes);

      options.element = this;

      this.auxWidget = new Widget(options);
    }

    connectedCallback()
    {
      super.connectedCallback();
      const widget = this.auxWidget;
      const parent = find_parent_widget(this.parentNode);
      if (parent)
      {
        parent.add_child(widget);
      }
      else
      {
        widget.set_parent(null);
      }
    }

    disconnectedCallback()
    {
      super.disconnectedCallback();
      this.auxWidget.set_parent(void(0));
      this.auxWidget.disable_draw();
    }
  };

  define_options_as_properties(component, attributes);

  return component;
}

export function subcomponent_from_widget(Widget, ParentWidget, append_cb, remove_cb, base)
{
  let compbase = create_component(base);
  const attributes = attribute_for_widget(Widget);

  if (!append_cb) append_cb = (parent, child) => {
    parent.add_child(child);
  };

  if (!remove_cb) remove_cb = (parent, child) => {
    parent.remove_child(child);
  };

  const component = class extends compbase
  {
    static get observedAttributes()
    {
      return attributes;
    }

    constructor()
    {
      super();
      const options = this.auxOptions(Widget);

      this.auxWidget = new Widget(options);
      this.auxParent = null;
    }

    connectedCallback()
    {
      super.connectedCallback();
      this.style.display = 'none';

      const parent = find_parent_widget(this.parentNode);

      if (parent instanceof ParentWidget)
      {
        this.auxParent = parent;
        append_cb(parent, this.auxWidget, this);
      }
      else
      {
        error('Missing parent widget.',this);
      }
    }

    disconnectedCallback()
    {
      super.disconnectedCallback();

      const parent = this.auxParent;

      if (parent)
      {
        remove_cb(parent, this.auxWidget, this);
        this.auxParent = null;
      }
    }
  };

  define_options_as_properties(component, attributes);

  return component;
}

export function define_component(name, component, options)
{
  customElements.define('aux-'+name, component, options);
}

/**
 * Interface implemented by all WebComponents based on A.UX Widgets.
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
 * @property auxWidget {Widget} - The A.UX widget object of this component.
 * @property isAuxWidget {boolean} - Returns true. This can be used to detect A.UX components.
 */
/**
 * Trigger a resize. This leads the widget to recalculates its size. Some
 * components, such as those which have scales, need this to redraw themselves
 * correctly.
 *
 * @method Component#auxResize
 */

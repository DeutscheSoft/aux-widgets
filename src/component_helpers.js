import { warn, error } from './utils/log.js';
import { sprintf, FORMAT } from './utils/sprintf.js';
import { html } from './utils/dom.js';
import { is_native_event } from './implements/base.js';

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
      return low_parse_attribute('json', x);
    } catch (err) {}
    return low_parse_attribute('js', x);
  default:
    throw new Error(sprintf('Unsupported attribute type "%s"', type));
  }
}

function parse_attribute(type, value)
{
  {
    const pos = value.indexOf(':');

    if (pos !== -1)
    {
      try
      {
        return low_parse_attribute(value.substr(0, pos), value.substr(pos+1));
      }
      catch (err) { }
    }


    if (type.includes('|'))
    {
      const types = type.split('|');

      for (let i = 0; i < types.length; i++)
      {
        try
        {
          return low_parse_attribute(types[i], value);
        }
        catch (e)
        {
          //warn(e);
        }
      }

      throw new Error('Could not find any matching format in ' + type);
    }
  }

  return low_parse_attribute(type, value);
}

function extract_options(node, WidgetType, attributes)
{
  const ret = {};
  const _options = WidgetType.prototype._options;

  for (let i = 0; i < attributes.length; i++)
  {
    const name = attributes[i];

    if (!node.hasAttribute(name)) continue;

    const type = _options[attributes[i]];

    ret[name] = parse_attribute(type, node.getAttribute(name));
  }

  return ret;
}

function attributes_from_widget(Widget)
{
  const attributes = [];
  const skip = ["class", "id", "container", "element", "styles"];

  for (var i in Widget.prototype._options)
  {
    if (skip.indexOf(i) === -1)
      attributes.push(i);
  }

  return attributes;
}

function create_component (base) {
  if (!base) base = HTMLElement;
  return class extends base
  {
    constructor(widget)
    {
      super();
      this._auxEventHandlers = null;
    }

    connectedCallback()
    {
    }
  
    attributeChangedCallback(name, oldValue, newValue)
    {
      if (oldValue === newValue) return;

      try {
        const widget = this.auxWidget;
        const type = widget._options[name];
        if (newValue !== null)
        {
          const value = parse_attribute(type, newValue);
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

function define_options_as_properties(component, options)
{
  options.forEach((name) => {
    if (name in component.prototype) return;
    Object.defineProperty(component.prototype, name, {
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
  const attributes = attributes_from_widget(Widget);

  const component = class extends compbase
  {
    static get observedAttributes()
    {
      return attributes;
    }

    constructor()
    {
      super();

      const options = extract_options(this, Widget, attributes);

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
  const attributes = attributes_from_widget(Widget);

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
      const options = extract_options(this, Widget, attributes);

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
        error('Missing parent widget.');
      }
    }

    disconnectedCallback()
    {
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
 * Interface implemented by all WebComponents based on AUX Widgets.
 *
 * Each Component maps both attributes and properties onto options of the same
 * name. The mapping of attributes is only one-directional, i.e. attributes are
 * turned into options but not the other way around.
 *
 * Properties are only defined on the corresponding component if the base Element
 * class does not already define them, e.g. the property `placeholder` is
 * already defined on the HTMLInputElement and is therefore not present on the
 * ValueComponent.
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

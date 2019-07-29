import { warn, error, FORMAT } from './helpers.mjs';

// TODO:
// * the refcount logic is not correct since it ignores the fact
//   that addEventListener and friends can
//    - be called more than once without effect
//    - can be called with different values of capture
//   this is a proof of concept at the moment

function low_parse_attribute(type, x) {
  switch (type) {
  case "js":
    return new Function([], "return ("+x+");").call(this);
  case "json":
    return JSON.parse(x);
  case "html":
    return TK.html(x);
  case "string":
    return x;
  case "number":
    return parseFloat(x);
  case "int":
    return parseInt(x);
  case "sprintf":
    return FORMAT(x);
  case "regexp":
    return new RegExp(x);
  case "bool":
  case "boolean":
    x = x.trim();
    if (x === "true") {
      return true;
    } else if (x === "false") {
      return false;
    }
    throw new Error("Malformed 'bool': ", x);
  case "array":
    try {
      return low_parse_attribute('json', x);
    } catch (err) {}
    return low_parse_attribute('js', x);
  default:
    throw new Error("unsupported type " + type);
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

    const types = type.split('|');

    if (types.length > 1)
    {
      for (let i = 0; i < types.length; i++)
      {
        try
        {
          return low_parse_attribute(types[i], value);
        }
        catch (e)
        {
          warn(e);
        }
      }

      throw new Error('Could not find any matching format in ' + type);
    }
  }

  return low_parse_attribute(type, value);
}

function attributes_from_widget(Widget)
{
  const attributes = [];
  const skip = ["class", "id", "container", "element"];

  for (var i in Widget.prototype._options)
  {
    if (skip.indexOf(i) == -1)
      attributes.push(i);
  }

  return attributes;
}

class ComponentBase extends HTMLElement
{
  constructor(widget)
  {
    super();
    this.tk_events_counts = new Map();
    this.tk_events_handlers = new Map();
    this.tk_events_paused = false;
    this.widget = null;
  }

  attributeChangedCallback(name, oldValue, newValue)
  {
    this.tk_events_paused = true;
    try {
      const widget = this.widget;
      const type = widget._options[name];
      const value = parse_attribute(type, newValue);
      widget.set(name, value);
    } catch (e) {
      warn('Setting attribute generated an error:', e);
    }
    this.tk_events_paused = false;
  }

  addEventListener(type, listener, ...args)
  {
    if (type.startsWith('tk:'))
    {
      const counts = this.tk_events_counts;

      if (counts.has(type))
      {
        counts.set(counts.get(type) + 1);
      }
      else
      {
        const tk_type = type.substr(3);

        counts.set(type, 1);

        const cb = (...args) => {
          if (this.tk_events_paused) return;
          this.dispatchEvent(new CustomEvent(type, { detail: { args: args } }));
        };

        this.tk_events_handlers.set(type, cb);
        this.widget.add_event(tk_type, cb);
      }
    }

    super.addEventListener(type, listener, ...args);
  }

  removeEventListener(type, listener, ...args)
  {
    if (type.startsWith('tk:'))
    {
      const counts = this.tk_events_counts;

      if (counts.has(type))
      {
        const v = counts.get(type);

        if (v <= 1)
        {
          // remove handler
          const tk_type = type.substr(3);
          const handlers = this.tk_events_handlers;

          handlers.delete(type);
          counts.delete(type);

          this.widget.remove_event(tk_type, handlers.get(type));
        }
        else
        {
          counts.set(v - 1);
        }
      }
      else
      {
        warn('calling removeEventListener on %o twice!', this);
      }
    }

    super.removeEventListener(type, listener, ...args);
  }
}

export function component_from_widget(Widget)
{
  const attributes = attributes_from_widget(Widget);

  return class extends ComponentBase
  {
    static get observedAttributes()
    {
      return attributes;
    }

    constructor()
    {
      super();
      this.widget = new Widget({
        element: this,
      });
    }

    connectedCallback()
    {
      this.widget.enable_draw();
    }

    disconnectedCallback()
    {
      this.widget.disable_draw();
    }
  }
}

export function subcomponent_from_widget(Widget, ParentWidget, append_cb, remove_cb)
{
  const attributes = attributes_from_widget(Widget);

  if (!append_cb) append_cb = (parent, child) => {
    parent.add_child(child);
  };

  if (!remove_cb) remove_cb = (parent, child) => {
    parent.remove_child(child);
  };

  return class extends ComponentBase
  {
    static get observedAttributes()
    {
      return attributes;
    }

    constructor()
    {
      super();
      this.widget = new Widget();
      this.parent = null;
      this.setAttribute('hidden', '');
    }

    connectedCallback()
    {
      const parent = this.parentNode.widget;

      if (parent instanceof ParentWidget)
      {
        this.parent = parent;
        append_cb(parent, this.widget);
      }
      else
      {
        error('Missing parent widget.');
      }
    }

    disconnectedCallback()
    {
      const parent = this.parent;

      if (parent)
      {
        remove_cb(parent, this.widget);
        this.parent = null;
      }
    }

    static get observedAttributes()
    {
      return attributes;
    }
  }
}

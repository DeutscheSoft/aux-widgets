import { warn, error, FORMAT } from './helpers.mjs';

// TODO:
// * the refcount logic is not correct since it ignores the fact
//   that addEventListener and friends can
//    - be called more than once without effect
//    - can be called with different values of capture
//   this is a proof of concept at the moment

function parse_attribute(type, x) {
  const types = type.split('|');

  if (types.length > 1)
  {
    for (let i = 0; i < types.length; i++)
    {
      try
      {
        return parse_attribute(types[i], x);
      }
      catch (e)
      {
        warn(e);
      }
    }

    throw new Error('Could not find any matching format in ' + type);
  }
  else
  {
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
    default:
      throw new Error("unsupported type " + type);
    }
  }
}

export function component_from_widget(Widget)
{
  const attributes = [];
  const skip = ["class", "id"];
  for (var i in Widget.prototype._options)
    attributes.push(i);
    
  return class extends HTMLElement
  {
    constructor()
    {
      super();
      this.widget = new Widget({
        element: this,
      });
      this.tk_events_counts = new Map();
      this.tk_events_handlers = new Map();
      this.tk_events_paused = false;
    }

    connectedCallback()
    {
      this.widget.enable_draw();
    }

    disconnectedCallback()
    {
      this.widget.disable_draw();
    }

    static get observedAttributes()
    {
      return attributes;
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
      this.tk_events_paused = true;
      try {
        const widget = this.widget;
        const type = widget._options[name];
        const value = parse_attribute(type, newValue);
        if (skip.indexOf(name) >= 0)
          widget.options[name] = value;
        else
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
}

import { warn } from './helpers.mjs';

// TODO:
// * the refcount logic is not correct since it ignores the fact
//   that addEventListener and friends can
//    - be called more than once without effect
//    - can be called with different values of capture
//   this is a proof of concept at the moment

export function component_from_widget(Widget)
{
  const attributes = Object.keys(Widget.prototype._options);

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
        this.widget.set(name, JSON.parse(newValue));
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

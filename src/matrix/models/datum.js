import { Events } from '../../events.js';

export class Datum extends Events
{
    constructor(o)
    {
        super();
        this.properties = {};

        if (o)
        {
          for (let name in o)
          {
              this.set(name, o[name]);
          }
        }
    }

    set(name, value)
    {
        this.properties[name] = value;
        this.emit('propertyChanged', name, value);
        return value;
    }

    get(name)
    {
        return this.properties[name];
    }

    observe(name, callback)
    {
        callback(this[name]);

        return this.subscribe('propertyChanged', (key, value) => {
            if (key === name) callback(value);
        });
    }
}

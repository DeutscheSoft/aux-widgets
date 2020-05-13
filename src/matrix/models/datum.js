/**
 * @module matrix
 */

import { Events } from '../../events.js';

/**
 * Base class for data model objects.
 */
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

  /**
   * Observe a property. The callback will be
   * called immediately with the current value
   * and whenever the property changes.
   *
   * @param {string} name The property name.
   * @param {Function} callback The callback function.
   */
  observe(name, callback)
  {
    callback(this[name]);

    return this.subscribe('propertyChanged', (key, value) => {
      if (key === name) callback(value);
    });
  }
}

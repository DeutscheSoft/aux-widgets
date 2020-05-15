import { warn } from './utils/log.js';

// Map<Node, Map<string, OptionsComponent>>
const optionsChildren = new Map();

function findOptions(parent, name) {
  for (; parent; parent = parent.parentNode) {
    const tmp = optionsChildren.get(parent);

    if (tmp && tmp.has(name)) return tmp.get(name);
  }

  return null;
}

class OptionsSubscriber {
  constructor(parent, name, callback) {
    this.parent = parent;
    this.name = name;
    this.callback = callback;
    this.options = void 0;
    this.update();
  }

  update() {
    const options = findOptions(this.parent, this.name);

    if (options !== this.options) {
      this.options = options;

      const cb = this.callback;

      try {
        cb(options);
      } catch (err) {
        warn('Subscriber of AUX-OPTIONS generated an error %o', err);
      }
    }
  }
}

// Map<String, Set<OptionsSubscriber>>
const optionsSubscribers = new Map();

function triggerUpdate(name) {
  const subscribers = optionsSubscribers.get(name);

  if (!subscribers) return;

  subscribers.forEach((subscriber) => subscriber.update());
}

function normalize_parent(parent) {
  if (parent.tagName === 'HEAD' || parent.tagName === 'BODY') {
    parent = parent.parentNode;
  }

  return parent;
}

export function registerOptions(parent, name, options) {
  parent = normalize_parent(parent);

  let tmp = optionsChildren.get(parent);

  if (!tmp) {
    optionsChildren.set(parent, (tmp = new Map()));
  }

  if (tmp.has(name)) {
    throw new Error('AUX-OPTIONS with name ' + name + ' defined twice.');
  }

  tmp.set(name, options);

  triggerUpdate(name);
}

export function unregisterOptions(parent, name, options) {
  parent = normalize_parent(parent);

  let tmp = optionsChildren.get(parent);

  if (!tmp) {
    throw new Error('Unknown AUX-OPTIONS');
  }

  if (tmp.get(name) !== options) {
    throw new Error('Found wrong AUX-OPTIONS in unregisterOptions');
  }

  tmp.delete(name);

  triggerUpdate(name);
}

/**
 * Subscribe to the set of options defined in the nearest AUX-OPTIONS component
 * of a given name and parent.
 *
 * @param {Node} parent - Parent node. This is usually the parent node of the
 *      component which references a given set of options.
 * @param {String} name - Options name.
 * @param {Function} callback - Callback to call when a set of options become
 *      available. Will be called with null as long as no options set can be
 *      found.
 * @returns {Function} - Returns a function which must be called in order to
 *      unsubscribe from the options.
 */
export function subscribeOptions(parent, name, callback) {
  parent = normalize_parent(parent);

  let subscribers = optionsSubscribers.get(name);

  if (!subscribers) {
    optionsSubscribers.set(name, (subscribers = new Set()));
  }

  const subscriber = new OptionsSubscriber(parent, name, callback);

  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
}

/**
 * Subscribe to the set of attributes defined by the inheritance chain of
 * AUX-OPTIONS of a given name and parent.
 *
 * @param {Node} parent - Parent node. This is usually the parent node of the
 *      component which references a given set of options.
 * @param {String} name - Options name.
 * @param {Function} callback - Callback to call when a set of options become
 *      available. Will be called with a Map of attributes.
 * @returns {Function} - Returns a function which must be called in order to
 *      unsubscribe from the options.
 */
export function subscribeOptionsAttributes(parent, name, callback) {
  let current_options = null;

  const attributesChangedCallback = () => {
    const attr = current_options ? current_options.auxAttributes() : null;

    try {
      callback(attr);
    } catch (err) {
      warn('OptionsAttributes subscriber generated an exception %o', err);
    }
  };

  const subs = subscribeOptions(parent, name, (options) => {
    if (current_options) {
      current_options.removeEventListener(
        'auxAttributesChanged',
        attributesChangedCallback
      );
    }

    current_options = options;

    if (options) {
      options.addEventListener(
        'auxAttributesChanged',
        attributesChangedCallback
      );
    }

    attributesChangedCallback();
  });

  return () => {
    subs();
    if (current_options)
      current_options.removeEventListener(
        'auxAttributesChanged',
        attributesChangedCallback
      );
  };
}

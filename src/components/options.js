import {
  registerOptions,
  unregisterOptions,
  subscribeOptionsAttributes,
} from '../options.js';

function triggerUpdate(parentAttributes) {
  const attributes = this._auxAttributes;

  attributes.clear();

  {
    const attr = this.attributes;

    for (let i = 0; i < attr.length; i++) {
      const name = attr[i].name;
      const value = attr[i].value;

      if (name === 'name' || name === 'options' || name === 'style') continue;

      attributes.set(name, value);
    }
  }

  if (parentAttributes) {
    parentAttributes.forEach((value, key) => {
      if (attributes.has(key)) return;
      attributes.set(key, value);
    });
  }

  this.dispatchEvent(new CustomEvent('auxAttributesChanged'));
}

export class OptionsComponent extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'options'];
  }

  constructor() {
    super();
    this.name = null;
    this._auxOptionsSubscription = null;
    this._auxAttributes = new Map();
    this._parent = null;
  }

  auxAttributes() {
    return this._auxAttributes;
  }

  connectedCallback() {
    this.style.display = 'none';

    const name = this.getAttribute('name');

    if (!name) {
      throw new Error('AUX-OPTIONS must have a name attribute.');
    }

    this.name = name;

    const options = this.getAttribute('options');

    if (options) {
      this._auxOptionsSubscriptions = subscribeOptionsAttributes(
        this.parentNode,
        options,
        (attr) => {
          triggerUpdate.call(this, attr);
        }
      );
    } else {
      triggerUpdate.call(this, null);
    }

    this._parent = this.parentNode;
    registerOptions(this.parentNode, name, this);
  }

  disconnectedCallback() {
    const name = this.name;

    if (!name) return;

    unregisterOptions(this._parent, name, this);

    this._parent = null;
    this.name = null;

    const subscription = this._auxOptionsSubscriptions;

    if (subscription) {
      this._auxOptionsSubscriptions = null;

      subscription();
    }
  }

  attributeChangedCallback(key, new_value, old_value) {
    if (!this.isConnected) return;
    if (!this.name) return;
    this.disconnectedCallback();
    this.connectedCallback();
  }
}

customElements.define('aux-options', OptionsComponent);

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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

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
    if (!this.isConnected) return;
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

/* globals customElements */

customElements.define('aux-options', OptionsComponent);

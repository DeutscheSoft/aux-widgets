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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { Container } from '../../widgets/container.js';

export class VirtualTreeEntryBase extends Container {
  static get _options() {
    return {
      data: 'any',
    };
  }

  static get options() {
    return {
      data: null,
    };
  }

  initialize(options) {
    super.initialize(options);
  }

  /**
   * This function is called internally on scroll to update the entries'
   * content. Overload in order to handle additional data being displayed
   * on custom entry classes.
   *
   * @method VirtualTree#subscribeData
   *
   * @param {Object} virtualtreeview - The VirtualTreeViewData object.
   * @param {Integer} index - the index of the entry inside the list.
   * @param {Object} data - The data model holding the properties values.
   * @param {Integer} treeposition - An array containing information
   *   about the entries indentation inside the tree.
   */
  updateData(virtualtreeview, index, element, treePosition) {
    this.update('data', element);
  }
}

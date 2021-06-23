import { Container } from '../../widgets/container.js';

export class VirtualTreeEntryBase extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), {
      data: 'any',
    });
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

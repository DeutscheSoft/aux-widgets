import { defineClass } from '../../widget_helpers.js';
import { Container } from '../../widgets/container.js';

export const VirtualTreeEntryBase = defineClass({
  Extends: Container,
  _options: Object.assign(Object.create(Container.prototype._options), {}),
  options: {},
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    this.data = null;
  },
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
  updateData: function (virtualtreeview, index, element, treePosition) {
    this.data = element;
  },
});

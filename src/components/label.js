import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Label } from './../widgets/label.js';

/**
 * WebComponent for the Label widget. Available in the DOM as `aux-label`.
 *
 * @class LabelComponent
 * @implements Component
 */
export const LabelComponent = component_from_widget(Label);

define_component('label', LabelComponent);

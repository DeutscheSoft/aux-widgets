import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Dialog } from './../widgets/dialog.js';

/**
 * WebComponent for the Dialog widget. Available in the DOM as
 * `aux-dialog`.
 *
 * @class DialogComponent
 * @implements Component
 */
export const DialogComponent = component_from_widget(Dialog);

define_component('dialog', DialogComponent);

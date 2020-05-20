import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { ColorPickerDialog } from './../widgets/colorpickerdialog.js';

/**
 * WebComponent for the ColorPickerDialog widget. Available in the DOM as
 * `aux-colorpickerdialog`.
 *
 * @class ColorPickerDialogComponent
 * @implements Component
 */
export const ColorPickerDialogComponent = component_from_widget(
  ColorPickerDialog
);

define_component('colorpickerdialog', ColorPickerDialogComponent);

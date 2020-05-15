import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { ColorPickerDialog } from './../widgets/colorpickerdialog.js';

export const ColorPickerDialogComponent = component_from_widget(
  ColorPickerDialog
);

define_component('colorpickerdialog', ColorPickerDialogComponent);

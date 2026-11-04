import {
  Dialog,
  IDialogOptions,
  IDialogEvents,
  DialogInteractiveOptions,
} from './dialog.js';
import { ColorPickerInteractiveOptions } from './colorpicker.js';

export interface IColorPickerDialogOptions extends IDialogOptions {}
export interface IColorPickerDialogEvents extends IDialogEvents {}

/**
 * ColorPickerDialog options that may be changed through user interaction.
 * Includes ColorPicker keys forwarded via `userset_delegate` on the child.
 */
export interface ColorPickerDialogInteractiveOptions
  extends DialogInteractiveOptions,
    ColorPickerInteractiveOptions {}

/**
 * ColorPickerDialog is a Dialog containing a ColorPicker.
 */
export declare class ColorPickerDialog<
  Options extends IColorPickerDialogOptions = IColorPickerDialogOptions,
  Events extends IColorPickerDialogEvents = IColorPickerDialogEvents,
  InteractiveOptions extends ColorPickerDialogInteractiveOptions = ColorPickerDialogInteractiveOptions
> extends Dialog<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);
}

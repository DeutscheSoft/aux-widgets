import {
  Dialog,
  IDialogOptions,
  IDialogEvents,
  DialogInteractiveOptions,
} from './dialog.js';

export interface IColorPickerDialogOptions extends IDialogOptions {}
export interface IColorPickerDialogEvents extends IDialogEvents {}

/**
 * ColorPickerDialog options that may be changed through user interaction.
 */
export interface ColorPickerDialogInteractiveOptions
  extends DialogInteractiveOptions {}

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

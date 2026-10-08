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
  TOptions extends IColorPickerDialogOptions = IColorPickerDialogOptions,
  TEvents extends IColorPickerDialogEvents = IColorPickerDialogEvents,
  Interactive extends ColorPickerDialogInteractiveOptions = ColorPickerDialogInteractiveOptions
> extends Dialog<TOptions, TEvents, Interactive> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}

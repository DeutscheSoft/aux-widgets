import { Dialog, IDialogOptions, IDialogEvents } from './dialog.js';
import { EffectiveEvents } from '../implements/base.js';

export interface IColorPickerDialogOptions extends IDialogOptions {}
export interface IColorPickerDialogEvents extends IDialogEvents {}

export declare class ColorPickerDialog<
  TOptions extends IColorPickerDialogOptions = IColorPickerDialogOptions,
  TEvents extends IColorPickerDialogEvents = IColorPickerDialogEvents
> extends Dialog<TOptions, TEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}

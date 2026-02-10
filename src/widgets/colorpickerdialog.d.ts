import { Dialog, IDialogOptions, IDialogEvents } from './dialog.js';
import { EffectiveEvents } from '../implements/base.js';

export interface IColorPickerDialogOptions extends IDialogOptions {}
export interface IColorPickerDialogEvents extends IDialogEvents {}

export declare class ColorPickerDialog<
  TOptions extends IColorPickerDialogOptions = IColorPickerDialogOptions,
  TEvents extends IColorPickerDialogEvents = IColorPickerDialogEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Dialog<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}

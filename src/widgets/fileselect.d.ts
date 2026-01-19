import { EffectiveEvents } from '../implements/base.js';
import { IWidgetEvents } from './widget.js';
import { Container, IContainerOptions } from './container.js';
import { Button, IButtonOptions } from './button.js';
import { Label } from './label.js';

/**
 * Formatting function for file size.
 * @param size - The file size in bytes.
 * @returns The formatted string.
 */
export type IFileSelectFormatSize = (size: number) => string;

/**
 * Formatting function for multiple files.
 * @param count - The number of files selected.
 * @returns The formatted string.
 */
export type IFileSelectFormatMultiple = (count: number) => string;

/**
 * Options specific to the FileSelect widget.
 * Extends Container options and Button options (since button inherits options).
 */
export interface IFileSelectOptions extends IContainerOptions, Omit<IButtonOptions, 'visible'> {
  /** The allowed file types as suffices starting with a dot or as mime types with optional asterisk, e.g. ".txt,.zip,.png,.jpg,image/*,application/pdf" */
  accept?: string;
  /** Defines if users can select multiple files. The label for the file name shows the amount of files selected instead of a single name and the label displaying the file size shows the sum of all selected files sizes. */
  multiple?: boolean;
  /** The label to show as file name if no file is selected. */
  placeholder?: string;
  /** The selected files. */
  files?: FileList | File[];
  /** The name of the selected file or false if no file is selected. Read-only property! */
  filename?: string | false;
  /** The size of the selected file in bytes. Read-only property! */
  filesize?: number;
  /** The formatting function for the file size label. */
  format_size?: IFileSelectFormatSize;
  /** The formatting function for the multiple files label. */
  format_multiple?: IFileSelectFormatMultiple;
}

/**
 * Events specific to the FileSelect widget.
 * Extends Widget events (since Container extends Widget).
 */
export interface IFileSelectEvents extends IWidgetEvents {
  /** Fired when one or more or no files were selected by the user. */
  select: (files: FileList | File[]) => void;
}

/**
 * FileSelect is a file selector widget. It inherits all options of Button.
 */
export declare class FileSelect<
  TOptions extends IFileSelectOptions = IFileSelectOptions,
  TEvents extends IFileSelectEvents = IFileSelectEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container {
  constructor(options?: Partial<TOptions>);

  /** The main DIV container. Has class .aux-fileselect */
  element: HTMLDivElement;
  /** HTMLInputElement element. Has class .aux-fileinput */
  _input: HTMLInputElement;
  /** The HTMLLabelElement element connecting the widgets with the file input. Has class .aux-filelabel */
  _label: HTMLLabelElement;
  /** The Button for opening the file selector. */
  button: Button;
  /** The Label for displaying the file name. Has class aux-name */
  name: Label;
  /** The Label for displaying the file size. Has class aux-size */
  size: Label;
}

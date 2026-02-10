import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Anchor position for dialog placement.
 */
export type IAnchor =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

/**
 * Options specific to the Dialog widget.
 * Extends Container options.
 */
export interface IDialogOptions extends IContainerOptions {
  /** Origin of x and y coordinates. */
  anchor: IAnchor;
  /** X-position of the dialog. Can be a number (pixels) or a string (CSS length). */
  x: number | string | undefined;
  /** Y-position of the dialog. Can be a number (pixels) or a string (CSS length). */
  y: number | string | undefined;
  /** Set dialog to visible=false if clicked outside in the document. */
  auto_close: boolean;
  /** Remove the dialogs DOM node after setting visible=false. */
  auto_remove: boolean;
  /** Add the dialog DOM node to the topmost position in DOM on visible=true. Topmost means either a parenting AWML-ROOT or the BODY node. */
  toplevel: boolean;
  /** If modal window blocks all other elements. */
  modal: boolean;
  /** Reset the focus to the element which had the focus before opening the dialog on closing the dialog. */
  reset_focus: boolean;
  /** Keep focus inside the dialog. */
  contain_focus: boolean;
}

/**
 * Events specific to the Dialog widget.
 * Extends Container events.
 */
export interface IDialogEvents extends IContainerEvents {
  /** Is fired when the dialog is opened. */
  open: () => void;
  /** Is fired when the dialog is closed. */
  close: () => void;
}

/**
 * Dialog provides a hovering area which can be closed by clicking/tapping
 * anywhere on the screen. It can be automatically pushed to the topmost
 * DOM position as a child of an AWML-ROOT or the BODY element. On close
 * it can be removed from the DOM. The Anchor-functionality
 * makes positioning the dialog window straight forward.
 */
export declare class Dialog<
  TOptions extends IDialogOptions = IDialogOptions,
  TEvents extends IDialogEvents = IDialogEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV element. Has class .aux-dialog */
  element: HTMLDivElement;
  /** @internal The container blocking user interaction. Has class .aux-dialog-modal */
  _modal: HTMLDivElement;

  /**
   * Open the dialog. Optionally set x and y position regarding anchor.
   * @param x - New X-position of the dialog.
   * @param y - New Y-position of the dialog.
   * @param focus - Element to receive focus after opening the dialog.
   */
  open(x?: number | string, y?: number | string, focus?: HTMLElement): void;

  /**
   * Close the dialog. The node is removed from DOM if auto_remove is set to true.
   */
  close(): void;

  /**
   * Reposition the dialog to the current x and y position.
   */
  reposition(): void;
}

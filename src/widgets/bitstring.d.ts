import {
  Buttons,
  IButtonsOptions,
  IButtonsEvents,
  ButtonsInteractiveOptions,
} from './buttons.js';

/**
 * Options specific to the Bitstring widget.
 * Extends Buttons options.
 */
export interface IBitstringOptions extends IButtonsOptions {
  /** A function receiving the index as argument to format the buttons labels if the buttons are set as options.length and not as options.buttons. */
  labels: (index: number) => string;
  /** A function receiving the index as argument to format the buttons icons if the buttons are set as options.length and not as options.buttons. */
  icons: (index: number) => string | null;
  /** The length of the bitstring. Use this option to auto-generate the buttons. If you want to have more control over the buttons displayed, set them as options.buttons and set this option to false. */
  length: number | false;
  /** The bitstring value. Can be a number (bitmask) or an array of booleans. */
  bitstring: number | boolean[];
}

/**
 * Events specific to the Bitstring widget.
 * Extends Buttons events.
 */
export interface IBitstringEvents extends IButtonsEvents {
  // No additional events beyond those inherited from Buttons
}

/**
 * Bitstring options that may be changed through user interaction.
 */
export interface BitstringInteractiveOptions extends ButtonsInteractiveOptions {
  /** The bitstring value. Can be a number (bitmask) or an array of booleans. */
  bitstring: IBitstringOptions['bitstring'];
}

/**
 * Bitstring is a specialized Buttons widget to display and control arrays of bits.
 */
export declare class Bitstring<
  TOptions extends IBitstringOptions = IBitstringOptions,
  TEvents extends IBitstringEvents = IBitstringEvents,
  Interactive extends BitstringInteractiveOptions = BitstringInteractiveOptions
> extends Buttons<TOptions, TEvents, Interactive> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-bitstring */
  element: HTMLDivElement;
}

import { Buttons, IButtonsOptions, IButtonsEvents } from './buttons.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the Bitstring widget.
 * Extends Buttons options.
 */
export interface IBitstringOptions extends IButtonsOptions {
  /** A function receiving the index as argument to format the buttons labels if the buttons are set as options.length and not as options.buttons. */
  labels?: (index: number) => string;
  /** A function receiving the index as argument to format the buttons icons if the buttons are set as options.length and not as options.buttons. */
  icons?: (index: number) => string | null;
  /** The length of the bitstring. Use this option to auto-generate the buttons. If you want to have more control over the buttons displayed, set them as options.buttons and set this option to false. */
  length?: number | false;
  /** The bitstring value. Can be a number (bitmask) or an array of booleans. */
  bitstring?: number | boolean[];
}

/**
 * Events specific to the Bitstring widget.
 * Extends Buttons events.
 */
export interface IBitstringEvents extends IButtonsEvents {
  // No additional events beyond those inherited from Buttons
}

/**
 * Bitstring is a specialized Buttons widget to display and control arrays of bits.
 */
export declare class Bitstring<
  TOptions extends IBitstringOptions = IBitstringOptions,
  TEvents extends IBitstringEvents = IBitstringEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Buttons<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main DIV container. Has class .aux-bitstring */
  element: HTMLDivElement;
}

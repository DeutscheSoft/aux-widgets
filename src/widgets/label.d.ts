import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the Label widget.
 * Extends Widget options.
 */
export interface ILabelOptions extends IWidgetOptions {
  /** The content of the label. Can be formatted via format. */
  label: string;
  /** Optional format function. Can be false to disable formatting. */
  format: ((label: string) => string | number) | false;
}

/**
 * Events specific to the Label widget.
 * Extends Widget events.
 */
export interface ILabelEvents extends IWidgetEvents {
  // Label doesn't add any specific events beyond Widget events
}

/**
 * Label is a simple text field displaying strings.
 */
export declare class Label<
  TOptions extends ILabelOptions = ILabelOptions,
  TEvents extends ILabelEvents = ILabelEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-label */
  element: HTMLDivElement;
  /** The text node containing the label content. */
  _text: Text;
}

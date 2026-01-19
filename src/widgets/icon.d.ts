import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the Icon widget.
 * Extends Widget options.
 */
export interface IIconOptions extends IWidgetOptions {
  /** The icon to show. It can either be a string which is interpreted as class name (if [A-Za-z0-9_\-]), a CSS custom property name (if it starts with `--`) or else as a file location. If it is a custom property name or a file location, it is used to set the `background-image` property. */
  icon?: string | false;
  /** The ARIA role for the icon. Defaults to 'img'. */
  role?: string;
}

/**
 * Events specific to the Icon widget.
 * Extends Widget events.
 */
export interface IIconEvents extends IWidgetEvents {
  // Icon doesn't add any specific events beyond Widget events
}

/**
 * Icon represents a DIV element showing either
 * icons from the AUX font or dedicated image files as CSS background.
 */
export declare class Icon<
  TOptions extends IIconOptions = IIconOptions,
  TEvents extends IIconEvents = IIconEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main DIV element. Has class .aux-icon */
  element: HTMLDivElement;
}

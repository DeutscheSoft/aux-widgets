import { Chart, IChartOptions, IChartEvents } from './chart.js';
import { EffectiveEvents } from '../implements/base.js';
import { ChartHandle } from './charthandle.js';

/**
 * Mode options for Panorama widget.
 */
export type IPanoramaMode = 'panorama' | 'balance' | 'surround';

/**
 * Options specific to the Panorama widget.
 * Extends Chart options.
 */
export interface IPanoramaOptions extends IChartOptions {
  /** Mode of the widget: 'panorama' only sets the x parameter and is displayed by a vertical line. 'balance' is a stereo to stereo transformer offering two vertical lines setting x and y. 'surround' offers a circular handle setting x and y parameters. */
  mode?: IPanoramaMode;
  /** Sets x and y range to {min:-n,max:n}. If more fine grained access is needed, range_x and range_y need to be set directly. */
  range?: number;
  /** Amount of digits for displaying values in labels. */
  digits?: number;
}

/**
 * Events specific to the Panorama widget.
 * Extends Chart events.
 */
export interface IPanoramaEvents extends IChartEvents {
  // No additional events beyond those inherited from Chart
}

/**
 * Panorama is a Chart with a single handle to set panorama
 * or balance on stereo and surround channels.
 */
export declare class Panorama<
  TOptions extends IPanoramaOptions = IPanoramaOptions,
  TEvents extends IPanoramaEvents = IPanoramaEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Chart<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The ChartHandle displaying/setting the position on panorama and surround modes. In panorama mode it affects the x parameter, in surround it affects both, x and y parameters. */
  handle1: ChartHandle;
  /** The ChartHandle displaying/setting the position of the second channel in balance mode. It affects the y parameter. */
  handle2: ChartHandle;
}

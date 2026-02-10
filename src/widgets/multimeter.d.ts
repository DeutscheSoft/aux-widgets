import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { LevelMeter, ILevelMeterOptions } from './levelmeter.js';
import { Label } from './label.js';

/**
 * Preset name for MultiMeter configuration.
 */
export type IMultiMeterPresetName =
  | 'mono'
  | 'stereo'
  | '2.1'
  | '3'
  | '3.1'
  | '4'
  | '4.1'
  | '5'
  | '5.1'
  | '7.1'
  | 'dolby_digital_1_0'
  | 'dolby_digital_2_0'
  | 'dolby_digital_3_0'
  | 'dolby_digital_2_1'
  | 'dolby_digital_2_1.1'
  | 'dolby_digital_3_1'
  | 'dolby_digital_3_1.1'
  | 'dolby_digital_2_2'
  | 'dolby_digital_2_2.1'
  | 'dolby_digital_3_2'
  | 'dolby_digital_3_2.1'
  | 'dolby_digital_ex'
  | 'dolby_stereo'
  | 'dolby_digital'
  | 'dolby_pro_logic'
  | 'dolby_pro_logic_2'
  | 'dolby_pro_logic_2x'
  | 'dolby_e_mono'
  | 'dolby_e_stereo'
  | 'dolby_e_5.1_stereo';

/**
 * Layout options for MultiMeter.
 */
export type IMultiMeterLayout = 'left' | 'right' | 'top' | 'bottom';

/**
 * Options specific to the MultiMeter widget.
 * Extends Container options and includes LevelMeter options (which can be arrays or single values).
 */
export interface IMultiMeterOptions extends IContainerOptions {
  /** The number of level meters. */
  count?: number;
  /** The label of the multi meter. Set to false to hide the label from the DOM. */
  label?: string | false;
  /** An Array containing labels for the level meters. Their order is the same as the meters. */
  labels?: string[] | string | null;
  /** Layout of the meters. */
  layout?: IMultiMeterLayout;
  /** Whether to show the scale. */
  show_scale?: boolean;
  /** Preset configuration name. */
  preset?: IMultiMeterPresetName;
  /** An Array containing values for the level meters. Their order is the same as the meters. */
  values?: number[];
  /** An Array containing label values for the level meters. Their order is the same as the meters. */
  value_labels?: number[];
  /** An Array containing clippings for the level meters. Their order is the same as the meters. */
  clips?: boolean[];
  /** An Array containing values for top for the level meters. Their order is the same as the meters. */
  tops?: number[];
  /** An Array containing values for bottom for the level meters. Their order is the same as the meters. */
  bottoms?: number[];
  // Note: All LevelMeter options can also be passed as arrays to apply to individual meters
  // These are dynamically added based on LevelMeter options, so we include the key ones here
  // but the actual implementation supports all LevelMeter options as arrays
}

/**
 * Events specific to the MultiMeter widget.
 * Extends Container events.
 */
export interface IMultiMeterEvents extends IContainerEvents {
  // No additional events beyond those inherited from Container
}

/**
 * MultiMeter is a collection of LevelMeters to show levels of channels
 * containing multiple audio streams. It offers all options of LevelMeter and
 * Meter which are passed to all instantiated level meters.
 */
export declare class MultiMeter<
  TOptions extends IMultiMeterOptions = IMultiMeterOptions,
  TEvents extends IMultiMeterEvents = IMultiMeterEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-multimeter */
  element: HTMLDivElement;
  /** Array of LevelMeter instances. */
  meters: LevelMeter[];
  /** The Label widget displaying the meters title. */
  label: Label;
}

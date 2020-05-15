import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { LevelMeter } from './../widgets/levelmeter.js';

/**
 * WebComponent for the LevelMeter widget. Available in the DOM as
 * `aux-levelmeter`.
 *
 * @class LevelMeterComponent
 * @implements Component
 */
export const LevelMeterComponent = component_from_widget(LevelMeter);

define_component('levelmeter', LevelMeterComponent);

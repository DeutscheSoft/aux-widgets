import {
    component_from_widget, define_component, subcomponent_from_widget
  } from './../component_helpers.js';
import { Equalizer } from './../widgets/equalizer.js';
import { EqBand } from './../widgets/eqband.js';

/**
 * WebComponent for the Equalizer widget. Available in the DOM as `aux-equalizer`.
 *
 * @class EqualizerComponent
 * @implements Component
 */
export const EqualizerComponent = component_from_widget(Equalizer);

/**
 * WebComponent for the EqBand widget. Available in the DOM as
 * `aux-equalizer-band`.
 *
 * @class EqBandComponent
 * @implements Component
 */
export const EqBandComponent = subcomponent_from_widget(EqBand, Equalizer);

define_component('equalizer', EqualizerComponent);
define_component('equalizer-band', EqBandComponent);

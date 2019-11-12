import {
    component_from_widget, subcomponent_from_widget, define_component
  } from './../component_helpers.js';
import { Crossover } from './../widgets/crossover.js';
import { CrossoverBand } from './../widgets/crossover.js';

/**
 * WebComponent for the Crossover widget. Available in the DOM as `aux-crossover`.
 *
 * @class CrossoverComponent
 * @implements Component
 */
export const CrossoverComponent = component_from_widget(Crossover);

/**
 * WebComponent for the CrossoverBand widget. Available in the DOM as
 * `aux-crossover-band`.
 *
 * @class CrossoverBandComponent
 * @implements Component
 */
export const CrossoverBandComponent = subcomponent_from_widget(CrossoverBand, Crossover);

define_component('crossover', CrossoverComponent);
define_component('crossover-band', CrossoverBandComponent);

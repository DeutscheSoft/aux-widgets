import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ProgressBar } from './../widgets/progressbar.js';

/**
 * WebComponent for the ProgressBar widget. Available in the DOM as
 * `aux-progressbar`.
 *
 * @class ProgressBarComponent
 * @implements Component
 */
export const ProgressBarComponent = component_from_widget(ProgressBar);

define_component('progressbar', ProgressBarComponent);

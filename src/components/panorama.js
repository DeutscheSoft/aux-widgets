import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Panorama } from './../widgets/panorama.js';

/**
 * WebComponent for the Panorama widget. Available in the DOM as `aux-panorama`.
 *
 * @class PanoramaComponent
 * @implements Component
 */
export const PanoramaComponent = component_from_widget(Panorama);

define_component('panorama', PanoramaComponent);

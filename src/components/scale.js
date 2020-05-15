import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Scale } from './../widgets/scale.js';

/**
 * WebComponent for the Scale widget. Available in the DOM as `aux-scale`.
 *
 * @class ScaleComponent
 * @implements Component
 */
export const ScaleComponent = component_from_widget(Scale);

define_component('scale', ScaleComponent);

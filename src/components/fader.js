import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Fader } from './../widgets/fader.js';

/**
 * WebComponent for the Fader widget. Available in the DOM as `aux-fader`.
 *
 * @class FaderComponent
 * @implements Component
 */
export const FaderComponent = component_from_widget(Fader);

define_component('fader', FaderComponent);

import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Frame } from './../widgets/frame.js';

/**
 * WebComponent for the Frame widget. Available in the DOM as `aux-frame`.
 *
 * @class FrameComponent
 * @implements Component
 */
export const FrameComponent = component_from_widget(Frame);

define_component('frame', FrameComponent);

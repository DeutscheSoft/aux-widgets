import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Frame } from './../widgets/frame.js';

export const FrameComponent = component_from_widget(Frame);

define_component('frame', FrameComponent);

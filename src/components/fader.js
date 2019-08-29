import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Fader } from './../widgets/fader.js';

export const FaderComponent = component_from_widget(Fader);

define_component('fader', FaderComponent);

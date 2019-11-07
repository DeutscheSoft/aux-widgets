import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ProgressBar } from './../widgets/progressbar.js';

export const ProgressBarComponent = component_from_widget(ProgressBar);

define_component('progressbar', ProgressBarComponent);

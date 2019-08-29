import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Widget } from './../widgets/widget.js';

export const WidgetComponent = component_from_widget(Widget);

define_component('widget', WidgetComponent);

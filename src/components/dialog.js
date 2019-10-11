import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Dialog } from './../widgets/dialog.js';

export const DialogComponent = component_from_widget(Dialog);

define_component('dialog', DialogComponent);

import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Dynamics, Compressor, Expander, Gate, Limiter } from './../widgets/dynamics.js';

export const DynamicsComponent = component_from_widget(Dynamics);
export const CompressorComponent = component_from_widget(Compressor);
export const ExpanderComponent = component_from_widget(Expander);
export const GateComponent = component_from_widget(Gate);
export const LimiterComponent = component_from_widget(Limiter);

define_component('dynamics', DynamicsComponent);
define_component('compressor', CompressorComponent);
define_component('expander', ExpanderComponent);
define_component('gate', GateComponent);
define_component('limiter',LimiterComponent);

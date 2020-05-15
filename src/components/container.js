import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Container } from './../widgets/container.js';

/**
 * WebComponent for the Container widget. Available in the DOM as `aux-container`.
 *
 * @class ContainerComponent
 * @implements Component
 */
export const ContainerComponent = component_from_widget(Container);

define_component('container', ContainerComponent);

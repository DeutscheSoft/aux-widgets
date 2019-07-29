import { component_from_widget } from './../component_helpers.mjs';
import { Clock } from './../widgets/clock.mjs';

export const ClockComponent = component_from_widget(Clock);

customElements.define('tk-clock', ClockComponent);

import { component_from_widget } from './../component_helpers.js';
import { Clock } from './../widgets/clock.js';

export const ClockComponent = component_from_widget(Clock);

customElements.define('tk-clock', ClockComponent);

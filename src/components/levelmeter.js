import { component_from_widget } from './../component_helpers.js';
import { LevelMeter } from './../widgets/levelmeter.js';

export const LevelMeterComponent = component_from_widget(LevelMeter);

customElements.define('tk-levelmeter', LevelMeterComponent);

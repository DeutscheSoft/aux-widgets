import { component_from_widget } from './../component_helpers.mjs';
import { LevelMeter } from './../widgets/levelmeter.mjs';

export const LevelMeterComponent = component_from_widget(LevelMeter);

customElements.define('tk-levelmeter', LevelMeterComponent);

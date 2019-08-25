import { component_from_widget } from './../component_helpers.js';
import { Fader } from './../widgets/fader.js';

export const FaderComponent = component_from_widget(Fader);

customElements.define('tk-fader', FaderComponent);

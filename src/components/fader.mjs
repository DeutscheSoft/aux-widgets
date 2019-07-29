import { component_from_widget } from './../component_helpers.mjs';
import { Fader } from './../widgets/fader.mjs';

export const FaderComponent = component_from_widget(Fader);

customElements.define('tk-fader', FaderComponent);

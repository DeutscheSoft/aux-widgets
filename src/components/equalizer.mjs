import { component_from_widget, subcomponent_from_widget } from './../component_helpers.mjs';
import { Equalizer } from './../widgets/equalizer.mjs';
import { EqBand } from './../modules/eqband.mjs';

function add_band(eq, band)
{
  eq.add_band(band);
}

function remove_band(eq, band)
{
  eq.remove_band(band);
}

export const EqualizerComponent = component_from_widget(Equalizer);
export const EqBandComponent = subcomponent_from_widget(EqBand, Equalizer, add_band, remove_band);

customElements.define('tk-equalizer', EqualizerComponent);
customElements.define('tk-eqband', EqBandComponent)

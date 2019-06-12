import { component_from_widget } from './../component_helpers.mjs';
import { Widget } from './../widgets/widget.mjs';

export const WidgetComponent = component_from_widget(Widget);

customElements.define('tk-widget', WidgetComponent);

import { component_from_widget } from './../component_helpers.js';
import { Widget } from './../widgets/widget.js';

export const WidgetComponent = component_from_widget(Widget);

customElements.define('tk-widget', WidgetComponent);

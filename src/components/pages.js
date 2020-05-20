import {
  component_from_widget,
  define_component,
  subcomponent_from_widget,
} from './../component_helpers.js';
import { Pages } from './../widgets/pages.js';

function add_page(pages, page) {
  pages.add_page(page);
}

function remove_page(pages, page) {
  pages.remove_page(page);
}

/**
 * WebComponent for the Pages widget. Available in the DOM as
 * `aux-pages`.
 *
 * @class PagesComponent
 * @implements Component
 */
export const PagesComponent = component_from_widget(Pages);

define_component('pages', PagesComponent);

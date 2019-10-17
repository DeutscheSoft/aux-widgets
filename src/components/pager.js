import {
    component_from_widget, define_component, subcomponent_from_widget
  } from './../component_helpers.js';
import { Pager } from './../widgets/pager.js';

function add_page(pager, page)
{
  pager.add_page(page);
}

function remove_page(pager, page)
{
  pager.remove_page(page);
}

export const PagerComponent = component_from_widget(Pager);

define_component('pager', PagerComponent);

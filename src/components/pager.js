import {
    component_from_widget, define_component, subcomponent_from_widget
  } from './../component_helpers.js';
import { Pager } from './../widgets/pager.js';
import { Page } from './../widgets/pages.js';

function add_page(pager, page)
{
  const element = page.element;
  pager.add_page(element.getAttribute("label"), page);
}

function remove_page(pager, page)
{
  pager.remove_page(page);
}

export const PagerComponent = component_from_widget(Pager);
export const PageComponent = subcomponent_from_widget(Page, Pager, add_page, remove_page);

define_component('pager', PagerComponent);
define_component('page', PageComponent);

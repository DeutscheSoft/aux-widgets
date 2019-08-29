import {
    component_from_widget, define_component, subcomponent_from_widget 
  } from './../component_helpers.js';
import { Select, SelectEntry } from './../widgets/select.js';

function add_entry(select, entry)
{
  select.add_entry(entry);
}

function remove_entry(select, entry)
{
  select.remove_entry(entry);
}

export const SelectComponent = component_from_widget(Select);
export const SelectEntryComponent = subcomponent_from_widget(SelectEntry, Select, add_entry, remove_entry);

define_component('select', SelectComponent);
define_component('selectentry', SelectEntryComponent);

/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import {
  component_from_widget,
  define_component,
} from './../../component_helpers.js';
import { VirtualTreeEntry } from './../widgets/virtualtreeentry.js';

/**
 * WebComponent for the VirtualTreeEntry widget. Available in the DOM as
 * `aux-virtualtreeentry`.
 *
 * @class VirtualTreeEntryComponent
 * @implements Component
 */
export const VirtualTreeEntryComponent = component_from_widget(
  VirtualTreeEntry
);

define_component('virtualtreeentry', VirtualTreeEntryComponent);
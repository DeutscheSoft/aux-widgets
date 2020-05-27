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
  componentFromWidget,
  defineComponent,
  subcomponentFromWidget,
} from './../component_helpers.js';
import { Pager } from './../widgets/pager.js';
import { Page } from './../widgets/pages.js';

function addPage(pager, page) {
  const element = page.element;
  pager.addPage(element.getAttribute('label'), page);
}

function removePage(pager, page) {
  pager.removePage(page);
}

/**
 * WebComponent for the Pager widget. Available in the DOM as
 * `aux-pager`.
 *
 * @class PagerComponent
 * @implements Component
 */
export const PagerComponent = componentFromWidget(Pager);

/**
 * WebComponent for the Page widget. Available in the DOM as
 * `aux-page`.
 *
 * @class PageComponent
 * @implements Component
 */
export const PageComponent = componentFromWidget(Page);

defineComponent('pager', PagerComponent);
defineComponent('page', PageComponent);

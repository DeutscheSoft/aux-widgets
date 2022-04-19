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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { defineRecalculation as defineRecalculationTask } from './renderer.js';

/**
 * Register a reclaculation function. If one of the dependencies
 * changes it will be called before the next call to redraw().
 *
 * @param {class} widget
 *      The Widget to define a recalculation function for.
 *
 * @param {Array<string>} dependencies
 *      The list of options this function uses.
 *
 * @param {Function} cb
 *      The function to run. The first parameter will be the options
 *      of the widget.
 */
export function defineRecalculation(widget, dependencies, cb) {
  const trigger = function () {
    this.triggerRecalculate(cb);
  };

  const task = defineRecalculationTask(dependencies, function () {
    cb.call(this, this.options);
  });

  widget.addTask(task);
}

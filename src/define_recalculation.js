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

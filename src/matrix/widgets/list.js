import { define_class } from '../../widget_helpers.js';
import { Container } from '../../widgets/container.js';

export const List = define_class({
    Extends: Container,
    
    _options: Object.assign(Object.create(Container.prototype._options), {
        
    }),
    options: {
        
    },
    initialize: function (options) {
        if (!options.element) options.element = element('div');
        Container.prototype.initialize.call(this, options);
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-list");
    },
    redraw: function () {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;
    },
});

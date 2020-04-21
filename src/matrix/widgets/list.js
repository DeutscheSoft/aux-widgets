import { define_class } from '../../widget_helpers.js';
import { inner_width, inner_height } from '../../utils/dom.js';
import { Container } from '../../widgets/container.js';

export const List = define_class({
    Extends: Container,
    
    _options: Object.assign(Object.create(Container.prototype._options), {
        "size" : "number|boolean",
    }),
    options: {
        size: false,
    },
    entries: [],
    width: 0,
    height: 0,
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
        
        Container.prototype.redraw.call(this);
    },
    resize: function () {
        var E = this.element;
        if (this.options.size === false && this.children && this.children.length) {
            var rect = this.children[0].element.getBoundingClientRect();
            this.set("size", rect.height);
        }
        
        this.width = inner_width(E);
        this.height = inner_height(E);
        
        var count = ~~(this.height / this.size);
        
        while (this.entries.length > count)
            this.remove_child(this.entries[0]);
        
        while (this.entries.length < count)
            this.add_child(new this.options.entry_class());
        
        Container.prototype.resize.call(this);
    },
    add_child: function (child) {
        Widget.prototype.add_child.call(this, child);
        if (child instanceof ListEntry) {
            this.entries.push(child);
            this.emit("entryadded", child);
        }
    },
    remove_child: function (child) {
        Widget.prototype.remove_child.call(this, child);
        if (child instanceof ListEntry) {
            const entries = this.entries;
            const i = entries.indexOf(child);
            if (i !== -1) {
                var E = this.entries.splice(i, 1);
                this.emit("entryremoved", E[0]);
            }
        }
    },
});

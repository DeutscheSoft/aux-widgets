import { Widget } from './widget.js';
import { Label } from '../../widgets/label.js';

export const Entry = define_class({
    Extends: Widget,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        label: "string|boolean",
        depth: "number",
    }),
    initialize: function (options) {
        if (!options.element) options.element = element('div');
        Widget.prototype.initialize.call(this, options);
        this.datum = null;
        this.datumSubscription = null;
    },
    setDatum: function(datum) {
        if (this.datumSubscription)
        {
            this.datumSubscription();
            this.datumSubscription = null;
        }

        if (!datum)
        {
            this.hide();
        }
        else
        {
            // connect properties of the data entry with
            // our options
            this.set('label', datum.label);


            this.datumSubscription = datum.subscribe('propertyChanged',
                                                     (name, value) => this.datumPropertyChanged(name, value));
            if (!this.datum)
            {
                this.show();
            }
        }

        this.datum = datum;
    },
    datumPropertyChanged: function(name, value)
    {
        switch (name)
        {
        case 'depth':
        case 'label':
            this.set(name, value);
            break;
        }
    }
});

define_child_widget(Entry, "label", {
    create: Label,
    option: "label",
    inherit_options: true,
    toggle_class: true,
});

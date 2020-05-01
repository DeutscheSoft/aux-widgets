import { define_class, define_child_element } from './../../widget_helpers.js';
import { scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { sprintf } from '../../index.js';
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { Container } from './../../widgets/container.js';
import { Indicator } from './indicator.js';

const SCROLLBAR_SIZE = scrollbar_size();

function scroll (e) {
    const O = this.options;
    const E = this.element;
    
    const internal = this._internal_scroll;
    this._internal_scroll = false;
    
    const diff_x = O.scroll_left - E.scrollLeft;
    const diff_y = O.scroll_top - E.scrollTop;
    
    O.scroll_left = this.element.scrollLeft;
    O.scroll_top = this.element.scrollTop;
    
    draw.call(this);
    
    if (internal) return false;
    
    if (diff_x)
        this.emit("useraction", "scroll_left", O.scroll_left);
        
    if (diff_y)
        this.emit("useraction", "scroll_top", O.scroll_top);
}

function draw () {
    const O = this.options;
    const size = O.size;
    
    const micro_x = O.scroll_left % size;
    const start_x = Math.floor(O.scroll_left / size);
    const diff_x = start_x - O.listview_top.startIndex;
    
    const micro_y = O.scroll_top % size;
    const start_y = Math.floor(O.scroll_top / size);
    const diff_y = start_y - O.listview_left.startIndex;
    
    if (diff_x) {
        if (diff_x < O._amount_x) {
            rearrange_x.call(this, diff_x, O._amount_x, O._amount_y);
            O.listview_top.scrollStartIndex(diff_x);
        } else {
            O.listview_top.setStartIndex(start_x);
        }
    }
    if (diff_y) {
        if (diff_y < O._amount_y) {
            rearrange_y.call(this, diff_y, O._amount_x, O._amount_y);
            O.listview_left.scrollStartIndex(diff_y);
        } else {
            O.listview_left.setStartIndex(start_y);
        }
    }
    
    for (let i = 0, max = this.entries.length; i < max; ++i) {
        const element = this.entries[i].element;
        element.style.transform = sprintf(
            'translate(%.2fpx, %.2fpx)',
            (i % O._amount_x) * size + O.scroll_left - micro_x,
            ~~(i / O._amount_x) * size + O.scroll_top - micro_y
        );
    }
}

function rearrange_x (diff, x, y) {
    if (diff > 0) {
        for (let i = 0, m = y; i < m; ++i) {
            const tmp = this.entries.splice(i * x, diff);
            this.entries.splice((i + 1) * x - diff, 0, ...tmp);
        }
    } else {
        for (let i = 0, m = y; i < m; ++i) {
            const tmp = this.entries.splice((i + 1) * x + diff, -diff);
            this.entries.splice(i * x, 0, ...tmp);
        }
    }
}

function rearrange_y (diff, x, y) {
    if (diff > 0) {
        const tmp = this.entries.slice(0, diff * x);
        this.entries.splice(0, diff * x);
        this.entries = this.entries.concat(tmp);
    } else {
        const tmp = this.entries.slice(this.entries.length + diff * x);
        this.entries = tmp.concat(this.entries.slice(0, this.entries.length + diff * x));
    }
}

function subscribe_all (pos) {
    const listview = this.options["listview_" + pos];
    let sub = listview.subscribeStartIndexChanged(start_index_cb.call(this, pos));
    sub = add_subscription(sub, listview.subscribeSize(size_cb.call(this, pos)));
    this.subscriptions[pos] = sub;
}

function start_index_cb (pos) {
    return (function (start, last) {
        this._internal_scroll = true;
        const posup = pos === "top" ? "Left" : "Top";
        this.element["scroll" + posup] = (1 + start) * this.options.size;
        draw.call(this);
    }).bind(this);
}

function size_cb (pos) {
    return (function (size) {
        const dir = pos === "top" ? "width" : "height";
        this.set("_scroller_" + dir, size);
    }).bind(this);
}

export const Indicators = define_class({
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        _scroller_width: "number",
        _scroller_height: "number",
        _amount_x: "number",
        _amount_y: "number",
        
        indicator_class: "object",
        scroll_top: "number",
        scroll_left: "number",
        listview_top: "object",
        listview_left: "object",
    }),
    options: {
        _scroller_width: 0,
        _scroller_height: 0,
        _amount_x: 0,
        _amount_y: 0,
        
        indicator_class: Indicator,
        scroll_top: 0,
        scroll_left: 0,
    },
    static_events: {
        set_listview_top: function (listview) {
            if (this.subscriptions.top)
                this.subscriptions.top = unsubscribe_subscriptions(this.subscriptions.top);
            subscribe_all.call(this, "top");
        },
        set_listview_left: function (listview) {
            if (this.subscriptions.left)
                this.subscriptions.left = unsubscribe_subscriptions(this.subscriptions.left);
            subscribe_all.call(this, "left");
        },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        this.subscriptions = { left: null, top: null };
        this.entries = [];
        this._internal_scroll = false;
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        add_class(element, "aux-indicators");
        this.element.addEventListener("scroll", scroll.bind(this), { passive: true });
    },
    redraw: function () {
        const O = this.options;
        const I = this.invalid;
        const E = this.element;
        
        if (I._amount_x || I._amount_y) {
            const amount = O._amount_x * O._amount_y;
            while (this.entries.length > amount)
                this.remove_child(this.entries[this.entries.length - 1]);
            
            while (this.entries.length < amount)
                this.append_child(new this.options.indicator_class());
            
            /* DELETE ME!! --> */
            for (let i = 0, m = this.entries.length; i < m; ++i) {
                this.entries[i].element.innerHTML=i;
            }
            /* <-- DELETE ME!! */
            
            draw.call(this);
        }
        
        if (I._scroller_width) {
            I._scroller_width = false;
            this._scroller.style.width = (O._scroller_width * O.size) + "px";
        }
        if (I._scroller_height) {
            I._scroller_height = false;
            this._scroller.style.height = (O._scroller_height * O.size) + "px";
        }
        
        if (I.scroll_left) {
            I.scroll_left = false;
            this._internal_scroll = true;
            this.element.scrollLeft = O.scroll_left;
        }
        if (I.scroll_top) {
            I.scroll_top = false;
            this._internal_scroll = true;
            this.element.scrollTop = O.scroll_top;
        }
    },
    resize: function () {
        const E = this.element;
        const O = this.options;
        
        this.set("_amount_x", 1 + Math.ceil(E.offsetWidth / O.size));
        this.set("_amount_y", 1 + Math.ceil(E.offsetHeight / O.size));

        Container.prototype.resize.call(this);
    },
    add_child: function (child) {
        Container.prototype.add_child.call(this, child);
        if (child instanceof Indicator) {
            this.entries.push(child);
            this._scroller.appendChild(child.element);
            this.emit("indicatoradded", child);
        }
        return child;
    },
    remove_child: function (child) {
        if (child instanceof Indicator) {
            const entries = this.entries;
            const i = entries.indexOf(child);
            if (i !== -1) {
                let E = this.entries.splice(i, 1);
                this.emit("indicatorremoved", E[0]);
                this._scroller.removeChild(E[0].element);
            }
        }
        Container.prototype.remove_child.call(this, child);
    },
});

define_child_element(Indicators, "scroller", {
    show: true,
});

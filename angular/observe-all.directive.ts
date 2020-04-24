import { Directive, ElementRef, Input } from '@angular/core';
import { Observable, SubscriptionLike } from 'rxjs';
import {
    AuxSubscriptions, make_subscription
  } from './subscriptions.model';
import { observe_option } from '@deuso/aux';

@Directive({
  selector: '[auxObserveAll]'
})
export class AuxObserveAllDirective extends AuxSubscriptions {
  protected install_binding(widget: any, name: string, b: any)
    : SubscriptionLike
  {
    if (typeof(b) === 'object' && b.next)
    {
      return make_subscription(observe_option(widget, name, (v) => {
        b.next(v);
      }));
    }
    else if (typeof(b) === 'function')
    {
      return make_subscription(observe_option(widget, name, b));
    }
    else
    {
      throw new Error("Unsupported binding type."); 
    }
  }

  @Input('auxObserveAll')
  set auxObserveAll(bindings: {[name: string]: any}|null)
  {
    this.update(bindings);
  }
}

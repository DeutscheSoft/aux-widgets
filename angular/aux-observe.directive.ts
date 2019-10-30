import { Directive, ElementRef, Input } from '@angular/core';
import { Observable, SubscriptionLike } from 'rxjs';
import {
    AuxSubscriptions, make_subscription
  } from './aux-subscriptions.model';
import { observe_useraction } from '@deuso/aux';

@Directive({
  selector: '[auxObserve]'
})
export class AuxObserveDirective extends AuxSubscriptions {
  protected install_binding(widget: any, name: string, b: any)
    : SubscriptionLike
  {
    if (typeof(b) === 'object' && b.next)
    {
      return make_subscription(observe_useraction(widget, name, (v) => {
        b.next(v);
      }));
    }
    else if (typeof(b) === 'function')
    {
      return make_subscription(observe_useraction(widget, name, b));
    }
    else
    {
      throw new Error("Unsupported binding type."); 
    }
  }

  @Input('auxObserve')
  set auxObserve(bindings: {[name: string]: any}|null)
  {
    this.update(bindings);
  }
}

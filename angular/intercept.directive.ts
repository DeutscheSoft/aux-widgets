import { Directive, ElementRef, Input } from '@angular/core';
import { Observable, SubscriptionLike } from 'rxjs';
import {
    AuxSubscriptions, make_subscription
  } from './subscriptions.model';
import { intercept_option } from '@deuso/aux';

@Directive({
  selector: '[auxIntercept]'
})
export class AuxInterceptDirective extends AuxSubscriptions
{
  protected install_binding(widget: any, name: string, b: any)
    : SubscriptionLike
  {
    if (typeof(b) === 'object' && b.next)
    {
      return make_subscription(intercept_option(widget, name, (v) => {
        b.next(v);
      }));
    }
    else if (typeof(b) === 'function')
    {
      return make_subscription(intercept_option(widget, name, b));
    }
    else
    {
      throw new Error("Unsupported binding type."); 
    }
  }

  @Input('auxIntercept')
  set auxIntercept(bindings: {[name: string]: any}|null)
  {
    this.update(bindings);
  }
}

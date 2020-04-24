import { Directive, ElementRef, Input } from '@angular/core';
import { Observable, SubscriptionLike } from 'rxjs';
import {
    AuxSubscriptions, aux_subscribe
  } from './subscriptions.model';

@Directive({
  selector: '[auxSubscribe]'
})
export class AuxSubscribeDirective extends AuxSubscriptions {
  protected install_binding(widget: any, name: string, b: any)
    : SubscriptionLike
  {
    if (typeof(b) === 'object' && b.next)
    {
      return aux_subscribe(widget, name, (...args) => {
        b.next(args);
      });
    }
    else if (typeof(b) === 'function')
    {
      return aux_subscribe(widget, name, b);
    }
    else
    {
      throw new Error("Unsupported binding type."); 
    }
  }

  @Input('auxSubscribe')
  set auxSubscribe(bindings: {[name: string]: any}|null)
  {
    this.update(bindings);
  }
}

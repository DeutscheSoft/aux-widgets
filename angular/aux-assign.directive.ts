import { Directive, ElementRef, Inject, Input } from '@angular/core';
import { Observable, SubscriptionLike, isObservable } from 'rxjs';
import { AuxSubscriptions } from './aux-subscriptions.model';

@Directive({
  selector: '[auxAssign]'
})
export class AuxAssignDirective extends AuxSubscriptions
{
  protected install_binding(widget: any, name: string, b: any)
    : SubscriptionLike
  {
    if (isObservable(b))
    {
      const o = b as Observable<any>;
      return o.subscribe((v) => {
        widget.set(name, v);
      });
    }
    else
    {
      widget.set(name, b);

      // nothing was subscribed
      return null;
    }
  }

  @Input('auxAssign')
  set auxAssign(bindings: {[name: string]: any}|null)
  {
    this.update(bindings);
  }
}

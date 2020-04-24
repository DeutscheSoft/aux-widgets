import { Directive, ElementRef, Inject, Input } from '@angular/core';
import { Observable, SubscriptionLike, isObservable } from 'rxjs';
import { AuxSubscriptions } from './subscriptions.model';
import { DebounceBinding } from '@deuso/aux';

@Directive({
  selector: '[auxBind]'
})
export class AuxBindDirective extends AuxSubscriptions
{
  private bindings = new Map<string,DebounceBinding>();

  protected remove_binding(widget: any, name: string)
  {
    let binding = this.bindings.get(name);

    if (binding)
    {
      this.bindings.delete(name);
      binding.destroy();
    }
  }

  protected install_binding(widget: any, name: string, b: any)
    : SubscriptionLike
  {
    let binding = this.bindings.get(name);

    if (!binding)
    {
      this.bindings.set(name, binding = new DebounceBinding(widget, name, 250));
    }

    if (isObservable(b))
    {
      const o = b as Observable<any>;
      return o.subscribe((v) => {
        binding.set(v);
      });
    }
    else
    {
      binding.set(b);

      // nothing was subscribed
      return null;
    }
  }

  @Input('auxBind')
  set auxBind(bindings: {[name: string]: any}|null)
  {
    this.update(bindings);
  }
}

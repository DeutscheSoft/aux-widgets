import { ElementRef, Inject, OnDestroy } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

export function make_subscription(subscription: Function): SubscriptionLike
{
  return {
    closed: false,
    unsubscribe()
    {
      if (this.closed) return;
      this.closed = true;
      subscription();
    },
  };
}

export function aux_subscribe(widget: any, name: string,
                               _cb: any): SubscriptionLike
{
  return make_subscription(widget.subscribe(name, (...args) => _cb(...args)));
}

export abstract class AuxSubscriptions implements OnDestroy
{
  private last: {[name: string]: any}|null = null;
  private subscriptions = new Map<string,SubscriptionLike>();

  protected remove_binding(widget: any, name: string): void
  {
  }

  protected abstract install_binding(widget: any, name: string, b: any)
    : SubscriptionLike;

  protected update(bindings: {[name: string]: any}|null)
  {
    const element = this.el.nativeElement;
    const widget = element.auxWidget;

    if (!widget)
    {
      if (element.tagName.startsWith('AUX-'))
      {
        throw new Error("The AUX WebComponent has not been upgraded, yet. "+
                        "Are you missing and import?");
      }
      throw new Error("The element is not an AUX WebComponent.");
    }

    const last = this.last || {};
    const current = bindings || {};

    for (let name in last)
    {
      // handled by loop below
      if (name in current) continue;

      // remove old subscriptions
      let subscriptions = this.subscriptions.get(name);

      if (subscriptions)
      {
        this.subscriptions.delete(name);
        subscriptions.unsubscribe();
      }

      this.remove_binding(widget, name);
    }

    for (let name in current)
    {
      const value = current[name];

      if (name in last)
      {
        const last_value = last[name];

        if (last_value === value) continue;

        // remove old subscriptions
        const subscriptions = this.subscriptions.get(name);

        if (subscriptions)
        {
          this.subscriptions.delete(name);
          subscriptions.unsubscribe();
        }
      }

      const subscription = this.install_binding(widget, name, value);

      if (subscription)
      {
        this.subscriptions.set(name, subscription);
      }
    }

    // we create a copy to make sure that our state is not
    // modified
    this.last = bindings ? Object.assign({}, bindings) : null;
  }

  constructor(@Inject(ElementRef) private el: ElementRef) { }

  public ngOnDestroy()
  {
    this.update(null);
  }
}

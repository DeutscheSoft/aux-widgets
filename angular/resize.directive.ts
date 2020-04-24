import { Directive, ElementRef, Inject, Input, OnDestroy } from '@angular/core';
import { Observable, SubscriptionLike, isObservable } from 'rxjs';

@Directive({
  selector: '[auxResize]'
})
export class AuxResizeDirective extends OnDestroy
{
  private subscription: SubscriptionLike = null;

  constructor(@Inject(ElementRef) private el: ElementRef) { }

  @Input('auxResize')
  set auxResize(event: any)
  {
    if (this.subscription)
    {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (!event) return;

    if (isObservable(event))
    {
      const o = b as Observable<any>;
      const element = this.el.nativeElement;
      const widget = element.auxWidget;

      if (!widget)
      {
        if (element.tagName.startsWith('AUX-'))
        {
          throw new Error("The A.UX WebComponent has not been upgraded, yet. "+
                          "Are you missing and import?");
        }
        throw new Error("The element is not an A.UX WebComponent.");
      }

      o.subscribe(() => {
        widget.trigger_resize();
      });
    }
  }

  public ngOnDestroy()
  {
    if (this.subscription)
    {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

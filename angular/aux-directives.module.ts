import { NgModule } from '@angular/core';
import { AuxAssignDirective } from './aux-assign.directive';
import { AuxBindDirective } from './aux-bind.directive';
import { AuxInterceptDirective } from './aux-intercept.directive';
import { AuxObserveAllDirective } from './aux-observe-all.directive';
import { AuxObserveDirective } from './aux-observe.directive';
import { AuxResizeDirective } from './aux-resize.directive';
import { AuxSubscribeDirective } from './aux-subscribe.directive';


@NgModule({
  declarations: [
    AuxAssignDirective,
    AuxBindDirective,
    AuxInterceptDirective,
    AuxObserveAllDirective,
    AuxObserveDirective,
    AuxResizeDirective,
    AuxSubscribeDirective
  ],
  exports: [
    AuxAssignDirective,
    AuxBindDirective,
    AuxInterceptDirective,
    AuxObserveAllDirective,
    AuxObserveDirective,
    AuxResizeDirective,
    AuxSubscribeDirective
  ],
  imports: [ ]
})
export class AuxDirectivesModule { }

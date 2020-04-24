import { NgModule } from '@angular/core';
import { AuxAssignDirective } from './assign.directive';
import { AuxBindDirective } from './bind.directive';
import { AuxInterceptDirective } from './intercept.directive';
import { AuxObserveAllDirective } from './observe-all.directive';
import { AuxObserveDirective } from './observe.directive';
import { AuxResizeDirective } from './resize.directive';
import { AuxSubscribeDirective } from './subscribe.directive';


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

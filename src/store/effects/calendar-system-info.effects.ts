import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store/src/models';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import * as CalendarSystemInfoActions from './../actions';
import { SystemInfoDataService } from '../services';

const toAction = CalendarSystemInfoActions.toAction();

@Injectable()
export class CalendarSystemInfoEffects {
  constructor(
    private actions$: Actions,
    private systemInfoDataService: SystemInfoDataService
  ) {}

  @Effect()
  getCalendarSystemInfo$: Observable<Action> = this.actions$
    .ofType(CalendarSystemInfoActions.FETCH_CALENDAR_SYSTEM_INFO)
    .pipe(
      switchMap(() =>
        toAction(
          this.systemInfoDataService.getCalendarSettingsSystemInfo(),
          CalendarSystemInfoActions.FetchCalendarSystemInfoSuccess,
          CalendarSystemInfoActions.FetchCalendarSystemInfoFail
        )
      )
    );
}

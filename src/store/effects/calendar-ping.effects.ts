import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store/src/models';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import * as CalendarPingActions from './../actions';
import { CalendarPingDataService } from '../services';

const toAction = CalendarPingActions .toAction();

@Injectable()
export class CalendarPingEffects {
  constructor(
    private actions$: Actions,
    private calendarPingDataService: CalendarPingDataService
  ) {}

  @Effect()
  getCalendarPing$: Observable<Action> = this.actions$
    .pipe(
      ofType(CalendarPingActions.FETCH_CALENDAR_PING_INFO),
      switchMap(() =>
        toAction(
          this.calendarPingDataService.getCalendarPingInfo(),
          CalendarPingActions.FetchCalendarPingSuccess,
          CalendarPingActions.FetchCalendarPingFail
        )
      )
    );
}

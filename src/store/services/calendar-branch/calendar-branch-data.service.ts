import { ICalendarBranch } from './../../../models/ICalendarBranch';
import { GlobalErrorHandler } from './../../../util/services/global-error-handler.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { calendarPublicEndpoint, DataServiceError, servicePoint, calendarEndpoint } from '../data.service';



@Injectable()
export class CalendarBranchDataService {
  constructor(private http: HttpClient, private errorHandler: GlobalErrorHandler) {}

  getCalendarBranches(): Observable<ICalendarBranch[]> {
    return this.http
      .get<ICalendarBranch[]>(`${calendarEndpoint}/branches/`)
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getCalendarPublicBranches(): Observable<ICalendarBranch[]> {
    return this.http
      .get<ICalendarBranch[]>(`${calendarPublicEndpoint}/branches/`)
      .pipe(catchError(this.errorHandler.handleError()));
  }
}

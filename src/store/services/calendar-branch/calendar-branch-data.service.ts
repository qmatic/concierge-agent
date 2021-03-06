import { ICalendarBranch } from './../../../models/ICalendarBranch';
import { GlobalErrorHandler } from './../../../util/services/global-error-handler.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { calendarPublicEndpoint, DataServiceError, servicePoint, calendarEndpoint } from '../data.service';
import { ICalendarBranchResponse } from '../../../models/ICalendarBranchResponse';
import { SystemInfoSelectors } from 'src/store/services/system-info/system-info.selectors';
import { async } from 'q';

@Injectable()
export class CalendarBranchDataService {

  hostAddress: string;
  private subscriptions: Subscription = new Subscription();
  authorizationHeader: HttpHeaders;

  constructor(private http: HttpClient, private errorHandler: GlobalErrorHandler, private systemInfoSelector : SystemInfoSelectors) {
    const hostSubscription = this.systemInfoSelector.centralHostAddress$.subscribe((info) => this.hostAddress = info);
    this.subscriptions.add(hostSubscription);
    const authorizationSubscription = this.systemInfoSelector.authorizationHeader$.subscribe((info) => this.authorizationHeader = info);
    this.subscriptions.add(authorizationSubscription);
  }

  getCalendarBranches(): Observable<ICalendarBranchResponse> {
    return this.http
      .get<ICalendarBranchResponse>(`${this.hostAddress}${calendarEndpoint}/branches/`, {headers : this.authorizationHeader })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getCalendarPublicBranches(): Observable<ICalendarBranchResponse> {
    return this.http
      .get<ICalendarBranchResponse>(`${this.hostAddress}${calendarPublicEndpoint}/branches/`)
      .pipe(catchError(this.errorHandler.handleError()));
  }
}

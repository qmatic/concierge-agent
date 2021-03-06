
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { IAppState } from '../../reducers';
import * as ServiceActions from '../../actions';
import { ICalendarBranch } from '../../../models/ICalendarBranch';
import { ICalendarService } from '../../../models/ICalendarService';

@Injectable()
export class CalendarServiceDispatchers {
  constructor(private store: Store<IAppState>) {}

  fetchServices(branch: ICalendarBranch) {
    this.store.dispatch(new ServiceActions.FetchCalendarServices(branch));
  }

  fetchServiceGroups(services: ICalendarService[], branch: ICalendarBranch, isMultiServiceEnabled = true) {
    this.store.dispatch(new ServiceActions.FetchServiceGroups(services, branch, isMultiServiceEnabled));
  }

  setSelectedServices(services: ICalendarService[]) {
    this.store.dispatch(new ServiceActions.SetSelectedCalendarServices(services));
  }

  removeFetchService(){
    this.store.dispatch(new ServiceActions.RemoveFetchServices());
  }

  setCalendarServiceSelected(val: boolean){
    this.store.dispatch(new ServiceActions.ServiceSelectionCompleted(val));
  }

  setInitialService(){
    this.store.dispatch(new ServiceActions.SetInitialCalendarServices());
  }

  setCalendarServiceFromCache(){
    this.store.dispatch(new ServiceActions.SetCalendarServicesFromCache());
  }

  resetInitialService(){
    this.store.dispatch(new ServiceActions.ResetInitialCalendarServices());
  }
}

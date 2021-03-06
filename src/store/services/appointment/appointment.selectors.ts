import { Injectable } from '@angular/core';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';

import { IAppState } from '../../reducers';
import { IAppointmentState } from '../../reducers/appointment.reducer';

// selectors
const getAppointmentState = createFeatureSelector<IAppointmentState>('appointments');

const getAllAppointments = createSelector(
  getAppointmentState,
  (state: IAppointmentState) => state.appointments
);

const getAllCalendarAppointments = createSelector(
  getAppointmentState,
  (state: IAppointmentState) => state.calendarAppointments
);

const getSelectedAppointment = createSelector(
  getAppointmentState,
  (state: IAppointmentState) => state.selectedAppointment
);

const getAppointmentsLoading = createSelector(
  getAppointmentState,
  (state: IAppointmentState) => state.loading
);

const getAppointmentsLoaded = createSelector(
  getAppointmentState,
  (state: IAppointmentState) => state.loaded
);

const getAppointmentsError = createSelector(
  getAppointmentState,
  (state: IAppointmentState) => state.error
);

const getRescheduleProgress = createSelector(
  getAppointmentState,
  (state: IAppointmentState) => state.rescheduleSuccess
);

@Injectable()
export class AppointmentSelectors {
  constructor(private store: Store<IAppState>) {}
  // selectors$
  appointments$ = this.store.select(getAllAppointments);
  calendarAppointments$ = this.store.select(getAllCalendarAppointments);
  selectedAppointment$ = this.store.select(getSelectedAppointment);
  appointmentsLoading$ = this.store.select(getAppointmentsLoading);
  appointmentsLoaded$ = this.store.select(getAppointmentsLoaded);
  appointmentsError$ = this.store.select(getAppointmentsError);
  rescheduleProgress$ = this.store.select(getRescheduleProgress);
}

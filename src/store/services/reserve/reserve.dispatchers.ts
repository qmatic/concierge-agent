import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { IAppState } from '../../reducers';
import * as ReserveActions from '../../actions';
import { IBookingInformation } from '../../../models/IBookingInformation';
import { IAppointment } from '../../../models/IAppointment';

@Injectable()
export class ReserveDispatchers {
  constructor(private store: Store<IAppState>) {}

  reserveAppointment(
    bookingInformation: IBookingInformation,
    appointment: IAppointment
  ) {
    const payload = {
      bookingInformation,
      appointment
    };

    this.store.dispatch(new ReserveActions.ReserveAppointment(payload));
  }

  fetchReservableDates(bookintInformation: IBookingInformation) {
    this.store.dispatch(new ReserveActions.FetchReservableDates(bookintInformation));
  }

  resetReserveAppointment(){
    this.store.dispatch(new ReserveActions.ResetReservedAppointment);
  }

  unreserveAppointment() {
    this.store.dispatch(new ReserveActions.UnreserveAppointment());
  }

}

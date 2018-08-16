import { IBranch } from 'src/models/IBranch';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { DEBOUNCE_TIME } from './../../../../constants/config';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { IDENTIFY_APPOINTMENT_ANIMATIONS } from 'src/app/animations/identify-appointment.animations';
import { AppointmentDispatchers, BranchSelectors } from 'src/store';

@Component({
  selector: 'qm-identify-appointment',
  templateUrl: './qm-identify-appointment.component.html',
  styleUrls: ['./qm-identify-appointment.component.scss'],

  animations: IDENTIFY_APPOINTMENT_ANIMATIONS

})

export class QmIdentifyAppointmentComponent implements OnInit, OnDestroy {

  tempCustomer:{
  time?:string;
  date?:string;
  id?:string;
  firstName?:string;
  lastName?:string;
  service?:string
}

  tempCustomers:any;
  selectedSearchIcon: string;
  searchPlaceHolderKey: string;
  showSearchInput: boolean;
  searchText: string;
  inputAnimationState: string;
  isSearchInputOpen: boolean;
  fromTime: NgbTimeStruct;
  toTime: NgbTimeStruct;
  inputChanged: Subject<string> = new Subject<string>();
  fromTimeController: FormControl;
  toTimeController: FormControl;
  subscriptions: Subscription = new Subscription();
  searchInputController = new FormControl();
  selectedBranch: IBranch;
  readonly SEARCH_STATES = {
    DURATION: 'duration'
  };

  height:string;

  constructor(private appointmentDispatchers: AppointmentDispatchers,
    private branchSelectors: BranchSelectors) { }

  ngOnInit() {
    this.inputAnimationState = 'out';
    this.setInitialTime();
    this.fromTimeController = new FormControl('', (control: FormControl) => {
      return this.getTimeSelectionValidity(control.value, this.toTime);
    });

    this.toTimeController = new FormControl('', (control: FormControl) => {
      return this.getTimeSelectionValidity(this.fromTime, control.value);
    });
    this.tempCustomer={time:'11:09',date:'2018-05-10', id:'2096', firstName:'john',lastName:'david',service:'service 1'}
    this.tempCustomers=[this.tempCustomer,this.tempCustomer,this.tempCustomer,this.tempCustomer,
      this.tempCustomer,this.tempCustomer,this.tempCustomer,this.tempCustomer,this.tempCustomer,
      this.tempCustomer,this.tempCustomer,this.tempCustomer,this.tempCustomer,this.tempCustomer,
      this.tempCustomer,this.tempCustomer,this.tempCustomer,this.tempCustomer,this.tempCustomer]
    this.height = 'calc(100vh - 230px)';

    this.inputChanged
      .pipe(distinctUntilChanged(), debounceTime(DEBOUNCE_TIME || 0))
      .subscribe(text => this.searchApointments(text));

    const branchSubscription = this.branchSelectors.selectedBranch$.subscribe((br) => {
      this.selectedBranch = br;
    });

    this.subscriptions.add(branchSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setInitialTime() {
    let currentTime = moment();
    this.fromTime = { hour: parseInt(currentTime.format('HH')), minute: parseInt(currentTime.format('mm')), second: 0 };
    this.toTime = { hour: parseInt(currentTime.format('HH')) + 1, minute: parseInt(currentTime.format('mm')), second: 0 };
  }

  getTimeSelectionValidity(fromTime, toTime) {
    let validationConfig = null;
    if (fromTime.hour > toTime.hour) {
      validationConfig = { invalidTime: true };
    }
    if (fromTime.hour == toTime.hour && fromTime.minute >= toTime.minute) {
      validationConfig = { invalidTime: true };
    }
    return validationConfig;
  }

  onSearchButtonClick(searchButton) {
    this.isSearchInputOpen = !this.isSearchInputOpen;
    this.searchText = '';
    if (searchButton == 'id') {
      this.searchPlaceHolderKey = 'please_enter_id_and_press_enter';
    }
    else if (searchButton === 'customer') {
      this.searchPlaceHolderKey = 'please_enter_customer_attributes';
    }
    else {
    }

    if (this.inputAnimationState == 'out') {
      this.inputAnimationState = searchButton;
    } else if (this.inputAnimationState == searchButton) {
      this.inputAnimationState = 'out';
    }
    else {
      this.inputAnimationState = searchButton;
    }

    this.selectedSearchIcon = searchButton;
  }


  onSelectTime() {
    this.isSearchInputOpen = true;
    this.searchText = `${this.fromTime.hour} : ${this.fromTime.minute} - ${this.toTime.hour} : ${this.toTime.minute}`;
    this.inputAnimationState = 'input';
    this.selectedSearchIcon = '';
    this.searchInputController.setValue( `${this.fromTime.hour} : ${this.fromTime.minute} - ${this.toTime.hour} : ${this.toTime.minute}`);
    this.searchApointments(this.searchText);
  }

  searchApointments(searchText) {
    let searchQuery: any = {
      branchId: this.selectedBranch.id
    };

    if (this.selectedSearchIcon === this.SEARCH_STATES.DURATION) {
      searchQuery = {
        ...searchQuery,
        toDate: `${moment().format('YYYY-MM-DD')}T${this.fromTime.hour}:${this.fromTime.minute}`,
        fromDate: `${moment().format('YYYY-MM-DD')}T${this.toTime.hour}:${this.toTime.minute}`
      };
    }

    this.appointmentDispatchers.searchAppointments(searchQuery);
  }

  onSearchInputChange() {
    this.inputChanged.next(this.searchText);
  }
}

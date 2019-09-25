import { QmClearInputDirective } from './../../../directives/qm-clear-input.directive';
import { DEBOUNCE_TIME } from './../../../../constants/config';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { QmModalService } from './../qm-modal/qm-modal.service';
import { Observable, Subject } from 'rxjs';
import { ICalendarBranchViewModel } from './../../../../models/ICalendarBranchViewModel';
import { Subscription } from 'rxjs';
import { Component, OnInit, EventEmitter, Output, OnDestroy, Input, ViewChild } from '@angular/core';
import { CalendarBranchSelectors, CalendarBranchDispatchers, UserSelectors, BranchSelectors,
         TimeslotDispatchers, ReserveDispatchers, ServicePointSelectors } from 'src/store';
import { ICalendarBranch } from 'src/models/ICalendarBranch';
import { LocalStorage, STORAGE_SUB_KEY } from '../../../../util/local-storage';
import { IBranch } from 'src/models/IBranch';
import { FilterBranchPipe } from './filter-branch.pipe';

@Component({
  selector: 'qm-select-branch',
  templateUrl: './qm-select-branch.component.html',
  styleUrls: ['./qm-select-branch.component.scss']
})
export class QmSelectBranchComponent implements OnInit, OnDestroy {

  calendarBranches: ICalendarBranchViewModel[] = new Array<ICalendarBranchViewModel>();
  private subscriptions: Subscription = new Subscription();
  currentBranch: ICalendarBranch = new ICalendarBranch();
  inputChanged: Subject<string> = new Subject<string>();
  filterText: string = '';
  isFlowSkip: boolean = true;
  searchText: string = '';
  userDirection$: Observable<string>;
  showToolTip: boolean;
  skipBranchFocus: boolean;
  skipButtonHover: boolean;
  mousePressed: boolean;
  userDirection: string;

  @ViewChild(QmClearInputDirective) clearInputDirective: QmClearInputDirective;

  private _isVisible: boolean;

  @Input() set isVisible(value: boolean) {
    this._isVisible = value;

    if (value) {
      this.onFlowStepActivated();
    }
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  @Output()
  onFlowNext: EventEmitter<any> = new EventEmitter();

  constructor(private userSelectors: UserSelectors, private calendarBranchSelectors: CalendarBranchSelectors,
    private calendarBranchDispatchers: CalendarBranchDispatchers, private qmModalService: QmModalService,
    private branchSelectors: BranchSelectors,
    private localStorage: LocalStorage,
    private timeSlotDispatchers: TimeslotDispatchers,
    private reserveDispatcher: ReserveDispatchers) {

    this.isFlowSkip = localStorage.getSettingForKey(STORAGE_SUB_KEY.BRANCH_SKIP);
    this.skipBranchFocus = false;

    if (this.isFlowSkip === undefined) {
      this.isFlowSkip = true;
    }

    const calendarBranchSubscription = this.calendarBranchSelectors.branches$.subscribe((bs) => {
      this.calendarBranches = <Array<ICalendarBranchViewModel>>bs;

      this.branchSelectors.selectedBranch$.subscribe((spBranch) => {
        // if flow is skipped then use the service point branch as current branch
        if (this.isFlowSkip) {
          this.calendarBranches.forEach((cb) => {
            if (spBranch.id === cb.qpId) {
              this.currentBranch = cb;
              this.calendarBranchDispatchers.selectCalendarBranch(cb);
            }
          });
        }
      });
    });

    this.subscriptions.add(calendarBranchSubscription);

    this.userDirection$ = this.userSelectors.userDirection$;
    this.userDirection$.subscribe((ud)=>{
      this.userDirection = ud;
    })
    this.inputChanged
      .pipe(distinctUntilChanged(), debounceTime(DEBOUNCE_TIME || 0))
      .subscribe(text => this.filterBranches(text));
  }
  // Arrow key functions
  onDownButttonPressed (i: number) {
    if (document.getElementById(`${i+1}-branch-btn`)) {
      document.getElementById(`${i+1}-branch-btn`).focus();
    }
  }
  onUpButttonPressed (i: number) {
    if (document.getElementById(`${i-1}-branch-btn`)) {
      document.getElementById(`${i-1}-branch-btn`).focus();
    }
  }
  onLeftButttonPressed(i: number) {
    if(this.userDirection.toLowerCase() == 'rtl') {
      if(document.getElementById(`${i}-more-info`)) {
        document.getElementById(`${i}-more-info`).focus();
      }
    }
  }
  onRightButttonPressed(i: number) {
    if(this.userDirection.toLowerCase() == 'ltr') {
      if(document.getElementById(`${i}-more-info`)) {
        document.getElementById(`${i}-more-info`).focus();
      }
    }
  }
  onLeftButttonPressedinInfo(i: number) {
    if(this.userDirection.toLowerCase() == 'ltr') {
      if(document.getElementById(`${i}-branch-btn`)) {
        document.getElementById(`${i}-branch-btn`).focus();
      }
    }
  }
  onRightButttonPressedinInfo(i: number) {
    if(this.userDirection.toLowerCase() == 'rtl') {
      if(document.getElementById(`${i}-branch-btn`)) {
        document.getElementById(`${i}-branch-btn`).focus();
      }
    }
  }

  onToggleBranchSelection(branch: ICalendarBranchViewModel) {
    if (this.currentBranch.id && this.currentBranch.id != branch.id) {
      this.qmModalService.openForTransKeys('', 'label.msg_confirm_branch_selection', 'label.yes', 'label.no', (v) => {
        if (v) {
          this.calendarBranchDispatchers.selectCalendarBranch(branch);
          this.timeSlotDispatchers.deselectTimeslot();
          this.currentBranch = branch;
          this.goToNext();
        }
      }, () => { });
    } else if (!this.currentBranch.id) {
      this.timeSlotDispatchers.deselectTimeslot();
      this.currentBranch = branch;
      this.calendarBranchDispatchers.selectCalendarBranch(branch);
      this.goToNext();
    }
  }

  getBranchCount() {

  }

  ngOnInit() { 
  
  }

  deselectBranch() {
      this.calendarBranchDispatchers.selectCalendarBranch({} as ICalendarBranch);
      this.currentBranch = {} as ICalendarBranch;
  }

  onFlowStepActivated() {
    this.searchText = '';
    this.filterText = '';
    if (this.clearInputDirective) {
      this.clearInputDirective.updateButtonVisibility('');
    }
  }

  goToNext() {
    this.timeSlotDispatchers.resetTimeslots();
    this.reserveDispatcher.resetReserveAppointment();
    this.onFlowNext.emit();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  handleInput($event) {
    this.inputChanged.next($event.target.value);
  }

  filterBranches(newFilter: string) {
    this.filterText = newFilter;
  }

  doneButtonClick() {
    this.onFlowNext.emit();
  }
  filterBranchCount(count) {
    console.log(count);
    
  }
  onSwitchChange() {
    this.localStorage.setSettings(STORAGE_SUB_KEY.BRANCH_SKIP, this.isFlowSkip);
  }

  clickedshowToolTip(){  
    if(this.showToolTip){
      this.showToolTip = false;
    } else {
      this.showToolTip = true;
    }  
  }

  getBranchAddressText(branch: IBranch) {
    let completeAddress = '';
    if (branch) {
      const fieldsToLookFor = [
        'addressLine1',
        'addressLine2',
        'addressCity',
        'addressCountry'
      ];

      fieldsToLookFor.forEach((curr) => {
        if (curr in branch) {
          const value = branch[curr];
          if (value !== null && value.trim() !== '') {
            if(completeAddress == '') {
              completeAddress = value;
            } else {
              completeAddress += ', ' + value;
            }
          }
        }
      });
    }

    return completeAddress;
  }

  branchInputEnterPressed() {
    var BranchElements = document.getElementsByClassName("qm-branch-list__item--text")
    if(document.getElementById('searchTextDetails')) {
      document.getElementById('searchTextDetails').focus();
    } else {
    if(document.getElementsByClassName("qm-branch-list__item--text").length>0) {
      document.getElementsByClassName("qm-branch-list__item--text")[0].setAttribute('id',"firstBranchElement");
      setTimeout(() => {
        if(document.getElementById('firstBranchElement')) {
          document.getElementById('firstBranchElement').focus();
        }
      }, 100);
    }}
  }
  branchCount() {
    var sampleFilter = new FilterBranchPipe()
    return sampleFilter.transform(this.calendarBranches,this.searchText).length;
     
  }
 
}

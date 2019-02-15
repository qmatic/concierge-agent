import { Component, OnInit } from '@angular/core';
import { Subscription, Observable,Subject } from 'rxjs';
import { IBranch } from '../../../../models/IBranch';
import { IStaffPool } from '../../../../models/IStaffPool';
import { UserSelectors, StaffPoolDispatchers, StaffPoolSelectors, BranchSelectors, QueueVisitsSelectors, QueueSelectors, InfoMsgDispatchers, ServicePointSelectors, DataServiceError, QueueDispatchers, QueueVisitsDispatchers } from '../../../../store';
import { TranslateService } from '@ngx-translate/core';
import { Visit } from '../../../../models/IVisit';
import { QmModalService } from '../qm-modal/qm-modal.service';
import { SPService } from '../../../../util/services/rest/sp.service';
import { Router } from '@angular/router';
import { IServicePoint } from '../../../../models/IServicePoint';
import { ToastService } from './../../../../util/services/toast.service';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { DEBOUNCE_TIME } from './../../../../constants/config';
import { Q_ERROR_CODE } from '../../../../util/q-error';

@Component({
  selector: 'qm-transfer-to-staff-pool',
  templateUrl: './qm-transfer-to-staff-pool.component.html',
  styleUrls: ['./qm-transfer-to-staff-pool.component.scss']
})
export class QmTransferToStaffPoolComponent implements OnInit {
  userDirection$: Observable<string>;
  private subscriptions: Subscription = new Subscription();
  currentBranch:IBranch;
  StaffPool:IStaffPool[];
  selectedVisit:Visit;
  SearchVisit:string;
  searchText:string;
  selectedServicePoint:IServicePoint;
  
  inputChanged: Subject<string> = new Subject<string>();
  sortAscending = true;
  filterText: string = '';
  loaded:boolean;
  loading:boolean;

  constructor(
    private userSelectors:UserSelectors,
    private StaffPoolDispatchers:StaffPoolDispatchers,
    private StaffPoolSelectors:StaffPoolSelectors,
    private translateService:TranslateService,
    private BranchSelectors:BranchSelectors,
    private VisitSelectors:QueueSelectors,
    private qmModalService:QmModalService,
    private spService:SPService,
    private ServicePointSelectors:ServicePointSelectors,
    private toastService:ToastService,
    private queueDispatchers:QueueDispatchers,
  ) { 

    
    const staffPoolLoadingSubscription = this.StaffPoolSelectors.StaffPoolLoading$.subscribe((loading)=>{
          this.loading = loading;
           });
    this.subscriptions.add(staffPoolLoadingSubscription);

    this.userDirection$ = this.userSelectors.userDirection$;

    const staffPoolLoadedSubscription = this.StaffPoolSelectors.StaffPoolLoaded$.subscribe((loaded)=>{
          this.loaded = loaded;
          });
    this.subscriptions.add(staffPoolLoadedSubscription);

    const staffPoolSubscription = this.StaffPoolSelectors.StaffPool$.subscribe((staffPool)=>{
        this.StaffPool = staffPool;
        this.sortQueueList(); 
     });
    this.subscriptions.add(staffPoolSubscription);


    const selectedVisitSubscription =  this.VisitSelectors.selectedVisit$.subscribe((visit)=>{
        this.selectedVisit = visit;
    })
    this.subscriptions.add(selectedVisitSubscription);

    const ServicePointSubscription = this.ServicePointSelectors.openServicePoint$.subscribe((sp)=>{
      this.selectedServicePoint = sp;
    })
    this.subscriptions.add(ServicePointSubscription);

    this.inputChanged
    .pipe(distinctUntilChanged(), debounceTime(DEBOUNCE_TIME || 0))
    .subscribe(text => this.filterStaffPool(text));
   
   
  }

  ngOnInit() {
    const branchSubscription = this.BranchSelectors.selectedBranch$.subscribe((branch)=>{
      this.currentBranch = branch;
    })
    this.subscriptions.add(branchSubscription);

    this.StaffPoolDispatchers.fetchStaffPool(this.currentBranch.id); 
    
  
  }



  selectPool(s){
    
    
    if(this.selectedVisit){
      this.translateService.get('transfer_visit_to_staff_member_confirm_box',
      {
        visit: this.selectedVisit.ticketId,
      }).subscribe(
        (label: string) => 
          this.qmModalService.openForTransKeys('', `${label}`, 'yes', 'no', (result) => {
            if(result){
              
            this.spService.staffPoolTransfer(this.currentBranch,this.selectedServicePoint,s,this.selectedVisit).subscribe( result=>{
             
              this.translateService.get('visit_transferred').subscribe((label)=>{
                // var successMessage = {
                //   firstLineName: label,
                //   firstLineText:this.selectedVisit.ticketId,
                //   icon: "correct",
                // }
                this.toastService.infoToast(label);
               
              });
            }
            , error => {
              const err = new DataServiceError(error, null);
              
              if (error.errorCode == Q_ERROR_CODE.NO_VISIT) {
                this.translateService.get('requested_visit_not_found').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              }
              else if (error.errorCode == Q_ERROR_CODE.STAFF_MEMBER_LOGOUT) {
                this.translateService.get('empty_user_pool').subscribe(v => {
                  this.toastService.errorToast(v);
                  this.StaffPoolDispatchers.resetStaffPool;
                  this.StaffPoolDispatchers.fetchStaffPool(this.currentBranch.id);  
                });
              }  else if (error.errorCode == Q_ERROR_CODE.SERVED_VISIT) {
                this.translateService.get('requested_visit_not_found').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              }else if (err.errorCode === '0') {
                this.translateService.get('request_fail').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              }
              else {
                this.translateService.get('request_fail').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              }
            }
          )
          this.queueDispatchers.resetSelectedQueue();
          this.queueDispatchers.setectVisit(null);
          this.queueDispatchers.resetFetchVisitError();
          this.queueDispatchers.resetQueueInfo();
          this.queueDispatchers.resetVisitIDLoaded();
            }
      }, () => {
      })
      ).unsubscribe()
      
    }
  }

  onSortClickbyLastName(){
    this.sortAscending = !this.sortAscending;
    this.sortQueueList();
  
  }
 
filterStaffPool(newFilter: string) {    
  this.filterText = newFilter;
 }

sortQueueList() {
  if (this.StaffPool) {
    // sort by name
    this.StaffPool = this.StaffPool.sort((a, b) => {
            var nameA = a.firstName.toUpperCase() + a.lastName.toUpperCase(); // ignore upper and lowercase
            var nameB = b.firstName.toUpperCase() + b.lastName.toUpperCase(); // ignore upper and lowercase
           
            if ((nameA < nameB && this.sortAscending) || (nameA > nameB && !this.sortAscending) ) {
              return -1;
            }
            if ((nameA > nameB && this.sortAscending) || (nameA < nameB && !this.sortAscending)) {
              return 1;
            }
            // names must be equal
            return 0;
      });
  }

}
ngOnDestroy() {
  this.subscriptions.unsubscribe();
}

handleInput($event) {
  this.inputChanged.next($event.target.value);
}

clearSearchText(){
  this.filterText="";
}
  
}





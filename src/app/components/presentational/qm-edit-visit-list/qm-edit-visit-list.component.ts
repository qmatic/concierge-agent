import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { UserSelectors, QueueVisitsDispatchers, BranchSelectors, QueueVisitsSelectors, QueueDispatchers, QueueSelectors, ServicePointSelectors, InfoMsgDispatchers, DataServiceError, NativeApiSelectors, NativeApiDispatchers, SystemInfoSelectors } from '../../../../store';
import { Subscription, Observable } from 'rxjs';
import { Visit } from '../../../../models/IVisit';
import { QmModalService } from '../qm-modal/qm-modal.service';
import { SPService } from '../../../../util/services/rest/sp.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ERROR_STATUS, Q_ERROR_CODE } from '../../../../util/q-error';
import { ToastService } from '../../../../util/services/toast.service';
import { NativeApiService } from '../../../../util/services/native-api.service';
import { Util } from '../../../../util/util';
import * as moment from 'moment-timezone';


enum SortBy {
  VISITID = "VISITID",
  CUSTOMER = "CUSTOMER",
  SERVICE = "SERVICE",
  APPTIME = "APPTIME"
}


@Component({
  selector: 'qm-edit-visit-list',
  templateUrl: './qm-edit-visit-list.component.html',
  styleUrls: ['./qm-edit-visit-list.component.scss']
})

export class QmEditVisitListComponent implements OnInit, OnDestroy {

  userDirection$: Observable<string> = new Observable<string>();
  private subscriptions: Subscription = new Subscription();
  selectedbranchId: number;
  selectedSpId: number;
  selectedQueueId: number;
  selectedQueueName: string;
  searchText: string;
  visits: Visit[] = [];
  sortByVisitIdAsc = true;
  sortByCustomerAsc = true;
  sortByServiceAsc = true;
  sortByAppTimeAsc = true;
  sortingIndicator: string = SortBy.VISITID;
  selectedVisitId: number;
  visitClicked: boolean = false;
  userDirection: string;
  visitOptionStatus : string;
  infoVisitId:number;
  

  @Output() onFlowNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() NextFlow: EventEmitter<any> = new EventEmitter<any>();
  @Output() PreviousFlow: EventEmitter<any> = new EventEmitter<any>();
  @Input() isCollapesed: string;

  //utt parameters
  canTransferSP: boolean = false;
  canTransferQ: boolean = false;
  canTransferStaff: boolean = false;
  canTransferQFirst: boolean = false;
  canTransferQLast: boolean = false;
  canTransferQWait: boolean = false;
  canDelete: boolean = false;
  isQuickServeEnable:boolean;
  canCherryPick: boolean = false;
  private timeoutHandle = null;

  dsOrOutcomeExists: boolean = false;
  visitSearchText: string;
  desktopQRCodeListnerTimer: any;
  timeConvention$: Observable<string> = new Observable<string>();
  timeConvention: string = "24";
  queueSummary:any
  visitLoaded:boolean;
  visitLoading:boolean;
  queueVisitIdLoaded:boolean;

  constructor(
    private userSelectors: UserSelectors,
    private branchSelectors: BranchSelectors,
    private queueSelectors: QueueSelectors,
    private queueVisitsDispatchers: QueueVisitsDispatchers,
    private queueVisitsSelectors: QueueVisitsSelectors,
    private servicePointSelectors: ServicePointSelectors,
    private qmModalService: QmModalService,
    private spService: SPService,
    private translateService: TranslateService,
    private router: Router,
    private toastService: ToastService,
    private visitDispatchers: QueueDispatchers,
    private nativeApi: NativeApiService,
    private queueDispatcher: QueueDispatchers,
    private systemInfoSelectors: SystemInfoSelectors,
    
    
  ) {

    // 24 hour time converstion
    this.timeConvention$ = this.systemInfoSelectors.timeConvention$;
    const timeConventionSub = this.timeConvention$.subscribe(tc => {
      this.timeConvention = tc;
    });
    this.subscriptions.add(timeConventionSub);

    this.visitOptionStatus = 'none';

    this.userDirection$ = this.userSelectors.userDirection$;
    

    const userDirectionSubscription = this.userSelectors.userDirection$.subscribe(value=>{
      this.userDirection = value; 
    })
    this.subscriptions.add(userDirectionSubscription);
    

    const branchSub = this.branchSelectors.selectedBranch$.subscribe(branch => {
      this.selectedbranchId = branch.id;
    });
    this.subscriptions.add(branchSub);
    const servicePointSub = this.servicePointSelectors.openServicePoint$.subscribe(servicePoint => {
      this.selectedSpId = servicePoint.id;
    });
    this.subscriptions.add(servicePointSub);

    // queue list to find the name of the queue
    const queueSubscription = this.queueSelectors.queueSummary$.subscribe((qs) => {
      this.queueSummary = qs;
    });
    this.subscriptions.add(queueSubscription);

    const queueVisitIdSubscription = this.queueSelectors.queueVisitIDloaded$.subscribe((qidLoaded) => {
      this.queueVisitIdLoaded = qidLoaded;
    });
    this.subscriptions.add(queueVisitIdSubscription);


    //get visits for selected queue 
    const selectedQueueSub = this.queueSelectors.selectedQueue$.subscribe(queue => {
      if (queue) {
        this.selectedQueueId = queue.id;
        this.selectedQueueName = queue.name;
        if (this.selectedbranchId && this.selectedQueueId) {
          this.queueVisitsDispatchers.fetchQueueVisits(this.selectedbranchId, this.selectedQueueId);
        }
      } else {
        this.selectedQueueId = null;
      }
    });
    this.subscriptions.add(selectedQueueSub);

    const VisitLoadedSubs = this.queueVisitsSelectors.queueVisitLoaded$.subscribe(state=>{
      this.visitLoaded = state;
    })
    this.subscriptions.add(VisitLoadedSubs);

    const VisitLoadingSubs = this.queueVisitsSelectors.queueVisitLoading$.subscribe(state=>{
      this.visitLoading = state;
    })
    this.subscriptions.add(VisitLoadingSubs);

    // get visit list
    const queueVisitsSub = this.queueVisitsSelectors.queueVisits$.subscribe(visitList => {
      this.visits = visitList;
      this.visitClicked = false;
      this.selectedVisitId = -1;
      //if only one visit in queue open visit options
      if (this.visits.length === 1) {
        this.visitClicked = true;
        this.visitOptionStatus = 'initial';
        this.selectedVisitId = this.visits[0].visitId;
        this.dsOrOutcomeExists = this.visits[0].currentVisitService.deliveredServiceExists || this.visits[0].currentVisitService.outcomeExists;
      }
    });
    this.subscriptions.add(queueVisitsSub);
    

    //check utt settings for enabling trasnfer options 
    const uttSubscription = this.servicePointSelectors.uttParameters$
      .subscribe(uttParameters => {
        if (uttParameters) {
          this.canTransferSP = uttParameters.trServPool;
          this.canTransferQ = uttParameters.btnQueueTransfer;
          this.canTransferStaff = uttParameters.trUserPool;
          this.canTransferQFirst = uttParameters.btnTransferFirst;
          this.canTransferQLast = uttParameters.btnTransferLast;
          this.canTransferQWait = uttParameters.btnTransferSort;
          this.canDelete = uttParameters.delVisit;
          this.canCherryPick = uttParameters.cherryPick;
          this.isQuickServeEnable = uttParameters.quickServe;

          if (this.canTransferQ == true && (this.canTransferQFirst == true || this.canTransferQLast == true || this.canTransferQWait == true)) {
            this.canTransferQ = true;
          }
          if (this.canTransferQ == true && this.canTransferQFirst == false && this.canTransferQLast == false && this.canTransferQWait == false) {
            this.canTransferQ = false;
          }

        }
      })
      .unsubscribe();
    this.subscriptions.add(uttSubscription);


    const visitSub = this.queueSelectors.selectedVisit$.subscribe(result => {
      //check id defined to detect the search query request
      if (result && !result.id) {
        this.resetQRReader();
        this.spService.getSelectedVisitByVisitId(this.selectedbranchId, result.visitId).subscribe(visit => {
          this.visits.splice(0, this.visits.length, visit);
          this.visitOptionStatus = 'initial';
          this.visitClicked = true;
          this.selectedVisitId = this.visits[0].visitId;
          this.dsOrOutcomeExists = this.visits[0].currentVisitService.deliveredServiceExists || this.visits[0].currentVisitService.outcomeExists;
     
          // to apply name of the queue of selected visit  
          var selectedQ = this.queueSummary.queues.find(obj => {
            return obj.id === this.visits[0].queueId
          });     
          this.queueDispatcher.setectQueueName(selectedQ.name);
          
        }, error => {
          this.translateService.get('request_fail').subscribe(v => {
            this.toastService.infoToast(v);
          });
        })
      }
    }, error => {

    });
    this.subscriptions.add(visitSub);

    const visiInfoFail = this.queueSelectors.isVisitInfoFail$.subscribe((val) => {
      if (!this.nativeApi.isNativeBrowser() && val && this.searchText.length > 0) {
        this.resetQRReader();
        this.queueDispatcher.resetError();
      }
    })
    this.subscriptions.add(visiInfoFail)

  }

  ngOnInit() {
    this.StartAutoCollapse();
  }

  resetQRReader() {
    this.searchText = "";
  }

  sortByVisitId() {
    this.sortingIndicator = SortBy.VISITID;
    this.sortByVisitIdAsc = !this.sortByVisitIdAsc;
    if (this.visits && this.visits.length) {
      // sort by visitId
      this.visits = this.visits.sort((a, b) => {
        var nameA = a.ticketId.toUpperCase(); // ignore upper and lowercase
        var nameB = b.ticketId.toUpperCase(); // ignore upper and lowercase
        if ((nameA < nameB && this.sortByVisitIdAsc) || (nameA > nameB && !this.sortByVisitIdAsc)) {
          return -1;
        }
        if ((nameA > nameB && this.sortByVisitIdAsc) || (nameA < nameB && !this.sortByVisitIdAsc)) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    }
  }

  sortByCustomer() {
    this.sortingIndicator = SortBy.CUSTOMER;
    this.sortByCustomerAsc = !this.sortByCustomerAsc;
    if (this.visits && this.visits.length) {
      // sort by customer
      this.visits = this.visits.sort((a, b) => {
        var nameA = a.customerName.toUpperCase(); // ignore upper and lowercase
        var nameB = b.customerName.toUpperCase(); // ignore upper and lowercase
        if ((nameA < nameB && this.sortByCustomerAsc) || (nameA > nameB && !this.sortByCustomerAsc)) {
          return -1;
        }
        if ((nameA > nameB && this.sortByCustomerAsc) || (nameA < nameB && !this.sortByCustomerAsc)) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    }
  }

  sortByService() {
    this.sortingIndicator = SortBy.SERVICE;
    this.sortByServiceAsc = !this.sortByServiceAsc;
    if (this.visits && this.visits.length) {
      // sort by service
      this.visits = this.visits.sort((a, b) => {
        var nameA = a.serviceName.toUpperCase(); // ignore upper and lowercase
        var nameB = b.serviceName.toUpperCase(); // ignore upper and lowercase
        if ((nameA < nameB && this.sortByServiceAsc) || (nameA > nameB && !this.sortByServiceAsc)) {
          return -1;
        }
        if ((nameA > nameB && this.sortByServiceAsc) || (nameA < nameB && !this.sortByServiceAsc)) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    }
  }

  sortByAppTime() {
    this.sortingIndicator = SortBy.APPTIME;
    this.sortByAppTimeAsc = !this.sortByAppTimeAsc;
    if (this.visits && this.visits.length) {
      // sort by APpTime
      this.visits = this.visits.sort((a, b) => {
        var nameA = a.appointmentTime.toUpperCase(); // ignore upper and lowercase
        var nameB = b.appointmentTime.toUpperCase(); // ignore upper and lowercase
        if ((nameA < nameB && this.sortByAppTimeAsc) || (nameA > nameB && !this.sortByAppTimeAsc)) {
          return -1;
        }
        if ((nameA > nameB && this.sortByAppTimeAsc) || (nameA < nameB && !this.sortByAppTimeAsc)) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    }
  }



  selectVisit(index: number, visitId: number) {
    this.selectedVisitId === visitId && this.visits.length > 1 ? this.visitClicked = !this.visitClicked : this.visitClicked = true;
    this.selectedVisitId = visitId;
    this.dsOrOutcomeExists = this.visits[index].currentVisitService.deliveredServiceExists || this.visits[index].currentVisitService.outcomeExists;
    this.visitOptionStatus = 'initial';
    this.ResetAutoCollapse();

    setTimeout(function () {
          var objDiv = document.getElementById(visitId+'-visitOptionContainer');
          objDiv.scrollIntoView();
       
      }, 100); 

   
  }

  closeVisitOptions(){
    this.visitClicked = false;
    this.visitOptionStatus = 'none';
    this.ResetAutoCollapse();
  }
 
  transferToQ(visit) {
    // this.NextFlow.emit("tq");
    this.visitDispatchers.setectVisit(visit);
    this.visitOptionStatus = 'tq';
    this.ResetAutoCollapse();
 
  }

  transferToStaffPool(visit) {
    // this.NextFlow.emit("tsp");
    this.visitDispatchers.setectVisit(visit);
    this.visitOptionStatus = 'staff';
    this.ResetAutoCollapse();
  }

  transferToSPfPool(visit) {

    this.visitDispatchers.setectVisit(visit);
    this.visitOptionStatus = 'cp';
    this.ResetAutoCollapse();
  }

  cherryPickVisit(index: number, event: Event) {
    event.stopPropagation();


    let visitId = this.visits[index].ticketId;

    if (this.dsOrOutcomeExists && this.canCherryPick) {
      return;
    } else if (!this.dsOrOutcomeExists && this.canCherryPick) {
      this.qmModalService.openForTransKeys('', 'cherry_pick_visit_in_modal', 'yes', 'no', (result) => {
        if (result) {
          this.spService.cherryPickVisit(this.selectedbranchId, this.selectedSpId, this.selectedVisitId).subscribe(
            result => {
              this.translateService.get('visit_served').subscribe((label) => {
                // var successMessage = {
                //   firstLineName: label,
                //   firstLineText: visitId,
                //   icon: "correct",
                // }
                // this.infoMsgBoxDispatcher.updateInfoMsgBoxInfo(successMessage);
                // this.router.navigate(["/home"]);
                this.toastService.infoToast(label);
              });
            }, error => {
              const err = new DataServiceError(error, null);
              if (error.status == ERROR_STATUS.NOT_FOUND) {
                this.translateService.get('requested_visit_not_found').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              }
              else if (error.status == ERROR_STATUS.CONFLICT && err.errorCode == Q_ERROR_CODE.BLOCK_TRANSFER) {
                this.translateService.get('visit_already_called').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              } else if (err.errorCode === '0') {
                this.translateService.get('request_fail').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              } else {
                this.translateService.get('request_fail').subscribe(v => {
                  this.toastService.errorToast(v);
                });
              }
            }
          );
          this.resetQueueView();
        }
      },
        () => { }, { visitId: visitId })
    }
  }

  deleteVisit(index: number, event: Event) {
    event.stopPropagation();
    let visitId = this.visits[index].ticketId;
    this.qmModalService.openForTransKeys('', 'delete_visit_in_modal', 'yes', 'no', (result) => {
      if (result) { 
        this.spService.deleteVisit(this.selectedbranchId, this.selectedSpId, this.selectedVisitId).subscribe(
          result => {
            this.translateService.get('visit_deleted').subscribe((label) => {
              // var successMessage = {
              //   firstLineName: label,
              //   firstLineText: visitId,
              //   icon: "correct",
              // }
              this.toastService.infoToast(label);
            });
          }, error => {
            // console.log(error);
            const err = new DataServiceError(error, null);
            if (error.status == ERROR_STATUS.NOT_FOUND) {
              this.translateService.get('requested_visit_not_found').subscribe(v => {
                this.toastService.errorToast(v);
              });
            }
            else if (error.status == ERROR_STATUS.CONFLICT && err.errorCode == Q_ERROR_CODE.BLOCK_TRANSFER) {
              this.translateService.get('visit_already_called').subscribe(v => {
                this.toastService.errorToast(v);
              });
            } else if (err.errorCode === '0') {
              this.translateService.get('request_fail').subscribe(v => {
                this.router.navigate(["/home"]);
                this.toastService.errorToast(v);
              });
            }
            else {
              this.translateService.get('request_fail').subscribe(v => {
                this.toastService.errorToast(v);
              });
            }
          }
        );
        this.resetQueueView();
        
      }
    },
      () => { }, { visitId: visitId })
  }


  goBackToQueueSection() {
    this.PreviousFlow.emit();
    this.visitDispatchers.resetSelectedQueue();
  

  }

  handleTimeoutError(err: DataServiceError<any>, msg: string,routeToHome) {
    if (err.errorCode === '0') {
      this.translateService.get(msg).subscribe(v => {
        this.toastService.errorToast(msg);
      });
    }
  }

  ngOnDestroy(): void {
    this.StopAutoCollapse()
    this.subscriptions.unsubscribe();
  }

  getAppointmentTime(visit){
    
    
    let timeformat = "hh:mm A";
    if (this.timeConvention === "24") {
      timeformat = "HH:mm";
    }
    if(visit.appointmentTime==='-'){
      return '-';
    }else{
      return moment(visit.appointmentTime,'HH:mm').format(timeformat);
    }    
  }

  resetQueueView(){
    this.queueDispatcher.resetSelectedQueue();
    this.queueDispatcher.resetFetchVisitError();
    this.queueDispatcher.resetQueueInfo();
    this.queueDispatcher.setectVisit(null);
    this.queueDispatcher.resetVisitIDLoaded();
  }

  backToQueueOptionsButton(){
    this.visitOptionStatus = 'initial';
  }


  // AutoColoapse fuctions

  StartAutoCollapse(){
    this.timeoutHandle = setTimeout(()=>{
      if(this.visitOptionStatus==='none'||((this.visits.length === 1)&& this.visitOptionStatus==='initial')){
        this.resetQueueView();
      } else if(this.visitOptionStatus==='initial'){
        this.visitOptionStatus='none';
        this.ResetAutoCollapse();
      }else{
        this.visitOptionStatus = 'initial';
        this.ResetAutoCollapse();
      }
      }, 120000);
  }

  StopAutoCollapse(){
    clearTimeout(this.timeoutHandle);
  }

  selectedInfoButton(id){
    if(this.infoVisitId==id){
      this.infoVisitId = null;
    }else{
      this.infoVisitId = id;
      setTimeout(function () {
        var objDiv = document.getElementById(id+'-expanded-visit-info');
        objDiv.scrollIntoView();
     
    }, 100); 
    }    
  }

  ResetAutoCollapse(){
    this.StopAutoCollapse();
    this.StartAutoCollapse();
  }


}

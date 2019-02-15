export enum PUBLIC_EVENTS {
    VISIT_CALL = "VISIT_CALL",
    USER_SERVICE_POINT_SESSION_END = "USER_SERVICE_POINT_SESSION_END",
    USER_SESSION_END = "USER_SESSION_END",
    PRINTER_ISSUE = "PRINTER_ISSUE",
    CREATE_APPOINTMENT = "CREATE_APPOINTMENT",
    UPDATE_APPOINTMENT = "UPDATE_APPOINTMENT",
    DELETE_APPOINTMENT = "DELETE_APPOINTMENT",
    VISIT_CREATE = "VISIT_CREATE",
    RESET = "RESET",
    VISIT_RECYCLE = "VISIT_RECYCLE",
    VISIT_NEXT = "VISIT_NEXT",
    VISIT_REMOVE = "VISIT_REMOVE",
    VISIT_TRANSFER_TO_QUEUE = "VISIT_TRANSFER_TO_QUEUE",
    VISIT_TRANSFER_TO_SERVICE_POINT_POOL = "VISIT_TRANSFER_TO_SERVICE_POINT_POOL",
    VISIT_TRANSFER_TO_USER_POOL = "VISIT_TRANSFER_TO_USER_POOL",
    VISIT_END_TRANSACTION = "VISIT_END_TRANSACTION",
    QUEUE_VISITS_UPDATED = "QUEUE_VISITS_UPDATED"
}

import { Injectable } from '@angular/core';
import { NativeApiService } from '../../services/native-api.service'
import { LOGOUT_URL } from '../../url-helper';
import { Visit } from '../../../models/IVisit';
import { QueueDispatchers, ServicePointSelectors } from '../../../store';
import { servicePoint } from '../../../store/services/data.service';
import { IServicePoint } from '../../../models/IServicePoint';
import { Queue } from '../../../models/IQueue';
import { PRINTER_ISSUE } from '../../q-error';
import { TranslateService } from "@ngx-translate/core";
import { ToastService } from 'src/util/services/toast.service';

@Injectable()
export class QEventsHelper {
    currentServicePoint:IServicePoint
    previousServicePoint:IServicePoint
  constructor(
    private nativeApi: NativeApiService,
    private queueDispatchers: QueueDispatchers,
    private ServicePointSelectors:ServicePointSelectors,
    private translateService: TranslateService,
    private toastService: ToastService
  ) {
  }

  getChannelStr(str){
    return str.replace(new RegExp(':', 'g'), '/');
  }

  checkServerStatus(msg){
  }

  receiveEvent(msg){
    var processedEvent;
      try {
        processedEvent = JSON.parse(msg.data);
      } catch (err) {
          return;
      }

      if (typeof processedEvent.E === "undefined"
        || typeof processedEvent.E.evnt === "undefined") {
        return;
      }
      
      this.ServicePointSelectors.previousServicePoint$.subscribe((val)=>{
          this.previousServicePoint = val;
      });
      this.ServicePointSelectors.openServicePoint$.subscribe((val)=>{
        this.currentServicePoint = val;
      })
      
      switch (processedEvent.E.evnt) {
        case PUBLIC_EVENTS.USER_SERVICE_POINT_SESSION_END:   
        case PUBLIC_EVENTS.USER_SESSION_END:
        case PUBLIC_EVENTS.RESET:
           
            if(this.nativeApi.isNativeBrowser()){
                this.nativeApi.logOut();
            }
            else{
                window.location.href =  LOGOUT_URL;
            }
            break;  
        case PUBLIC_EVENTS.PRINTER_ISSUE:
            var errorCode = processedEvent.E.prm.error_code;
            var errorMsg = processedEvent.E.prm.error_msg;
            this.notifyPrinterIssue(errorMsg);
            break;
        case PUBLIC_EVENTS.CREATE_APPOINTMENT:
        case PUBLIC_EVENTS.UPDATE_APPOINTMENT:
        case PUBLIC_EVENTS.DELETE_APPOINTMENT:
            //appointment.updateAppointmentList(processedEvent);
            break;
        case PUBLIC_EVENTS.VISIT_CREATE:
            //appointment.updateAppointmentList(processedEvent);
            break;  
        case PUBLIC_EVENTS.QUEUE_VISITS_UPDATED:
            this.buildVisitList(processedEvent.E.prm);
        default:
            break;
      }
  }

buildVisitList(eventData){
    var processString = eventData.queue.replace(/\[/g, "{").replace(/\]/g, "}");
    var queue = JSON.parse(processString) as Queue;
    this.queueDispatchers.updateQueueInfo(queue);
}

notifyPrinterIssue(errorMsg: string){
    var msg = "";
        switch (errorMsg) {
            case PRINTER_ISSUE.NO_CONNECTION:
                msg = "no_connection_with_printer";
                break;
            case PRINTER_ISSUE.PAPER_JAM:
                msg = "paper_jam";
                break;
            case PRINTER_ISSUE.PAPER_OUT:
                msg = "out_of_paper";
                break;
            default:
                break;
        }
        if(msg.length > 0){
            this.translateService.get(msg).subscribe(v => {
                this.toastService.infoToast(v);
              });
        }
}

}
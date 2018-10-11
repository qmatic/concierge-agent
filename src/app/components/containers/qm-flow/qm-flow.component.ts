import { QmModalService } from './../../presentational/qm-modal/qm-modal.service';
import { Util } from './../../../../util/util';
import { Router } from '@angular/router';
import { Component, OnInit, ContentChildren, AfterContentInit, Input } from '@angular/core';
import { QmFlowPanelComponent } from 'src/app/components/containers/qm-flow-panel/qm-flow-panel.component';
import { QueryList } from '@angular/core';
import { HostBinding } from '@angular/core';
import { Recycle } from '../../../../util/services/recycle.service';
import { QueueService } from '../../../../util/services/queue.service';
import { ReserveDispatchers, TimeslotDispatchers, AccountDispatchers } from '../../../../store';


@Component({
  selector: 'qm-flow',
  templateUrl: './qm-flow.component.html',
  styleUrls: ['./qm-flow.component.scss'],
  host: { 'class': 'qm-flow-component-root animated slideInUp faster' }
})
export class QmFlowComponent implements OnInit {
  activeHeader:number;

  constructor(
    private router: Router,
    private util: Util,
    private qmModalService: QmModalService,
    private recycleService: Recycle,
    private queueService: QueueService,
    private reserveDispatchers:ReserveDispatchers,
    private timeSlotDispatchers:TimeslotDispatchers,
    private AccountDispatchers:AccountDispatchers
  ) {

    this.activeHeader = 0;

   }

  @HostBinding('class.slideOutDown') exitFlow: boolean = false;

  @ContentChildren(QmFlowPanelComponent)
  flowPanels = new QueryList<QmFlowPanelComponent>();

  ngOnInit() {
    
  }

  panelHeaderClick(flowPanel: QmFlowPanelComponent) {
    let panelFound = false;

    if (flowPanel.isContentVisible && flowPanel.hasResult()) {
      let panelArray = this.flowPanels.toArray();
      let panelIndex = panelArray.indexOf(flowPanel);
      let nextPanel = panelArray[++panelIndex];
      this.onFlowNext(nextPanel);
      return;
    }

    this.flowPanels.forEach(fp => {
      if (fp.id == flowPanel.id) {
        fp.isActive = true;
        fp.isContentVisible = true;
          fp.isHeaderVisible = true;
        panelFound = true;
      }
      else {
        fp.isActive = false;
        //hide the next panels
        if (panelFound) {
          fp.isContentVisible = false;
          fp.isHeaderVisible = false;
        }
      }
    });
  }

  private hideAllPanels() {
    this.flowPanels.forEach(fp => {
      fp.isActive = false;
      fp.isContentVisible = false
      fp.isHeaderVisible = false;
    });
  }


  onFlowExit(result?: any) {
    this.AccountDispatchers.setMenuItemStatus(true);
   if (result) {
      this.exitFlow = true;
      this.recycleService.clearCache();
      this.queueService.setQueuePoll();
      setTimeout(() => {
        this.AccountDispatchers.setMenuItemStatus(false);
        if(this.router.url!="/profile"){
        this.router.navigate(['home']);
        }
      }, 1000);
    }
    else {
      this.qmModalService.openForTransKeys('', 'msg_cancel_task', 'yes', 'no', (result) => {
        if (result) {
          this.timeSlotDispatchers.deselectTimeslot();
          this.exitFlow = true;
          this.recycleService.clearCache();
          this.queueService.setQueuePoll();
          setTimeout(() => {
            this.AccountDispatchers.setMenuItemStatus(false);
            if(this.router.url!="/profile"){
            this.router.navigate(['home']);
            }
          }, 1000);
        }
      }, () => {

      });
    }
  }

  onFlowNext(panel: QmFlowPanelComponent) {
    this.activeHeader=this.activeHeader+1;
    let panelsCollection = this.flowPanels.toArray();
    let panelIndex = panelsCollection.indexOf(panel);
    
    this.flowPanels.forEach((fp, index) => {
      fp.isActive = false;
      fp.isContentVisible = false;

      if (!fp.headerVisibilityOverridden && index < panelIndex) {
        fp.isHeaderVisible = true;
      }
    });

    panel.isActive = true;
    panel.isContentVisible = true;
    panel.isHeaderVisible = true;
  }

  
headerItemClicked(n){
  if(n<this.activeHeader){
    this.activeHeader = n;
   
  }
  
 
}


}


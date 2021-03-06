import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QmCustomerSearchComponent } from './qm-customer-search.component';

describe('QmCustomerSearchComponent', () => {
  let component: QmCustomerSearchComponent;
  let fixture: ComponentFixture<QmCustomerSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QmCustomerSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QmCustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

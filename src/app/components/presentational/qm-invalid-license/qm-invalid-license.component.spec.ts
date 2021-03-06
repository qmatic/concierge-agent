import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QmInvalidLicenseComponent } from './qm-invalid-license.component';

describe('QmInvalidLicenseComponent', () => {
  let component: QmInvalidLicenseComponent;
  let fixture: ComponentFixture<QmInvalidLicenseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QmInvalidLicenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QmInvalidLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

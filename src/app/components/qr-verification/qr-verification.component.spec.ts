import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrVerificationComponent } from './qr-verification.component';

describe('QrVerificationComponent', () => {
  let component: QrVerificationComponent;
  let fixture: ComponentFixture<QrVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

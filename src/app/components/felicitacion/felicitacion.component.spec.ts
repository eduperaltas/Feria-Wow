import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FelicitacionComponent } from './felicitacion.component';

describe('FelicitacionComponent', () => {
  let component: FelicitacionComponent;
  let fixture: ComponentFixture<FelicitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FelicitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FelicitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

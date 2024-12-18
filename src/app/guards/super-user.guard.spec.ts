import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { superUserGuard } from './super-user.guard';

describe('superUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => superUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

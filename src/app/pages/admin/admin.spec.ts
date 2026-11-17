import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Admin } from './admin';

describe('Admin', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Admin);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

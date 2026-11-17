import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Watch } from './watch';

describe('Watch', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Watch],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Watch);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

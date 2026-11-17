import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TitleDetail } from './title-detail';

describe('TitleDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TitleDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

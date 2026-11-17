import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Carousel } from './carousel';

describe('Carousel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carousel],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Carousel);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

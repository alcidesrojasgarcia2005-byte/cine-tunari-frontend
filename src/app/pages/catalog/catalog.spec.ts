import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Catalog } from './catalog';

describe('Catalog', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalog],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Catalog);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

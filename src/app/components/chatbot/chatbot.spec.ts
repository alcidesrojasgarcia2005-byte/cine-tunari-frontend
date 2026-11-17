import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Chatbot } from './chatbot';

describe('Chatbot', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatbot],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Chatbot);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

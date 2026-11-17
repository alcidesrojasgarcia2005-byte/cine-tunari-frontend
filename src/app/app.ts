import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AccentTitle } from './components/accent-title/accent-title';
import { Chatbot } from './components/chatbot/chatbot';
import { Header } from './components/header/header';
import { Content } from './core/services/content';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Chatbot, AccentTitle],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly content = inject(Content);
}

import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';

import { Api } from '../../core/services/api';
import { Content } from '../../core/services/content';

interface Mensaje {
  id: number;
  rol: 'usuario' | 'bot' | 'error';
  texto: string;
}

const MAX_PROMPT = 4000;

// Asistente flotante: consume POST /api/chatbot (Ollama en el backend)
@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class Chatbot {
  private readonly api = inject(Api);
  readonly content = inject(Content);

  readonly abierto = signal(false);
  readonly mensajes = signal<Mensaje[]>([]);
  readonly texto = signal('');
  readonly escribiendo = signal(false);
  readonly maximo = MAX_PROMPT;

  readonly puedeEnviar = computed(
    () => !this.escribiendo() && this.texto().trim().length > 0 && this.texto().length <= MAX_PROMPT
  );

  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');
  private readonly entrada = viewChild<ElementRef<HTMLTextAreaElement>>('entrada');
  private siguienteId = 1;

  constructor() {
    // Baja automáticamente al último mensaje
    effect(() => {
      this.mensajes();
      this.escribiendo();
      const el = this.lista()?.nativeElement;
      if (el) {
        queueMicrotask(() => (el.scrollTop = el.scrollHeight));
      }
    });
  }

  alternar(): void {
    this.abierto.update((v) => !v);
    if (this.abierto()) {
      setTimeout(() => this.entrada()?.nativeElement.focus());
    }
  }

  onTecla(evento: KeyboardEvent): void {
    // Enter envía; Shift+Enter hace salto de línea
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      this.enviar();
    }
  }

  async enviar(): Promise<void> {
    if (!this.puedeEnviar()) {
      return;
    }
    const prompt = this.texto().trim();
    this.agregar('usuario', prompt);
    this.texto.set('');
    this.escribiendo.set(true);
    try {
      const { response } = await this.api.chatbot(prompt);
      this.agregar('bot', response);
    } catch (e) {
      this.agregar('error', (e as Error).message || 'El asistente no respondió. Intenta de nuevo.');
    } finally {
      this.escribiendo.set(false);
    }
  }

  private agregar(rol: Mensaje['rol'], texto: string): void {
    this.mensajes.update((lista) => [...lista, { id: this.siguienteId++, rol, texto }]);
  }
}

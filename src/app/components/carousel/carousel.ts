import { AfterViewInit, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AccentTitle } from '../accent-title/accent-title';

// Fila horizontal con desplazamiento suave y flechas que aparecen al pasar el mouse.
@Component({
  selector: 'app-carousel',
  imports: [RouterLink, AccentTitle],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
  host: { '(window:resize)': 'medir()' }
})
export class Carousel implements AfterViewInit {
  readonly titulo = input('');
  readonly subtitulo = input('');
  readonly verTodo = input<Record<string, string> | null>(null); // queryParams de "Ver todo"
  readonly verTodoTexto = input('Ver todo');
  readonly vacio = input(false); // muestra el estado vacío a lo ancho

  readonly puedeIzq = signal(false);
  readonly puedeDer = signal(false);

  private readonly pista = viewChild.required<ElementRef<HTMLElement>>('pista');

  ngAfterViewInit(): void {
    // Espera a que el contenido proyectado se pinte
    requestAnimationFrame(() => this.medir());
  }

  medir(): void {
    const el = this.pista().nativeElement;
    this.puedeIzq.set(el.scrollLeft > 4);
    this.puedeDer.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  mover(direccion: 1 | -1): void {
    const el = this.pista().nativeElement;
    el.scrollBy({ left: direccion * el.clientWidth * 0.85, behavior: 'smooth' });
  }
}

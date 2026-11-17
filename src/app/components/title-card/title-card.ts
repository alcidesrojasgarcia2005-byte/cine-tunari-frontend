import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { iniciales } from '../../core/services/content';

// Tarjeta vertical 2:3 de un título. Si no hay portada (o falla), muestra las iniciales.
@Component({
  selector: 'app-title-card',
  imports: [RouterLink],
  templateUrl: './title-card.html',
  styleUrl: './title-card.scss'
})
export class TitleCard {
  readonly enlace = input.required<unknown[]>();
  readonly query = input<Record<string, unknown> | null>(null);
  readonly nombre = input.required<string>();
  readonly portada = input('');
  readonly anio = input<number | null>(null);
  readonly detalle = input(''); // texto extra: "T1 · E2", categoría...
  readonly progreso = input<number | null>(null); // 0..1 para "continuar viendo"

  readonly imagenRota = signal(false);
  readonly marca = computed(() => iniciales(this.nombre()));
  readonly mostrarImagen = computed(() => !!this.portada() && !this.imagenRota());
}

import { Component, computed, input } from '@angular/core';

import { partirTitulo } from '../../core/services/content';

// Muestra un texto con la última palabra en cursiva y color de acento: "Continuar <em>viendo</em>"
@Component({
  selector: 'app-accent-title',
  template: `@if (partes().inicio) {{{ partes().inicio }} }<em>{{ partes().fin }}</em>`,
  styles: ':host { display: contents; }'
})
export class AccentTitle {
  readonly texto = input('');
  readonly partes = computed(() => partirTitulo(this.texto()));
}

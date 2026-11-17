import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { Favorito } from '../models/models';
import { Api } from './api';
import { Session } from './session';

/**
 * Estado compartido de "Mi lista": lo usan la portada, la ficha del título y el catálogo.
 * Las peticiones siguen pasando por Api (único servicio HTTP).
 */
@Injectable({ providedIn: 'root' })
export class Favorites {
  private readonly api = inject(Api);
  private readonly session = inject(Session);

  readonly lista = signal<Favorito[]>([]);
  readonly ids = computed(() => new Set(this.lista().map((f) => f.titulo_id)));

  constructor() {
    // Se recarga al iniciar o cerrar sesión
    effect(() => {
      const usuario = this.session.usuario();
      untracked(() => (usuario ? this.cargar() : this.lista.set([])));
    });
  }

  es(tituloId: number): boolean {
    return this.ids().has(tituloId);
  }

  async cargar(): Promise<void> {
    try {
      this.lista.set(await this.api.favoritos());
    } catch {
      this.lista.set([]);
    }
  }

  /** Agrega o quita un título. Devuelve false si no hay sesión. */
  async alternar(tituloId: number): Promise<boolean> {
    if (!this.session.usuario()) {
      return false;
    }
    if (this.es(tituloId)) {
      this.lista.update((l) => l.filter((f) => f.titulo_id !== tituloId));
      await this.api.quitarFavorito(tituloId).catch(() => undefined);
    } else {
      await this.api.agregarFavorito(tituloId).catch(() => undefined);
    }
    await this.cargar();
    return true;
  }
}

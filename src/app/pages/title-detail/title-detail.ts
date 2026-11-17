import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AccentTitle } from '../../components/accent-title/accent-title';
import { Episodio, Historial, Titulo } from '../../core/models/models';
import { Api } from '../../core/services/api';
import { AuthService } from '../../core/services/auth.service';
import { Content, iniciales } from '../../core/services/content';
import { Favorites } from '../../core/services/favorites';

interface Temporada {
  numero: number;
  episodios: Episodio[];
}

// Ficha de un título: banner, ficha técnica, sinopsis y episodios
@Component({
  selector: 'app-title-detail',
  imports: [RouterLink, AccentTitle],
  templateUrl: './title-detail.html',
  styleUrl: './title-detail.scss'
})
export class TitleDetail {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly content = inject(Content);
  readonly favoritos = inject(Favorites);

  readonly item = signal<Titulo | null>(null);
  readonly progreso = signal<Historial | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly imagenRota = signal(false);

  private readonly id = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  readonly banner = computed(() => {
    const it = this.item();
    return it ? this.api.archivo(it.banner || it.portada, 'portadas') : '';
  });
  readonly bannerCss = computed(() => (this.banner() ? `url("${this.banner()}")` : null));
  readonly portada = computed(() => this.api.archivo(this.item()?.portada, 'portadas'));
  readonly marca = computed(() => iniciales(this.item()?.titulo ?? ''));

  readonly temporadas = computed<Temporada[]>(() => {
    const mapa = new Map<number, Episodio[]>();
    for (const ep of this.item()?.episodios ?? []) {
      mapa.set(ep.temporada, [...(mapa.get(ep.temporada) ?? []), ep]);
    }
    return [...mapa].map(([numero, episodios]) => ({ numero, episodios }));
  });

  // "Ver ahora" continúa el episodio donde se quedó el usuario
  readonly verQuery = computed(() => {
    const p = this.progreso();
    return p?.episodio_id ? { ep: p.episodio_id } : null;
  });

  constructor() {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const id = Number(this.id().get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('Contenido no encontrado.');
      this.loading.set(false);
      return;
    }
    try {
      this.item.set(await this.api.titulo(id));
      await this.auth.ready;
      if (this.auth.user()) {
        this.progreso.set(await this.api.progreso(id).catch(() => null));
      }
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  async miLista(): Promise<void> {
    const it = this.item();
    if (it && !(await this.favoritos.alternar(it.id))) {
      await this.router.navigateByUrl('/login');
    }
  }

  duracion(min: number | null): string {
    if (!min) {
      return '';
    }
    const h = Math.floor(min / 60);
    if (!h) {
      return `${min} min`;
    }
    return min % 60 ? `${h} h ${min % 60} min` : `${h} h`;
  }
}

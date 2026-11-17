import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { AccentTitle } from '../../components/accent-title/accent-title';
import { Carousel } from '../../components/carousel/carousel';
import { TitleCard } from '../../components/title-card/title-card';
import { Historial, Titulo } from '../../core/models/models';
import { Api } from '../../core/services/api';
import { AuthService } from '../../core/services/auth.service';
import { Content } from '../../core/services/content';
import { Favorites } from '../../core/services/favorites';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, TitleCard, Carousel, AccentTitle],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss'
})
export class Catalog {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  readonly content = inject(Content);
  readonly favoritos = inject(Favorites);

  readonly items = signal<Titulo[]>([]);
  readonly continuar = signal<Historial[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly esqueletos = Array.from({ length: 7 }, (_, i) => i);

  // Filtros: viven en la URL (?buscar=&categoria=&genero=) y se resuelven en el backend
  private readonly params = toSignal(this.route.queryParamMap.pipe(map((p) => p)), {
    initialValue: this.route.snapshot.queryParamMap
  });
  readonly buscar = computed(() => (this.params().get('buscar') ?? '').trim());
  readonly categoria = computed(() => this.params().get('categoria') ?? '');
  readonly genero = computed(() => this.params().get('genero') ?? '');
  readonly filtrando = computed(() => !!(this.buscar() || this.categoria() || this.genero()));

  readonly resultados = signal<Titulo[]>([]);
  readonly buscando = signal(false);

  readonly hero = computed(() => this.items().find((t) => t.destacado) ?? null);

  // Una fila por categoría (aunque esté vacía), con textos de la tabla secciones
  readonly filas = computed(() =>
    this.content.categorias().map((categoria) => ({
      categoria,
      seccion: this.content.seccion(categoria.slug),
      items: this.items().filter((t) => t.categoria_slug === categoria.slug)
    }))
  );

  readonly tituloResultados = computed(() => {
    if (this.buscar()) {
      return this.content.seccion('buscar').titulo;
    }
    const s = this.content.seccion(this.categoria());
    return s.titulo || this.genero() || this.content.seccion('todos').titulo;
  });

  private consulta = 0;

  constructor() {
    this.load();
    effect(() => {
      const filtros = { buscar: this.buscar(), categoria: this.categoria(), genero: this.genero() };
      untracked(() => this.filtrar(filtros));
    });
  }

  private async load(): Promise<void> {
    try {
      this.items.set(await this.api.titulos());
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }

    await this.auth.ready;
    if (this.auth.user()) {
      this.api.historial().then((h) => this.continuar.set(h), () => undefined);
    }
  }

  private async filtrar(f: { buscar: string; categoria: string; genero: string }): Promise<void> {
    if (!f.buscar && !f.categoria && !f.genero) {
      this.resultados.set([]);
      return;
    }
    const id = ++this.consulta; // una respuesta vieja no pisa a una nueva
    this.buscando.set(true);
    try {
      const datos = await this.api.titulos({
        buscar: f.buscar || undefined,
        categoria: f.categoria || undefined,
        genero: f.genero || undefined
      });
      if (id === this.consulta) {
        this.resultados.set(datos);
      }
    } catch (e) {
      if (id === this.consulta) {
        this.error.set((e as Error).message);
      }
    } finally {
      if (id === this.consulta) {
        this.buscando.set(false);
      }
    }
  }

  filtro(clave: 'categoria' | 'genero', valor: string): void {
    const actual = clave === 'categoria' ? this.categoria() : this.genero();
    this.router.navigate([], {
      queryParams: { [clave]: valor && valor !== actual ? valor : null },
      queryParamsHandling: 'merge'
    });
  }

  async miLista(t: Titulo): Promise<void> {
    if (!(await this.favoritos.alternar(t.id))) {
      await this.router.navigateByUrl('/login');
    }
  }

  portada(ruta: string): string {
    return this.api.archivo(ruta, 'portadas');
  }

  fondoHero(t: Titulo): string | null {
    const url = this.api.archivo(t.banner || t.portada, 'portadas');
    return url ? `url("${url}")` : null;
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

  progreso(h: Historial): number | null {
    return h.duracion_min ? Math.min(1, h.segundo / (h.duracion_min * 60)) : null;
  }

  detalleHistorial(h: Historial): string {
    return h.numero ? `T${h.temporada} · E${h.numero}` : h.categoria;
  }
}

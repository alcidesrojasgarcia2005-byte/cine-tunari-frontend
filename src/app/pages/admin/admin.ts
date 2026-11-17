import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AccentTitle } from '../../components/accent-title/accent-title';
import { Titulo, TituloInput } from '../../core/models/models';
import { Api } from '../../core/services/api';
import { Content, iniciales } from '../../core/services/content';
import { EpisodesEditor } from './episodes-editor/episodes-editor';
import { TitleForm } from './title-form/title-form';

// Panel de administración del catálogo (ruta /admin, requiere sesión)
@Component({
  selector: 'app-admin',
  imports: [RouterLink, AccentTitle, TitleForm, EpisodesEditor],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  private readonly api = inject(Api);
  readonly content = inject(Content);

  readonly titulos = signal<Titulo[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly aviso = signal('');

  readonly filtroCategoria = signal('');
  readonly filtroTexto = signal('');

  // null = nada abierto · 'nuevo' = formulario vacío · número = editando ese título
  readonly seleccion = signal<number | 'nuevo' | null>(null);
  readonly editandoId = computed(() => {
    const s = this.seleccion();
    return typeof s === 'number' ? s : null;
  });
  readonly seleccionado = computed(() => this.titulos().find((t) => t.id === this.editandoId()) ?? null);
  readonly conEpisodios = computed(() => ['series', 'novelas'].includes(this.seleccionado()?.categoria_slug ?? ''));

  readonly visibles = computed(() => {
    const cat = this.filtroCategoria();
    const texto = this.filtroTexto().trim().toLowerCase();
    return this.titulos().filter(
      (t) => (!cat || t.categoria_slug === cat) && (!texto || t.titulo.toLowerCase().includes(texto))
    );
  });

  readonly pendientes = computed(() => this.titulos().filter((t) => !this.tieneVideo(t)).length);
  readonly esqueletos = Array.from({ length: 6 }, (_, i) => i);

  constructor() {
    this.cargar();
  }

  async cargar(): Promise<void> {
    try {
      this.titulos.set(await this.api.titulos());
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  abrir(sel: number | 'nuevo'): void {
    this.aviso.set('');
    this.seleccion.set(sel);
    if (window.matchMedia('(max-width: 1100px)').matches) {
      setTimeout(() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' }));
    }
  }

  cerrar(): void {
    this.seleccion.set(null);
  }

  async onGuardado(t: Titulo): Promise<void> {
    await this.cargar();
    this.seleccion.set(t.id); // tras crear, queda abierto para cargar episodios
    this.mostrarAviso(`“${t.titulo}” guardado correctamente.`);
  }

  async eliminar(t: Titulo): Promise<void> {
    if (!confirm(`¿Eliminar “${t.titulo}”? También se borrarán sus episodios, favoritos e historial.`)) {
      return;
    }
    try {
      await this.api.eliminarTitulo(t.id);
      if (this.editandoId() === t.id) {
        this.cerrar();
      }
      await this.cargar();
      this.mostrarAviso(`“${t.titulo}” eliminado.`);
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }

  // Marca o desmarca como destacado (PUT con los mismos datos; los géneros no cambian)
  async alternarDestacado(t: Titulo): Promise<void> {
    const datos: TituloInput = {
      titulo: t.titulo,
      sinopsis: t.sinopsis,
      anio: t.anio,
      duracion_min: t.duracion_min,
      pais: t.pais,
      director: t.director,
      clasificacion: t.clasificacion,
      portada: t.portada,
      banner: t.banner,
      trailer_url: t.trailer_url,
      video_url: t.video_url,
      categoria_id: t.categoria_id,
      destacado: !t.destacado
    };
    this.titulos.update((l) => l.map((x) => (x.id === t.id ? { ...x, destacado: !t.destacado } : x)));
    try {
      await this.api.actualizarTitulo(t.id, datos);
    } catch (e) {
      this.error.set((e as Error).message);
      await this.cargar();
    }
  }

  portada(t: Titulo): string {
    return this.api.archivo(t.portada, 'portadas');
  }

  marca(t: Titulo): string {
    return iniciales(t.titulo);
  }

  tieneVideo(t: Titulo): boolean {
    return ['series', 'novelas'].includes(t.categoria_slug) || !!t.video_url;
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso() === texto && this.aviso.set(''), 4000);
  }
}

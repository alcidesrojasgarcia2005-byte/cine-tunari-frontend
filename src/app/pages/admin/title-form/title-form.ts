import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { Titulo, TituloInput } from '../../../core/models/models';
import { Api } from '../../../core/services/api';
import { Content } from '../../../core/services/content';

export const CLASIFICACIONES = ['', 'ATP', '+7', '+13', '+16', '+18'];

// Crear o editar un título con todos sus campos (POST / PUT /api/titulos)
@Component({
  selector: 'app-title-form',
  imports: [ReactiveFormsModule],
  templateUrl: './title-form.html',
  styleUrl: './title-form.scss'
})
export class TitleForm {
  private readonly api = inject(Api);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly content = inject(Content);

  readonly tituloId = input<number | null>(null); // null = nuevo
  readonly guardado = output<Titulo>();
  readonly cancelar = output<void>();

  readonly clasificaciones = CLASIFICACIONES;
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly generos = signal<Set<number>>(new Set());

  readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    sinopsis: ['', [Validators.required, Validators.maxLength(5000)]],
    categoria_id: [0, [Validators.required, Validators.min(1)]],
    anio: ['' as string | number],
    duracion_min: ['' as string | number],
    pais: [''],
    director: [''],
    clasificacion: [''],
    portada: [''],
    banner: [''],
    trailer_url: [''],
    video_url: [''],
    destacado: [false]
  });

  // Vista previa en vivo de las rutas de imagen / video
  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly portadaUrl = computed(() => this.api.archivo(this.valores().portada, 'portadas'));
  readonly bannerUrl = computed(() => this.api.archivo(this.valores().banner, 'portadas'));
  readonly videoUrl = computed(() => this.api.archivo(this.valores().video_url, 'videos'));
  readonly conEpisodios = computed(() => {
    const cat = this.content.categorias().find((c) => c.id === Number(this.valores().categoria_id));
    return cat?.slug === 'series' || cat?.slug === 'novelas';
  });

  constructor() {
    effect(() => {
      const id = this.tituloId();
      untracked(() => this.cargar(id));
    });
  }

  private async cargar(id: number | null): Promise<void> {
    this.error.set('');
    this.form.reset();
    this.generos.set(new Set());
    if (id === null) {
      const primera = this.content.categorias()[0];
      this.form.patchValue({ categoria_id: primera?.id ?? 0 });
      return;
    }
    this.cargando.set(true);
    try {
      const t = await this.api.titulo(id);
      this.form.patchValue({
        titulo: t.titulo,
        sinopsis: t.sinopsis,
        categoria_id: t.categoria_id,
        anio: t.anio ?? '',
        duracion_min: t.duracion_min ?? '',
        pais: t.pais,
        director: t.director,
        clasificacion: t.clasificacion,
        portada: t.portada,
        banner: t.banner,
        trailer_url: t.trailer_url,
        video_url: t.video_url,
        destacado: t.destacado
      });
      this.generos.set(new Set((t.generos_lista ?? []).map((g) => g.id)));
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  alternarGenero(id: number): void {
    this.generos.update((s) => {
      const nuevo = new Set(s);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  }

  async guardar(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: TituloInput = {
      titulo: v.titulo.trim(),
      sinopsis: v.sinopsis.trim(),
      categoria_id: Number(v.categoria_id),
      anio: numero(v.anio),
      duracion_min: numero(v.duracion_min),
      pais: v.pais.trim(),
      director: v.director.trim(),
      clasificacion: v.clasificacion,
      portada: v.portada.trim(),
      banner: v.banner.trim(),
      trailer_url: v.trailer_url.trim(),
      video_url: v.video_url.trim(),
      destacado: v.destacado,
      genero_ids: [...this.generos()]
    };
    this.guardando.set(true);
    try {
      const id = this.tituloId();
      const t = id === null ? await this.api.crearTitulo(datos) : await this.api.actualizarTitulo(id, datos);
      this.guardado.emit(t);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.guardando.set(false);
    }
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }
}

function numero(valor: string | number): number | null {
  if (valor === '' || valor === null || valor === undefined) {
    return null;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

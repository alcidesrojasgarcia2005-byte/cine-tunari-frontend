import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Episodio, EpisodioInput } from '../../../core/models/models';
import { Api } from '../../../core/services/api';
import { Content } from '../../../core/services/content';

// Administra los episodios de una serie o novela (POST / PUT / DELETE /api/episodios)
@Component({
  selector: 'app-episodes-editor',
  imports: [ReactiveFormsModule],
  templateUrl: './episodes-editor.html',
  styleUrl: './episodes-editor.scss'
})
export class EpisodesEditor {
  private readonly api = inject(Api);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly content = inject(Content);

  readonly tituloId = input.required<number>();

  readonly episodios = signal<Episodio[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  // null = formulario cerrado · 'nuevo' · id del episodio en edición
  readonly editando = signal<number | 'nuevo' | null>(null);

  readonly form = this.fb.group({
    temporada: [1 as number | string, [Validators.required, Validators.min(1)]],
    numero: [1 as number | string, [Validators.required, Validators.min(1)]],
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
    sinopsis: [''],
    duracion_min: ['' as number | string],
    video_url: ['']
  });

  constructor() {
    effect(() => {
      const id = this.tituloId();
      untracked(() => this.cargar(id));
    });
  }

  private async cargar(id: number): Promise<void> {
    this.cargando.set(true);
    this.editando.set(null);
    try {
      const t = await this.api.titulo(id);
      this.episodios.set(t.episodios ?? []);
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  nuevo(): void {
    const lista = this.episodios();
    const temporada = lista.length ? Math.max(...lista.map((e) => e.temporada)) : 1;
    const enTemporada = lista.filter((e) => e.temporada === temporada);
    const numero = enTemporada.length ? Math.max(...enTemporada.map((e) => e.numero)) + 1 : 1;
    this.form.reset({ temporada, numero, nombre: '', sinopsis: '', duracion_min: '', video_url: '' });
    this.error.set('');
    this.editando.set('nuevo');
  }

  editar(ep: Episodio): void {
    this.form.reset({
      temporada: ep.temporada,
      numero: ep.numero,
      nombre: ep.nombre,
      sinopsis: ep.sinopsis,
      duracion_min: ep.duracion_min ?? '',
      video_url: ep.video_url
    });
    this.error.set('');
    this.editando.set(ep.id);
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: EpisodioInput = {
      titulo_id: this.tituloId(),
      temporada: Number(v.temporada),
      numero: Number(v.numero),
      nombre: v.nombre.trim(),
      sinopsis: v.sinopsis.trim(),
      duracion_min: v.duracion_min === '' ? null : Number(v.duracion_min),
      video_url: v.video_url.trim()
    };
    const editando = this.editando();
    this.guardando.set(true);
    this.error.set('');
    try {
      if (editando === 'nuevo') {
        await this.api.crearEpisodio(datos);
      } else if (typeof editando === 'number') {
        await this.api.actualizarEpisodio(editando, datos);
      }
      await this.cargar(this.tituloId());
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar(ep: Episodio): Promise<void> {
    if (!confirm(`¿Eliminar “${ep.nombre}”?`)) {
      return;
    }
    try {
      await this.api.eliminarEpisodio(ep.id);
      await this.cargar(this.tituloId());
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }
}

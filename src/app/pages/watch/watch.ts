import { Component, ElementRef, OnDestroy, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Episodio, Titulo } from '../../core/models/models';
import { Api } from '../../core/services/api';
import { Content } from '../../core/services/content';

// Reproductor a pantalla completa (fondo negro). Guarda y retoma el progreso.
@Component({
  selector: 'app-watch',
  imports: [RouterLink],
  templateUrl: './watch.html',
  styleUrl: './watch.scss'
})
export class Watch implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(Api);
  readonly content = inject(Content);
  private readonly player = viewChild<ElementRef<HTMLVideoElement>>('player');

  readonly item = signal<Titulo | null>(null);
  readonly episodio = signal<Episodio | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly videoError = signal(false);

  readonly episodios = computed(() => this.item()?.episodios ?? []);
  readonly siguiente = computed(() => {
    const lista = this.episodios();
    const i = lista.findIndex((e) => e.id === this.episodio()?.id);
    return i >= 0 && i < lista.length - 1 ? lista[i + 1] : null;
  });

  // Series y novelas reproducen el episodio; películas y documentales, el título
  readonly videoSrc = computed(() => {
    const it = this.item();
    if (!it) {
      return '';
    }
    const ruta = it.episodios ? (this.episodio()?.video_url ?? '') : it.video_url;
    return this.api.archivo(ruta, 'videos');
  });
  readonly poster = computed(() => this.api.archivo(this.item()?.banner || this.item()?.portada, 'portadas'));
  readonly posterCss = computed(() => (this.poster() ? `url("${this.poster()}")` : null));

  private startAt = 0;
  private lastSaved = 0;
  private ultimoTiempo = 0;

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('Contenido no encontrado.');
      this.loading.set(false);
      return;
    }
    try {
      const [found, progreso] = await Promise.all([this.api.titulo(id), this.api.progreso(id).catch(() => null)]);

      // Episodio inicial: el de la URL (?ep=), el último visto o el primero
      const eps = found.episodios ?? [];
      const epUrl = Number(this.route.snapshot.queryParamMap.get('ep'));
      const inicial =
        eps.find((e) => e.id === epUrl) ?? eps.find((e) => e.id === progreso?.episodio_id) ?? eps[0] ?? null;

      if (progreso && (progreso.episodio_id ?? null) === (inicial?.id ?? null)) {
        this.startAt = progreso.segundo;
      }
      this.episodio.set(inicial);
      this.item.set(found);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  elegirEpisodio(id: number | string): void {
    const ep = this.episodios().find((e) => e.id === Number(id));
    if (!ep) {
      return;
    }
    const video = this.player()?.nativeElement;
    if (video && video.currentTime > 0) {
      this.guardar(video.currentTime);
    }
    this.startAt = 0;
    this.lastSaved = 0;
    this.ultimoTiempo = 0;
    this.videoError.set(false);
    this.episodio.set(ep);
    this.router.navigate([], { queryParams: { ep: ep.id }, replaceUrl: true });
  }

  // Al cargar los metadatos, continúa desde donde se quedó el usuario
  onLoaded(video: HTMLVideoElement): void {
    if (this.startAt > 0 && this.startAt < video.duration - 5) {
      video.currentTime = this.startAt;
    }
  }

  // Guarda el progreso cada 5 segundos
  onTime(video: HTMLVideoElement): void {
    this.ultimoTiempo = video.currentTime;
    if (Math.abs(video.currentTime - this.lastSaved) >= 5) {
      this.lastSaved = video.currentTime;
      this.guardar(video.currentTime);
    }
  }

  // Guarda al pausar
  onPause(video: HTMLVideoElement): void {
    this.guardar(video.currentTime);
  }

  onVideoError(): void {
    this.videoError.set(true);
  }

  ngOnDestroy(): void {
    if (this.ultimoTiempo > 0) {
      this.guardar(this.ultimoTiempo);
    }
  }

  private guardar(segundo: number): void {
    const it = this.item();
    if (!it || !Number.isFinite(segundo)) {
      return;
    }
    this.api.guardarProgreso(it.id, this.episodio()?.id ?? null, segundo).catch(() => undefined);
  }
}

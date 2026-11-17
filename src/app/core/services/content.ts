import { Injectable, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Categoria, Genero, Seccion, Sitio } from '../models/models';
import { Api } from './api';

const VACIA: Seccion = { id: 0, clave: '', etiqueta: '', titulo: '', subtitulo: '' };

/**
 * Textos visibles del sitio, leídos de las tablas `sitio` y `secciones`
 * (a través de Api), más las categorías y géneros que usan el menú y los filtros.
 * Ningún título de sección se escribe en las plantillas.
 */
@Injectable({ providedIn: 'root' })
export class Content {
  private readonly api = inject(Api);
  private readonly title = inject(Title);

  readonly sitio = signal<Sitio | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly generos = signal<Genero[]>([]);
  private readonly secciones = signal<Seccion[]>([]);
  readonly cargado = signal(false);
  readonly error = signal('');

  private readonly porClave = computed(() => new Map(this.secciones().map((s) => [s.clave, s])));

  constructor() {
    this.cargar();
  }

  seccion(clave: string): Seccion {
    return this.porClave().get(clave) ?? VACIA;
  }

  private async cargar(): Promise<void> {
    try {
      const [sitio, secciones, categorias, generos] = await Promise.all([
        this.api.sitio(),
        this.api.secciones(),
        this.api.categorias(),
        this.api.generos()
      ]);
      this.sitio.set(sitio);
      this.secciones.set(secciones);
      this.categorias.set(categorias);
      this.generos.set(generos);
      this.title.setTitle(sitio.eslogan ? `${sitio.nombre} · ${sitio.eslogan}` : sitio.nombre);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargado.set(true);
    }
  }
}

/** Separa un texto en "inicio" y última palabra (que se muestra en cursiva dorada). */
export function partirTitulo(texto: string): { inicio: string; fin: string } {
  const palabras = (texto ?? '').trim().split(/\s+/).filter(Boolean);
  const fin = palabras.pop() ?? '';
  return { inicio: palabras.join(' '), fin };
}

/** Iniciales para el marcador cuando no hay portada: "Serie de ejemplo" -> "SE". */
export function iniciales(texto: string): string {
  const palabras = (texto ?? '').split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p));
  return palabras
    .slice(0, 2)
    .map((p) => p.replace(/[^\p{L}\p{N}]/gu, '').charAt(0))
    .join('')
    .toUpperCase();
}

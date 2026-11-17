import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Categoria,
  Episodio,
  EpisodioInput,
  Favorito,
  FiltrosTitulos,
  Genero,
  Historial,
  Seccion,
  Sesion,
  Sitio,
  Titulo,
  TituloInput,
  Usuario
} from '../models/models';
import { Session } from './session';

/**
 * Único punto de acceso HTTP del frontend (capa de presentación -> capa de lógica).
 * TODAS las llamadas a la API de Cine Tunari pasan por este servicio.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly session = inject(Session);
  private readonly base = environment.apiUrl;

  // ---------- Contenido del sitio ----------
  sitio(): Promise<Sitio> {
    return this.get<Sitio>('/sitio');
  }

  secciones(): Promise<Seccion[]> {
    return this.get<Seccion[]>('/secciones');
  }

  categorias(): Promise<Categoria[]> {
    return this.get<Categoria[]>('/categorias');
  }

  generos(): Promise<Genero[]> {
    return this.get<Genero[]>('/generos');
  }

  // ---------- Catálogo ----------
  titulos(filtros: FiltrosTitulos = {}): Promise<Titulo[]> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.get<Titulo[]>('/titulos', params);
  }

  titulo(id: number): Promise<Titulo> {
    return this.get<Titulo>(`/titulos/${id}`);
  }

  episodio(id: number): Promise<Episodio> {
    return this.get<Episodio>(`/episodios/${id}`);
  }

  // ---------- Usuarios ----------
  registrar(nombre: string, email: string, contrasena: string): Promise<Sesion> {
    return this.post<Sesion>('/usuarios', { nombre, email, contrasena });
  }

  login(email: string, contrasena: string): Promise<Sesion> {
    return this.post<Sesion>('/usuarios/login', { email, contrasena });
  }

  yo(): Promise<Usuario> {
    return this.get<Usuario>('/usuarios/yo');
  }

  // ---------- Favoritos ("Mi lista") ----------
  favoritos(): Promise<Favorito[]> {
    return this.get<Favorito[]>('/favoritos');
  }

  agregarFavorito(tituloId: number): Promise<unknown> {
    return this.post('/favoritos', { titulo_id: tituloId });
  }

  quitarFavorito(tituloId: number): Promise<unknown> {
    return this.borrar(`/favoritos/${tituloId}`);
  }

  // ---------- Historial ("Continuar viendo") ----------
  historial(): Promise<Historial[]> {
    return this.get<Historial[]>('/historial');
  }

  progreso(tituloId: number): Promise<Historial | null> {
    return this.get<Historial | null>('/historial', new HttpParams().set('titulo', tituloId));
  }

  guardarProgreso(tituloId: number, episodioId: number | null, segundo: number): Promise<Historial> {
    return this.post<Historial>('/historial', {
      titulo_id: tituloId,
      episodio_id: episodioId,
      segundo: Math.floor(segundo)
    });
  }

  // ---------- Administración del catálogo (requieren sesión) ----------
  crearTitulo(datos: TituloInput): Promise<Titulo> {
    return this.post<Titulo>('/titulos', datos);
  }

  actualizarTitulo(id: number, datos: TituloInput): Promise<Titulo> {
    return this.put<Titulo>(`/titulos/${id}`, datos);
  }

  eliminarTitulo(id: number): Promise<unknown> {
    return this.borrar(`/titulos/${id}`);
  }

  crearEpisodio(datos: EpisodioInput): Promise<Episodio> {
    return this.post<Episodio>('/episodios', datos);
  }

  actualizarEpisodio(id: number, datos: EpisodioInput): Promise<Episodio> {
    return this.put<Episodio>(`/episodios/${id}`, datos);
  }

  eliminarEpisodio(id: number): Promise<unknown> {
    return this.borrar(`/episodios/${id}`);
  }

  // ---------- Chatbot ----------
  chatbot(prompt: string): Promise<{ response: string }> {
    return this.post<{ response: string }>('/chatbot', { prompt });
  }

  /**
   * Convierte lo guardado en la BD (nombre de archivo o URL completa) en una URL usable.
   *   'pelicula.mp4'            -> http://127.0.0.1:3000/videos/pelicula.mp4
   *   'https://cdn/x.mp4'       -> se devuelve tal cual
   *   ''                        -> '' (sin archivo)
   */
  archivo(ruta: string | null | undefined, carpeta: 'videos' | 'portadas'): string {
    const valor = (ruta ?? '').trim();
    if (!valor) {
      return '';
    }
    if (/^https?:\/\//i.test(valor)) {
      return valor;
    }
    return `${environment.archivosUrl}/${carpeta}/${encodeURI(valor)}`;
  }

  // ---------- Internos ----------
  private url(ruta: string): string {
    return `${this.base}${ruta}`;
  }

  private headers(): HttpHeaders {
    const token = this.session.token();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private get<T>(ruta: string, params?: HttpParams): Promise<T> {
    return this.ejecutar(this.http.get<T>(this.url(ruta), { headers: this.headers(), params }));
  }

  private post<T>(ruta: string, body: object): Promise<T> {
    return this.ejecutar(this.http.post<T>(this.url(ruta), body, { headers: this.headers() }));
  }

  private put<T>(ruta: string, body: object): Promise<T> {
    return this.ejecutar(this.http.put<T>(this.url(ruta), body, { headers: this.headers() }));
  }

  private borrar(ruta: string): Promise<unknown> {
    return this.ejecutar(this.http.delete(this.url(ruta), { headers: this.headers() }));
  }

  // Convierte el Observable en Promise y traduce los errores HTTP a mensajes legibles
  private async ejecutar<T>(peticion: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(peticion);
    } catch (e) {
      if (e instanceof HttpErrorResponse) {
        if (e.status === 401 && this.session.token()) {
          // Token vencido o inválido: se cierra la sesión local
          this.session.limpiar();
        }
        const mensaje =
          e.status === 0
            ? 'No se pudo conectar con el servidor. ¿Está encendido el backend?'
            : (e.error?.error as string | undefined) ?? `Error ${e.status}`;
        throw new ApiError(e.status, mensaje);
      }
      throw e;
    }
  }
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

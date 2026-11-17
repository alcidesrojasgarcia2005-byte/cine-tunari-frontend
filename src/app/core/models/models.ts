// Tipos de los datos que devuelve la API de Cine Tunari

export interface Sitio {
  id: number;
  nombre: string;
  eslogan: string;
  descripcion: string;
  email: string;
  telefono: string;
}

export interface Seccion {
  id: number;
  clave: string;
  etiqueta: string;
  titulo: string;
  subtitulo: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

export interface Genero {
  id: number;
  nombre: string;
}

export interface Episodio {
  id: number;
  titulo_id: number;
  temporada: number;
  numero: number;
  nombre: string;
  sinopsis: string;
  duracion_min: number | null;
  video_url: string;
}

export interface Titulo {
  id: number;
  titulo: string;
  sinopsis: string;
  anio: number | null;
  duracion_min: number | null;
  pais: string;
  director: string;
  clasificacion: string;
  portada: string;
  banner: string;
  trailer_url: string;
  video_url: string;
  categoria_id: number;
  categoria: string;
  categoria_slug: string;
  destacado: boolean;
  generos: string | null;
  fecha_creacion: string;
  // Solo en GET /titulos/:id
  generos_lista?: Genero[];
  episodios?: Episodio[];
}

export interface FiltrosTitulos {
  categoria?: string;
  genero?: string;
  buscar?: string;
  destacado?: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Favorito {
  id: number;
  titulo_id: number;
  fecha: string;
  titulo: string;
  portada: string;
  anio: number | null;
  categoria: string;
  categoria_slug: string;
}

export interface Historial {
  id: number;
  titulo_id: number;
  episodio_id: number | null;
  segundo: number;
  fecha: string;
  titulo: string;
  portada: string;
  duracion_min: number | null;
  categoria: string;
  categoria_slug: string;
  temporada: number | null;
  numero: number | null;
  episodio_nombre: string | null;
}

// Cuerpos que acepta la API para crear/editar (administración)
export interface TituloInput {
  titulo: string;
  sinopsis: string;
  anio: number | null;
  duracion_min: number | null;
  pais: string;
  director: string;
  clasificacion: string;
  portada: string;
  banner: string;
  trailer_url: string;
  video_url: string;
  categoria_id: number;
  destacado: boolean;
  genero_ids?: number[]; // si se omite, los géneros no cambian
}

export interface EpisodioInput {
  titulo_id: number;
  temporada: number;
  numero: number;
  nombre: string;
  sinopsis: string;
  duracion_min: number | null;
  video_url: string;
}

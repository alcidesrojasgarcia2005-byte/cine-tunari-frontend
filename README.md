# Cine Tunari — Frontend (Angular)

Capa de **presentación** de Cine Tunari, una plataforma de streaming gratuita de películas,
series, novelas y documentales bolivianos y latinoamericanos.
Proyecto Procesual de la materia *Programación Gráfica y Multimedia*.

Consume la API REST del repositorio **`cine-tunari-backend`** (Node + Express + MySQL + Ollama).
La explicación de las 3 capas está en `cine-tunari-backend/ARQUITECTURA.md`.

## Funcionalidades

- Catálogo con portada destacada, filas por categoría, buscador y filtros por categoría y género.
- "Continuar viendo" y "Mi lista" (favoritos) para usuarios con sesión.
- Ficha y reproductor `<video controls>` con búsqueda por tiempo, pensado para videos de 30 min a
  2 h (descarga por rangos), retoma desde el último segundo visto y lista de episodios para series
  y novelas. Si un título no tiene video, muestra "Contenido no disponible aún".
- Registro e inicio de sesión.
- Chatbot flotante (esquina inferior derecha) que responde solo sobre la plataforma.
- Todos los títulos de sección, el nombre del sitio y el eslogan vienen de las tablas `secciones`
  y `sitio` de la base de datos.

## Administración del catálogo (`/admin`)

1. Inicia sesión (usuario de prueba `demo@cinetunari.demo` / `demo1234`).
2. En el menú aparece **Administrar** (o entra a `http://localhost:4200/admin`).
3. Desde ahí puedes, sin escribir SQL:
   - ver todos los títulos, filtrarlos por nombre o categoría y ver cuáles no tienen video;
   - crear, editar y eliminar títulos con todos sus campos (portada, banner y video aceptan el
     nombre del archivo copiado en `cine-tunari-backend/public/...` o una URL);
   - marcar o desmarcar un título como destacado con la estrella ★;
   - en series y novelas, agregar, editar y eliminar episodios.

## Diseño

Estética de sala de cine: fondo casi negro cálido, un único acento dorado envejecido,
Playfair Display para títulos (la última palabra en cursiva dorada) e Inter para el texto.
Todos los colores, tamaños y tiempos son variables CSS en `src/styles.scss`.

## Tecnología

- Angular 22: componentes standalone, señales (`signal`, `computed`) y control de flujo `@if` / `@for`.
- `HttpClient` centralizado en un único servicio: `src/app/core/services/api.ts`.
- SCSS con variables CSS globales (tema oscuro).

## Requisitos

- Node.js 20 o superior y npm
- Angular CLI (`npm install -g @angular/cli`)
- El backend `cine-tunari-backend` funcionando en `http://127.0.0.1:3000`

## Instalación paso a paso

1. Levanta primero el backend (ver su README): XAMPP con MySQL, base importada, Ollama y `npm start`.
2. Instala las dependencias del frontend:
   ```bash
   cd cine-tunari
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
4. Abre `http://localhost:4200`.

Usuario de prueba: `demo@cinetunari.demo` / `demo1234`.

## Configuración (`src/environments/environment.ts`)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `apiUrl` | `http://127.0.0.1:3000/api` | URL base de la API |
| `archivosUrl` | `http://127.0.0.1:3000` | Origen desde donde se sirven `/videos` y `/portadas` |

> El backend solo acepta peticiones del origen configurado en su `CORS_ORIGIN`
> (por defecto `http://localhost:4200`).

## Estructura

```
src/app/
  app.ts / app.html / app.config.ts   Raíz, footer y providers (router + HttpClient)
  app.routes.ts                       Rutas: '', titulo/:id, login, register,
                                      watch/:id (protegida), admin (protegida, carga diferida)
  components/
    header/                           Barra superior con sesión
    title-card/                       Tarjeta 2:3 (iniciales si no hay portada)
    carousel/                         Fila horizontal con flechas
    accent-title/                     Título con la última palabra en cursiva dorada
    chatbot/                          Asistente flotante (POST /api/chatbot)
  core/
    guards/auth.guard.ts              Exige sesión (reproductor y admin)
    models/models.ts                  Interfaces de los datos de la API
    services/api.ts                   ÚNICO servicio HTTP
    services/session.ts               Token y usuario (localStorage)
    services/auth.service.ts          Login, registro y cierre de sesión
    services/content.ts               Textos de `sitio` y `secciones`, categorías y géneros
    services/favorites.ts             Estado compartido de "Mi lista"
  pages/
    catalog/                          Inicio: hero, carruseles por categoría, búsqueda/filtros
    title-detail/                     Ficha del título: banner, ficha técnica, episodios
    admin/                            Administración (lista, formulario, episodios)
    watch/                            Reproductor a pantalla completa
    login/  register/                 Formularios de acceso
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Compilación de producción en `dist/` |
| `npm test` | Pruebas unitarias (Vitest) |

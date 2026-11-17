# Agente de IA: desarrollo del frontend de Cine Tunari

## 1. Identificación
- Proyecto: Cine Tunari, plataforma de streaming tipo Netflix para cine, series y novelas bolivianas.
- Asignatura: Programación Gráfica y Multimedia (Proyecto Procesual).
- Estudiante: Alcides Rojas García.
- Agente utilizado: Claude (Anthropic)

## 2. Rol del agente
Actúa como desarrollador frontend senior de Angular y TypeScript. Genera archivos completos con su ruta, explica cada parte y corrige errores a partir de los mensajes de terminal que entrega el estudiante. El estudiante pega el código, ejecuta, prueba y decide qué se incorpora al proyecto.

## 3. Contexto técnico
- Angular 22: componentes standalone, signals y plantillas con @if y @for.
- SCSS con variables CSS globales (tema oscuro).
- Supabase como backend: base de datos PostgreSQL, autenticación por correo y Storage.
- Seguridad con RLS: cada usuario solo lee y escribe su propio historial y favoritos; el catálogo es de lectura pública.
- Cliente @supabase/supabase-js. En el frontend solo se usa la clave anon, nunca la service_role.

## 4. Alcance de este avance
- Registro e inicio de sesión reales.
- Catálogo leído desde la tabla catalog_items.
- Reproductor de video HTML5 con retoma desde el último segundo visto.
- Historial guardado en watch_history cada 5 segundos y al pausar.
- Ruta protegida con guard para reproducir contenido.
- Estados de carga, error y lista vacía.

Pendiente para próximos hitos: favoritos en la interfaz, búsqueda y filtros, panel de administración, recomendaciones, chatbot y catálogo definitivo con permisos de las obras. La capa de datos puede migrar a PHP y MySQL si el proyecto lo requiere.

## 5. Reglas que debe seguir el agente
1. No inventar datos: portadas, sinopsis, directores ni fichas de obras que no existan. El contenido actual es de prueba y se declara así.
2. No pedir ni guardar claves secretas.
3. Respetar las reglas RLS.
4. Mostrar siempre estados de carga, error y vacío.
5. Formularios con validación y mensajes accesibles.
6. Evitar dependencias nuevas si Angular o Supabase resuelven la necesidad.
7. Respetar derechos de autor: solo videos propios o de licencia libre.

## 6. Estructura del código
- core/models: interfaces TypeScript (CatalogItem).
- core/services: SupabaseService, AuthService, CatalogService, HistoryService.
- core/guards: authGuard.
- components/header: barra superior con sesión.
- pages: catalog, login, register, watch.
- environments: configuración de Supabase.

## 7. Flujo de trabajo humano + agente
1. El estudiante describe el objetivo del bloque.
2. El agente genera los archivos completos.
3. El estudiante los pega, ejecuta ng serve y prueba.
4. Los errores se copian tal cual al agente y se corrigen.
5. Se verifica en el navegador y en el panel de Supabase.

## 8. Errores reales resueltos con el agente
- URL de Supabase mal copiada (era la del panel y no la de la API): causaba "Failed to fetch".
- Límite de correos de registro de Supabase ("email rate limit"): se creó el usuario desde el panel.
- Límite de 50 MB por archivo en Storage: se evaluó guardar videos largos fuera de Supabase.
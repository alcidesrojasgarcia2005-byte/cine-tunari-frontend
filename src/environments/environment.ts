// Dirección de la API (capa de lógica de negocio). El frontend NUNCA se conecta a MySQL.
export const environment = {
  apiUrl: 'http://127.0.0.1:3000/api',
  // Origen del backend, desde donde se sirven /videos y /portadas
  archivosUrl: 'http://127.0.0.1:3000'
};

import { Injectable, computed, signal } from '@angular/core';

import { Sesion, Usuario } from '../models/models';

const CLAVE = 'cine-tunari.sesion';

// Guarda el token y el usuario en el navegador (localStorage) y los expone como señales.
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly sesion = signal<Sesion | null>(leer());

  readonly token = computed(() => this.sesion()?.token ?? null);
  readonly usuario = computed<Usuario | null>(() => this.sesion()?.usuario ?? null);

  guardar(sesion: Sesion): void {
    this.sesion.set(sesion);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      // Almacenamiento no disponible (modo privado): la sesión dura hasta recargar
    }
  }

  limpiar(): void {
    this.sesion.set(null);
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // nada que limpiar
    }
  }
}

function leer(): Sesion | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    const datos = crudo ? (JSON.parse(crudo) as Sesion) : null;
    return datos?.token && datos.usuario ? datos : null;
  } catch {
    return null;
  }
}

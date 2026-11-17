import { Injectable, inject } from '@angular/core';

import { Api } from './api';
import { Session } from './session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);
  private readonly session = inject(Session);

  readonly user = this.session.usuario;
  // Al iniciar, comprueba que el token guardado siga siendo válido
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.session.token()
      ? this.api.yo().then(
          () => undefined,
          () => undefined // si falla con 401, Api ya limpió la sesión
        )
      : Promise.resolve();
  }

  async signUp(email: string, password: string, displayName: string): Promise<void> {
    this.session.guardar(await this.api.registrar(displayName, email, password));
  }

  async signIn(email: string, password: string): Promise<void> {
    this.session.guardar(await this.api.login(email, password));
  }

  async signOut(): Promise<void> {
    this.session.limpiar();
  }
}

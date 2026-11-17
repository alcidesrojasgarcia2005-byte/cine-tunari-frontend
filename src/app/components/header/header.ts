import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Content } from '../../core/services/content';
import { AccentTitle } from '../accent-title/accent-title';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AccentTitle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: { '(window:scroll)': 'onScroll()' }
})
export class Header {
  readonly auth = inject(AuthService);
  readonly content = inject(Content);
  private readonly router = inject(Router);

  readonly solido = signal(false);
  readonly menu = signal(false);
  readonly busqueda = signal('');
  readonly activo = { paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' } as const;

  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.menu.set(false);
        // Mantiene el buscador sincronizado con ?buscar= de la URL
        const buscar = this.router.parseUrl(e.urlAfterRedirects).queryParamMap.get('buscar') ?? '';
        if (buscar !== this.busqueda()) {
          this.busqueda.set(buscar);
        }
      }
    });
  }

  onScroll(): void {
    this.solido.set(window.scrollY > 40);
  }

  alternarMenu(): void {
    this.menu.update((v) => !v);
  }

  onBuscar(texto: string): void {
    this.busqueda.set(texto);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.irABuscar(), 350);
  }

  irABuscar(): void {
    clearTimeout(this.temporizador);
    const texto = this.busqueda().trim();
    const enInicio = this.router.url === '/' || this.router.url.startsWith('/?');
    this.router.navigate(['/'], {
      queryParams: { buscar: texto || null },
      queryParamsHandling: enInicio ? 'merge' : '',
      replaceUrl: enInicio
    });
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }
}

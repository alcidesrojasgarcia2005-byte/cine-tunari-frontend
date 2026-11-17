import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AccentTitle } from '../../components/accent-title/accent-title';

import { AuthService } from '../../core/services/auth.service';
import { Content } from '../../core/services/content';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AccentTitle],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly content = inject(Content);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.signIn(email, password);
      // Vuelve a la página que pidió el login (p. ej. /admin) o al inicio
      const destino = this.route.snapshot.queryParamMap.get('volver');
      await this.router.navigateByUrl(destino?.startsWith('/') ? destino : '/');
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}
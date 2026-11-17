import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AccentTitle } from '../../components/accent-title/accent-title';

import { AuthService } from '../../core/services/auth.service';
import { Content } from '../../core/services/content';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AccentTitle],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly content = inject(Content);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
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
      const { displayName, email, password } = this.form.getRawValue();
      await this.auth.signUp(email, password, displayName);
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
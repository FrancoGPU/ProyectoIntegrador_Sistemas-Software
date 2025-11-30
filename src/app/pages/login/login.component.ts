import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  showPassword: boolean = false;
  isRegistering: boolean = false;

  // Campos de registro
  regUsername: string = '';
  regEmail: string = '';
  regPassword: string = '';
  regConfirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Si ya está autenticado, redirigir según rol
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  toggleRegister(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.username = '';
    this.password = '';
    this.regUsername = '';
    this.regEmail = '';
    this.regPassword = '';
    this.regConfirmPassword = '';
  }

  onRegister(): void {
    if (!this.regUsername || !this.regEmail || !this.regPassword || !this.regConfirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.regPassword !== this.regConfirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const newUser = {
      username: this.regUsername,
      email: this.regEmail,
      password: this.regPassword
    };

    this.authService.register(newUser).subscribe({
      next: () => {
        this.loading = false;
        this.isRegistering = false;
        this.errorMessage = '';
        alert('Registro exitoso. Por favor inicie sesión.');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error al registrar usuario';
      }
    });
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor ingrese usuario y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.redirectByRole();
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error al intentar iniciar sesión';
      }
    });
  }

  private redirectByRole(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/entregas']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

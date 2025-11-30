import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'proyecto-integrador';
  isMenuOpen = false;
  
  // Modal de Admin
  showAdminModal = false;
  adminUsername = '';
  adminEmail = '';
  adminPassword = '';
  adminConfirmPassword = '';
  adminError = '';
  adminLoading = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: any) {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Controlar el scroll del body cuando el menú está abierto
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  logout() {
    this.closeMenu();
    this.authService.logout();
  }

  // Métodos para el modal de Admin
  openAdminModal() {
    this.showAdminModal = true;
    this.adminUsername = '';
    this.adminEmail = '';
    this.adminPassword = '';
    this.adminConfirmPassword = '';
    this.adminError = '';
  }

  closeAdminModal() {
    this.showAdminModal = false;
  }

  createAdmin() {
    if (!this.adminUsername || !this.adminEmail || !this.adminPassword || !this.adminConfirmPassword) {
      this.adminError = 'Todos los campos son obligatorios';
      return;
    }

    if (this.adminPassword !== this.adminConfirmPassword) {
      this.adminError = 'Las contraseñas no coinciden';
      return;
    }

    this.adminLoading = true;
    this.adminError = '';

    const newAdmin = {
      username: this.adminUsername,
      email: this.adminEmail,
      password: this.adminPassword
    };

    this.authService.createAdmin(newAdmin).subscribe({
      next: () => {
        this.adminLoading = false;
        this.closeAdminModal();
        alert('Administrador creado exitosamente');
      },
      error: (error) => {
        this.adminLoading = false;
        this.adminError = error.message || 'Error al crear administrador';
      }
    });
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  ngOnInit() {
    // Listener adicional para scroll del contenido principal
    document.addEventListener('scroll', this.handleScroll.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  private handleScroll() {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }
}

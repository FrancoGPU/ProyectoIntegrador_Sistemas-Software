import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'proyecto-integrador';
  isMenuOpen = false;

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

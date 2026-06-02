import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

declare const grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements AfterViewInit {
  credentials = { username: '', password: '', captchaToken: '' };
  isRegistering = false;
  errorMessage = '';
  failedAttempts = 0;
  showCaptcha = false;

  constructor(private auth: AuthService, private router: Router, private zone: NgZone) { }

  ngAfterViewInit() {
    const storedAttempts = localStorage.getItem('failedLoginAttempts');
    if (storedAttempts) {
      this.failedAttempts = parseInt(storedAttempts, 10);
    }
    this.checkCaptchaRequirement();
  }

  checkCaptchaRequirement() {
    if (this.failedAttempts >= 3) {
      this.showCaptcha = true;
      setTimeout(() => this.renderCaptcha(), 100);
    }
  }

  renderCaptcha() {
    if (!this.showCaptcha) return;

    if (typeof grecaptcha !== 'undefined') {
      // Check if already rendered to avoid error
      const container = document.getElementById('recaptcha-container');
      if (container && !container.hasChildNodes()) {
        grecaptcha.render('recaptcha-container', {
          'sitekey': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
          'callback': (response: string) => {
            this.zone.run(() => {
              this.credentials.captchaToken = response;
            });
          }
        });
      }
    } else {
      setTimeout(() => this.renderCaptcha(), 100);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    // For now, we only implement login logic as per requirements, 
    // but the backend supports register.
    // If we wanted to support register, we could add a toggle or simple logic.
    // Let's assume the user might want to register if login fails? 
    // Or just simple login as requested. "Login sencilla".

    // We'll stick to login. If the user doesn't exist, they can't login.
    // Wait, create a simple toggle for register just in case, or auto-register?
    // Requirement: "página de login sencilla con un formulario de usuario y contraseña".
    // I previously implemented Register in backend.

    // I'll implement simple Login.

    // Check local requirement
    if (this.showCaptcha && !this.credentials.captchaToken) {
      this.errorMessage = 'Por favor completa el captcha.';
      return;
    }

    this.auth.login(this.credentials).subscribe({
      next: () => {
        // Reset attempts on success
        this.failedAttempts = 0;
        localStorage.removeItem('failedLoginAttempts');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        // Increment attempts
        this.failedAttempts++;
        localStorage.setItem('failedLoginAttempts', this.failedAttempts.toString());
        this.checkCaptchaRequirement();

        // Show specific error from backend if available
        // Show specific error from backend if available
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.status === 400 && err.error) { // Angular sometimes wraps the string in error
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Credenciales inválidas o error de conexión.';
        }
        console.error(err);
      }
    });
  }
}

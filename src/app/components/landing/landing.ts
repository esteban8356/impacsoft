import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { NotificationComponent } from '../notification/notification';
import { ProgrammerDeskComponent } from '../programmer-desk/programmer-desk.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LottieComponent, NotificationComponent, ProgrammerDeskComponent],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('codeBox') codeBoxRef?: ElementRef;
  currentYear = new Date().getFullYear();
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Lottie Animation Options
  rocketOptions: AnimationOptions = {
    path: '/assets/rocket.json',
    loop: true,
    autoplay: true
  };

  glassOptions: AnimationOptions = {
    path: '/assets/glass.json',
    loop: true,
    autoplay: true
  };

  diamondOptions: AnimationOptions = {
    path: '/assets/diamond.json',
    loop: true,
    autoplay: true
  };

  private interval: any;
  private codeLines = [
    `const <span class="code-keyword">ImpacSoft</span> = {`,
    `  foco: <span class="code-string">"software de alto impacto"</span>,`,
    `  lenguajes: [<span class="code-string">"Python"</span>, <span class="code-string">"Java"</span>, <span class="code-string">"C#"</span>, <span class="code-string">"SQL"</span>, <span class="code-string">"Postgres"</span>],`,
    `  stack: [<span class="code-string">"Flutter"</span>, <span class="code-string">"Supabase"</span>, <span class="code-string">"n8n"</span>],`,
    `  <span class="code-func">crearSolucion</span>(idea) {`,
    `    <span class="code-comment">// Escuchamos, diseñamos y desarrollamos con vos</span>`,
    `    <span class="code-keyword">return</span> idea + <span class="code-string">" convertida en producto digital"</span>;`,
    `  },`,
    `};`,
    ` `,
    `<span class="code-comment">// Iniciando sistema...</span>`,
    `<span class="code-comment">// Optimizando procesos...</span>`,
    `<span class="code-comment">// Generando valor...</span>`
  ];

  contactForm = {
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    mensaje: ''
  };

  // Notification State
  showNotification = false;
  notificationTitle = '';
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) { }

  @ViewChild('programmerImg') programmerImgRef!: ElementRef;
  @ViewChild('heroInteractive') heroRef!: ElementRef;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (isPlatformBrowser(this.platformId) && this.programmerImgRef && this.heroRef) {
      const container = this.heroRef.nativeElement;
      const img = this.programmerImgRef.nativeElement;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation based on cursor position relative to center
      // Limit rotation to small angles for subtle effect (e.g., +/- 5deg)
      const rotateX = ((y - centerY) / centerY) * -5; // Invert Y axis for correct tilt
      const rotateY = ((x - centerX) / centerX) * 5;

      img.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.playTypewriter();
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  playTypewriter() {
    let idx = 0;
    let buffer: string[] = [];

    if (!this.codeBoxRef) return; // Safeguard if element is removed
    const container = this.codeBoxRef.nativeElement;

    const run = () => {
      buffer = [];
      idx = 0;
      container.innerHTML = "";

      this.interval = setInterval(() => {
        if (idx >= this.codeLines.length) {
          clearInterval(this.interval);
          setTimeout(() => run(), 3200); // Restart loop
          return;
        }
        buffer.push(this.codeLines[idx]);
        this.renderCode(buffer, container);
        idx++;
      }, 320);
    };

    run();
  }

  renderCode(lines: string[], container: HTMLElement) {
    container.innerHTML = "";
    lines.forEach((line, index) => {
      const row = document.createElement("div");
      row.className = "code-line";

      const num = document.createElement("span");
      num.textContent = (index + 1).toString();

      const content = document.createElement("span");
      content.innerHTML = line;

      row.appendChild(num);
      row.appendChild(content);
      container.appendChild(row);
    });

    // Cursor line
    const cursorLine = document.createElement("div");
    cursorLine.className = "code-line";

    const cursorNum = document.createElement("span");
    cursorNum.textContent = (lines.length + 1).toString();

    const cursorHolder = document.createElement("span");
    const cursor = document.createElement("span");
    cursor.className = "code-cursor";

    cursorHolder.appendChild(cursor);
    cursorLine.appendChild(cursorNum);
    cursorLine.appendChild(cursorHolder);

    container.appendChild(cursorLine);
  }

  onSubmit() {
    if (!this.contactForm.nombre || !this.contactForm.email || !this.contactForm.telefono || !this.contactForm.empresa || !this.contactForm.mensaje) {
      this.triggerNotification('Campos Incompletos', 'Por favor completa todos los campos para poder contactarte.', 'error');
      return;
    }

    this.http.post('http://localhost:3000/api/create-request', this.contactForm)
      .subscribe({
        next: (res: any) => {
          this.triggerNotification('¡Mensaje Enviado!', 'Hemos recibido tu solicitud. Nos pondremos en contacto muy pronto.', 'success');
          this.contactForm = { nombre: '', email: '', telefono: '', empresa: '', mensaje: '' };
        },
        error: (err) => {
          console.error(err);
          this.triggerNotification('Error de Envío', 'Ocurrió un problema al enviar el mensaje. Por favor intenta de nuevo.', 'error');
        }
      });
  }

  triggerNotification(title: string, message: string, type: 'success' | 'error') {
    this.notificationTitle = title;
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
  }

  closeNotification() {
    this.showNotification = false;
  }
}

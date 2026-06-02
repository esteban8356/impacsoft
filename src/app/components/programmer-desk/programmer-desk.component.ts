import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-programmer-desk',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './programmer-desk.component.html',
    styleUrls: ['./programmer-desk.component.scss']
})
export class ProgrammerDeskComponent implements AfterViewInit, OnDestroy {
    @ViewChild('codeBox') codeBoxRef!: ElementRef;
    private interval: any;

    private codeLines = [
        'const ImpacSoft = {',
        '  foco: "software de alto impacto",',
        '  lenguajes: ["Python", "Java", "C#", "SQL", "Postgres"],',
        '  stack: ["Flutter", "Supabase", "n8n"],',
        '  crearSolucion(idea) {',
        '    // Escuchamos, diseñamos y desarrollamos con vos',
        '    return idea + " convertida en producto digital";',
        '  },',
        '};'
    ];

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.playTypewriter();
        }
    }

    ngOnDestroy() {
        if (this.interval) clearInterval(this.interval);
    }

    playTypewriter() {
        let idx = 0;
        let buffer: string[] = [];
        // Verify element exists before accessing
        if (!this.codeBoxRef) return;

        const container = this.codeBoxRef.nativeElement;
        container.innerHTML = "";

        const runLoop = () => {
            this.interval = setInterval(() => {
                if (idx >= this.codeLines.length) {
                    clearInterval(this.interval);
                    setTimeout(() => {
                        idx = 0;
                        buffer = [];
                        if (container) container.innerHTML = "";
                        runLoop();
                    }, 3200);
                    return;
                }

                buffer.push(this.codeLines[idx]);
                this.renderCode(buffer, container);
                idx++;
            }, 320);
        };

        runLoop();
    }

    renderCode(lines: string[], container: HTMLElement) {
        container.innerHTML = "";
        lines.forEach((line, index) => {
            const row = document.createElement("div");
            row.className = "code-line";

            const num = document.createElement("span");
            num.textContent = (index + 1).toString();

            const content = document.createElement("span");

            // Regex replacement logic from user snippet
            let html = line
                .replace(/(const|return)/g, '<span class="code-keyword">$1</span>')
                .replace(/(ImpacSoft|crearSolucion)/g, '<span class="code-func">$1</span>')
                .replace(/"([^"]*)"/g, '<span class="code-string">"$1"</span>')
                .replace(/\/\/(.*)$/g, '<span class="code-comment">//$1</span>');

            content.innerHTML = html;

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
}

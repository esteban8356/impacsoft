import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-case-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './case-detail.html',
    styleUrls: ['./case-detail.scss']
})
export class CaseDetailComponent implements OnInit {
    caseId: string | null = null;
    caso: any = null;
    comments: any[] = [];
    tests: any[] = [];

    // Kanban
    actividades: any[] = [];
    programadas: any[] = [];
    hechas: any[] = [];
    finalizadas: any[] = [];

    activeTab: string = 'details'; // 'details', 'tests', 'kanban'
    loading = true;

    // Forms
    newComment = { contenido: '', adjuntos: '' };
    newTest = { nombre: '', resultado: '', adjuntos: '' };
    newActividad = { titulo: '', descripcion: '', estado: 'Programada' };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        public auth: AuthService
    ) { }

    ngOnInit() {
        this.caseId = this.route.snapshot.paramMap.get('id');
        if (this.caseId) {
            this.fetchCaseData();
        }
    }

    fetchCaseData() {
        this.loading = true;


        // 1. Get Case Details
        this.http.get<any>(`http://localhost:3000/api/casos/${this.caseId}`).subscribe({
            next: (res) => {
                this.caso = res.data;
                this.fetchAllLists();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                alert('Error cargando el caso');
            }
        });
    }

    fetchAllLists() {


        // Parallel requests for comments, tests, and actividades
        Promise.all([
            this.http.get<any>(`http://localhost:3000/api/casos/${this.caseId}/comentarios`).toPromise(),
            this.http.get<any>(`http://localhost:3000/api/casos/${this.caseId}/tests`).toPromise(),
            this.http.get<any>(`http://localhost:3000/api/casos/${this.caseId}/actividades`).toPromise()
        ]).then(([commentsRes, testsRes, activityRes]) => {
            this.comments = commentsRes.data;
            this.tests = testsRes.data;
            this.actividades = activityRes.data;
            this.sortActividades();
            this.loading = false;
        }).catch(err => {
            console.error(err);
            this.loading = false;
        });
    }

    sortActividades() {
        this.programadas = this.actividades.filter(a => a.estado === 'Programada');
        this.hechas = this.actividades.filter(a => a.estado === 'Hecha');
        this.finalizadas = this.actividades.filter(a => a.estado === 'Finalizada');
    }

    updateCaso() {


        this.http.put(`http://localhost:3000/api/casos/${this.caseId}`, this.caso).subscribe({
            next: (res: any) => {
                alert('Caso actualizado');
                this.caso = res.data;
            },
            error: (err) => alert('Error actualizando caso')
        });
    }

    addComment() {
        if (!this.newComment.contenido) return;



        const payload = {
            ...this.newComment,
            autor: this.auth.getUsername()
        };

        this.http.post(`http://localhost:3000/api/casos/${this.caseId}/comentarios`, payload).subscribe({
            next: (res: any) => {
                this.comments.unshift(res.data);
                this.newComment = { contenido: '', adjuntos: '' };
            },
            error: (err) => alert('Error al comentar')
        });
    }

    addTest() {
        if (!this.newTest.nombre) return;



        this.http.post(`http://localhost:3000/api/casos/${this.caseId}/tests`, this.newTest).subscribe({
            next: (res: any) => {
                this.tests.unshift(res.data);
                this.newTest = { nombre: '', resultado: '', adjuntos: '' };
            },
            error: (err) => alert('Error al agregar test')
        });
    }

    // Kanban Logic
    addActividad() {
        if (!this.newActividad.titulo) return;



        this.http.post(`http://localhost:3000/api/casos/${this.caseId}/actividades`, this.newActividad).subscribe({
            next: (res: any) => {
                this.actividades.unshift(res.data);
                this.sortActividades();
                this.newActividad = { titulo: '', descripcion: '', estado: 'Programada' };
            },
            error: (err) => alert('Error al crear actividad')
        });
    }

    moveActividad(actividad: any, newStatus: string) {


        this.http.put(`http://localhost:3000/api/casos/${this.caseId}/actividades/${actividad.id}`, { estado: newStatus }).subscribe({
            next: (res: any) => {
                actividad.estado = newStatus;
                this.sortActividades();
            },
            error: (err) => alert('Error al mover actividad')
        });
    }

    deleteActividad(id: number) {
        if (!confirm('¿Eliminar actividad?')) return;


        this.http.delete(`http://localhost:3000/api/casos/${this.caseId}/actividades/${id}`).subscribe({
            next: () => {
                this.actividades = this.actividades.filter(a => a.id !== id);
                this.sortActividades();
            },
            error: (err) => alert('Error al eliminar actividad')
        });
    }

    goBack() {
        this.router.navigate(['/home']);
    }
}

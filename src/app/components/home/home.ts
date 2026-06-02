import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { StatsService } from '../../services/stats.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  message = '';
  data: any[] = [];
  requests: any[] = [];
  users: any[] = [];
  roles: any[] = [];
  cases: any[] = [];
  clientes: any[] = [];
  availableModules = ['home', 'requests', 'users', 'roles', 'casos', 'clientes'];

  currentView: string = 'home';
  searchTerm: string = '';
  loading = true;

  // Forms
  newUser = { username: '', password: '', role: '' };
  newRole = { name: '', modules: [] as string[] };
  newCaso = { nombre: '', email: '', telefono: '', empresa: '', mensaje: '', status: 'Abierto', clienteId: null as number | null };
  newCliente: any = {};

  // Modal State
  selectedRequest: any = null;
  isModalOpen = false;
  isCasoModalOpen = false;
  isClienteModalOpen = false;
  editingCliente: any = null;

  // Stats
  stats: any = null;
  charts: any[] = [];

  constructor(public http: HttpClient, public auth: AuthService, private statsService: StatsService) { } // public for template access

  ngOnInit() {
    this.fetchData();
    if (this.auth.hasAccess('home')) {
      this.fetchStats();
    }

    // Set initial view based on access if not home
    if (!this.auth.hasAccess('home')) {
      if (this.auth.hasAccess('requests')) this.currentView = 'requests';
    }
  }

  fetchStats() {
    this.statsService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data;
        }
      },
      error: (err) => console.error('Error fetching stats', err)
    });
  }

  // Charts removed by user request

  fetchData() {


    this.http.get<any>('http://localhost:3000/api/data').subscribe({
      next: (response) => {
        this.message = response.message;
        this.data = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        if (err.status === 401) {
          this.auth.logout();
        }
      }
    });
  }

  fetchRequests() {


    this.http.get<any>('http://localhost:3000/api/requests').subscribe({
      next: (response) => {
        this.requests = response.data;
      },
      error: (err) => console.error(err)
    });
  }

  fetchUsers() {


    this.http.get<any>('http://localhost:3000/api/users').subscribe({
      next: (response) => {
        this.users = response.data;
        // Fetch roles as well when managing users
        this.fetchRoles();
      },
      error: (err) => console.error(err)
    });
  }

  fetchRoles() {


    this.http.get<any>('http://localhost:3000/api/roles').subscribe({
      next: (response) => {
        this.roles = response.data;
      },
      error: (err) => console.error(err)
    });
  }

  get filteredRequests() {
    if (!this.searchTerm) return this.requests;
    const lower = this.searchTerm.toLowerCase();
    return this.requests.filter(req =>
      req.nombre.toLowerCase().includes(lower) ||
      req.email.toLowerCase().includes(lower) ||
      (req.empresa && req.empresa.toLowerCase().includes(lower))
    );
  }

  setView(view: string) {
    if (!this.auth.hasAccess(view)) {
      alert('No tienes permiso para ver este módulo.');
      return;
    }
    this.currentView = view;
    if (view === 'requests') {
      this.fetchRequests();
    } else if (view === 'users') {
      this.fetchUsers();
    } else if (view === 'roles') {
      this.fetchRoles();
    } else if (view === 'casos') {
      this.fetchCases();
    } else if (view === 'clientes') {
      this.fetchClientes();
    }
  }

  fetchCases() {


    this.http.get<any>('http://localhost:3000/api/casos').subscribe({
      next: (response) => {
        this.cases = response.data;
      },
      error: (err) => console.error(err)
    });
  }

  // --- User Management ---
  isUserModalOpen = false;

  openUserModal() {
    this.newUser = { username: '', password: '', role: '' };
    this.isUserModalOpen = true;
  }

  closeUserModal() {
    this.isUserModalOpen = false;
  }

  createUser() {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.role) {
      this.alert('Todos los campos son obligatorios');
      return;
    }



    this.http.post('http://localhost:3000/api/users', this.newUser).subscribe({
      next: () => {
        this.alert('Usuario creado');
        this.closeUserModal();
        this.fetchUsers();
      },
      error: (err) => this.alert('Error creando usuario: ' + (err.error?.message || err.message))
    });
  }

  deleteUser(id: number) {
    if (!confirm('¿Borrar usuario?')) return;


    this.http.delete(`http://localhost:3000/api/users/${id}`).subscribe({
      next: () => {
        this.alert('Usuario eliminado');
        this.fetchUsers();
      },
      error: (err) => this.alert('Error eliminando usuario')
    });
  }

  // --- Role Management ---
  isRoleModalOpen = false;

  openRoleModal() {
    this.newRole = { name: '', modules: [] };
    this.isRoleModalOpen = true;
  }

  closeRoleModal() {
    this.isRoleModalOpen = false;
  }

  toggleModule(module: string) {
    const index = this.newRole.modules.indexOf(module);
    if (index > -1) {
      this.newRole.modules.splice(index, 1);
    } else {
      this.newRole.modules.push(module);
    }
  }

  createRole() {


    this.http.post('http://localhost:3000/api/roles', this.newRole).subscribe({
      next: () => {
        this.alert('Rol creado');
        this.closeRoleModal();
        this.fetchRoles();
      },
      error: (err) => this.alert('Error creando rol: ' + (err.error?.message || err.message))
    });
  }

  deleteRole(name: string) {
    if (!confirm('¿Borrar rol?')) return;


    this.http.delete(`http://localhost:3000/api/roles/${name}`).subscribe({
      next: () => {
        this.alert('Rol eliminado');
        this.fetchRoles();
      },
      error: (err) => this.alert('Error eliminando rol')
    });
  }

  // --- Modal Logic ---
  openModal(request: any) {
    this.selectedRequest = request;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedRequest = null;
  }

  createCasoFromRequest(request: any) {
    if (!confirm('¿Crear caso a partir de esta solicitud? La solicitud se eliminará de la lista.')) return;



    const payload = {
      requestId: request.id,
      nombre: request.nombre,
      email: request.email,
      telefono: request.telefono,
      empresa: request.empresa,
      mensaje: request.mensaje,
      status: 'Abierto'
    };

    this.http.post('http://localhost:3000/api/casos', payload).subscribe({
      next: () => {
        this.alert('Caso creado correctamente');
        this.closeModal(); // Close request modal
        this.fetchRequests(); // Refresh requests list
        this.fetchStats(); // Update dashboard indicators
      },
      error: (err) => this.alert('Error al crear el caso: ' + (err.error?.message || err.message))
    });
  }

  deleteRequest(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) return;



    this.http.delete(`http://localhost:3000/api/requests/${id}`).subscribe({
      next: () => {
        this.alert('Solicitud eliminada correctamente');
        // Close modal if open and it's the deleted one (optional but good UX)
        if (this.selectedRequest && this.selectedRequest.id === id) {
          this.closeModal();
        }
        this.fetchRequests(); // Refresh list
        this.fetchStats(); // Update dashboard indicators
      },
      error: (err) => {
        console.error(err);
        this.alert('Error al eliminar la solicitud');
      }
    });
  }

  // --- Caso Management (Direct Creation) ---
  openCasoModal() {
    this.newCaso = { nombre: '', email: '', telefono: '', empresa: '', mensaje: '', status: 'Abierto', clienteId: null };
    this.isCasoModalOpen = true;
    // Fetch clientes if not already loaded
    if (this.clientes.length === 0) {
      this.fetchClientes();
    }
  }

  closeCasoModal() {
    this.isCasoModalOpen = false;
  }

  createDirectCaso() {
    if (!this.newCaso.nombre || !this.newCaso.email || !this.newCaso.telefono || !this.newCaso.mensaje) {
      this.alert('Por favor completa todos los campos obligatorios (Nombre, Email, Teléfono, Descripción)');
      return;
    }



    this.http.post('http://localhost:3000/api/casos', this.newCaso).subscribe({
      next: () => {
        this.alert('Caso creado exitosamente');
        this.closeCasoModal();
        this.fetchCases(); // Refresh cases list
        this.fetchStats(); // Update dashboard indicators
      },
      error: (err) => this.alert('Error al crear el caso: ' + (err.error?.message || err.message))
    });
  }

  // --- Cliente Management ---
  fetchClientes() {


    this.http.get<any>('http://localhost:3000/api/clientes').subscribe({
      next: (response) => {
        if (response.success) {
          this.clientes = response.data;
        }
      },
      error: (err) => console.error('Error fetching clientes:', err)
    });
  }

  openClienteModal(cliente?: any) {
    if (cliente) {
      // Edit mode
      this.editingCliente = cliente;
      this.newCliente = { ...cliente }; // Clone object
    } else {
      // Create mode
      this.editingCliente = null;
      this.newCliente = {
        nombre: '',
        razonSocial: '',
        nit: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        pais: 'Colombia',
        contactoPrincipal: '',
        cargoContacto: '',
        sitioWeb: '',
        notas: ''
      };
    }
    this.isClienteModalOpen = true;
  }

  closeClienteModal() {
    this.isClienteModalOpen = false;
    this.editingCliente = null;
  }

  saveCliente() {
    if (!this.newCliente.nombre || !this.newCliente.email) {
      this.alert('Por favor completa los campos obligatorios (Nombre y Email)');
      return;
    }

    if (this.editingCliente) {
      // Update existing cliente


      this.http.put(`http://localhost:3000/api/clientes/${this.editingCliente.id}`, this.newCliente).subscribe({
        next: () => {
          this.alert('Cliente actualizado exitosamente');
          this.closeClienteModal();
          this.fetchClientes();
        },
        error: (err) => this.alert('Error al actualizar el cliente: ' + (err.error?.message || err.message))
      });
    } else {
      // Create new cliente


      this.http.post('http://localhost:3000/api/clientes', this.newCliente).subscribe({
        next: () => {
          this.alert('Cliente creado exitosamente');
          this.closeClienteModal();
          this.fetchClientes();
        },
        error: (err) => this.alert('Error al crear el cliente: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteCliente(id: number) {
    if (!confirm('¿Estás seguro de que deseas desactivar este cliente?')) return;



    this.http.delete(`http://localhost:3000/api/clientes/${id}`).subscribe({
      next: () => {
        this.alert('Cliente desactivado correctamente');
        this.fetchClientes();
      },
      error: (err) => this.alert('Error al desactivar el cliente')
    });
  }

  logout() {
    this.auth.logout();
  }

  alert(msg: string) {
    window.alert(msg);
  }
}

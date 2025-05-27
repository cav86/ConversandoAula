import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

interface Mensaje {
  id: string;
  mensaje: string;
  fecha: string;
  usuario_id: string;
  email?: string;
  sala: string;
  nombre?: string; // generado desde el email
}

@Component({
  selector: 'app-sala',
  standalone: false,
  templateUrl: './sala.page.html',
  styleUrls: ['./sala.page.scss']
})
export class SalaPage implements OnInit {
  sala: string = '';
  mensaje: string = '';
  mensajes: Mensaje[] = [];
  userId: string | null = null;
  userEmail: string = '';

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    this.sala = this.route.snapshot.paramMap.get('nombreSala') ?? '';

    const { data: { user } } = await this.supabase.client.auth.getUser();
    this.userId = user?.id ?? null;
    this.userEmail = user?.email ?? '';

    if (!this.userId || !this.sala) {
      alert('No se pudo cargar la sala correctamente.');
      return;
    }

    this.cargarMensajes();
    this.escucharNuevosMensajes();
  }

  async cargarMensajes() {
    const { data, error } = await this.supabase.client
      .from('mensajes')
      .select('*')
      .order('fecha', { ascending: true })
      .eq('sala', this.sala);

    if (!error && data) {
      this.mensajes = data.map((msg: Mensaje) => ({
        ...msg,
        nombre: msg.usuario_id === this.userId
          ? ''
          : (msg.email?.split('@')[0] ?? 'usuario')
      }));
    }
  }

  async enviarMensaje() {
    if (!this.mensaje.trim() || !this.userId || !this.sala) return;

    const { error } = await this.supabase.client.from('mensajes').insert({
      mensaje: this.mensaje.trim(),
      usuario_id: this.userId,
      email: this.userEmail,
      sala: this.sala
    });

    if (error) {
      console.error('Error al insertar mensaje:', error);
    }

    this.mensaje = '';
  }

  escucharNuevosMensajes() {
    this.supabase.client
      .channel('mensajes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `sala=eq.${this.sala}`
        },
        (payload) => {
          const msg = payload.new as Mensaje;

          msg.nombre = msg.usuario_id === this.userId
            ? ''
            : (msg.email?.split('@')[0] ?? 'usuario');

          this.mensajes.push(msg);
        }
      )
      .subscribe();
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-sala',
  standalone: false,
  templateUrl: './sala.page.html',
  styleUrls: ['./sala.page.scss']
})
export class SalaPage implements OnInit {
  sala: string = '';
  mensaje: string = '';
  mensajes: any[] = [];
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    this.sala = this.route.snapshot.paramMap.get('nombreSala')!;
    const {
      data: { user }
    } = await this.supabase.client.auth.getUser();
    this.userId = user?.id ?? null;
    if (!this.userId) {
      alert('No se pudo obtener el usuario actual.');
      return;
    }
    this.cargarMensajes();
  }

  async cargarMensajes() {
    const { data, error } = await this.supabase.client
      .from('mensajes')
      .select('*')
      .order('fecha', { ascending: true })
      .eq('sala', this.sala);

    if (!error) {
      this.mensajes = data;
    }
  }

 async enviarMensaje() {
  if (!this.mensaje.trim()) return;
  if (!this.userId) {
    alert('Error: usuario no identificado');
    return;
  }
  if (!this.sala) {
    alert('Error: no se detectó el nombre de la sala.');
    return;
  }

  const { error } = await this.supabase.client.from('mensajes').insert({
    mensaje: this.mensaje.trim(),
    usuario_id: this.userId,
    sala: this.sala
  });

  if (error) {
    console.error('Error al insertar mensaje:', error);
  }

  this.mensaje = '';
  this.cargarMensajes();
}

}

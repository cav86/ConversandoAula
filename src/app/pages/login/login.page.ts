// src/app/login/login.page.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  // Variables que se enlazan al input del usuario
  email = '';
  password = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  // Método principal que se ejecuta cuando se presiona "Ingresar"
  async login() {
    try {
      const user = await this.supabase.login(this.email, this.password);
      this.supabase.setUsuario(user);
      console.log('Usuario logueado:', user);
      await this.router.navigateByUrl('/home');
    } catch (error: any) {
      const alerta = await this.alertCtrl.create({
        header: 'Error',
        message: error.message,
        buttons: ['OK']
      });
      await alerta.present();
    }
  }

  // Autocompleta los campos (sin iniciar sesión directamente)
  completarCampos(correo: string, clave: string) {
    this.email = correo;
    this.password = clave;
  }
}

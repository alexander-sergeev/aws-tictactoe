import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginCallbackComponent } from './login-callback/login-callback.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login/callback', component: LoginCallbackComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

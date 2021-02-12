import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isAuthenticated$: Observable<Boolean>;

  constructor(private auth: AuthService) {
    this.isAuthenticated$ = auth.isAuthenticated$;
   }

  ngOnInit(): void {
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }

}

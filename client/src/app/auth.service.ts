import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';
import { authConfig } from './auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly oauthDiscoveryUrl = environment.auth.oauthDiscoveryUrl;

  constructor(private oauthService: OAuthService, private router: Router) { 
    this.oauthService.configure(authConfig);
  }

  async login() {
    await this.oauthService.loadDiscoveryDocument(this.oauthDiscoveryUrl);
    this.oauthService.initCodeFlow();
  }

  async proceedAuth() {
    await this.oauthService.loadDiscoveryDocument(this.oauthDiscoveryUrl);
    this.oauthService.tryLoginCodeFlow({
      onTokenReceived: () => {
        this.router.navigate(['/']);
      },
    });
  }
}

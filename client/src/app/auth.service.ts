import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { authConfig } from './auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly oauthDiscoveryUrl = environment.auth.oauthDiscoveryUrl;

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private oauthEventsSubscription: Subscription;

  constructor(private oauth: OAuthService, private router: Router) { 
    this.oauth.configure(authConfig);
    this.oauthEventsSubscription = this.oauth.events
      .subscribe(this.onOauthServiceEvent);
  }

  ngOnDestroy() {
    this.oauthEventsSubscription.unsubscribe();
  }

  onOauthServiceEvent = (event: OAuthEvent) => {
    this.isAuthenticatedSubject$.next(this.oauth.hasValidAccessToken());
  }

  async login() {
    await this.oauth.loadDiscoveryDocument(this.oauthDiscoveryUrl);
    this.oauth.initCodeFlow();
  }

  async proceedAuth() {
    await this.oauth.loadDiscoveryDocument(this.oauthDiscoveryUrl);
    await this.oauth.tryLoginCodeFlow();
    this.router.navigate(['/']);
  }

  async logout() {
    this.oauth.logOut();
  }
}

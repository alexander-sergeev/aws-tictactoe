import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.auth.issuer,
  clientId: environment.auth.clientId,
  responseType: 'code',
  redirectUri: window.location.origin + '/login/callback',
  scope: 'openid',
  // Next two options is to support AWS Cognito
  strictDiscoveryDocumentValidation: false,
  skipIssuerCheck: true,
};

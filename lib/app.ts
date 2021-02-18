import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GatewayStack } from './gateway-stack';
import { FrontendStack } from './frontend-stack';
import { AuthStack } from './auth-stack';
import { BackendStack } from './backend-stack';

const app = new cdk.App();

const gateway = new GatewayStack(app, 'GatewayStack');
const frontend = new FrontendStack(app, 'FrontendStack', {
  httpApiId: gateway.httpApi.httpApiId,
  wsId: gateway.wsApi.ref,
});
const auth = new AuthStack(app, 'AuthStack', {
  authDomainPrefix: app.node.tryGetContext('authDomainPrefix'),
  cloudfrontDomain: frontend.cloudfrontDomain,
});
const backend = new BackendStack(app, 'BackendStack', {
  httpApiId: gateway.httpApi.httpApiId,
  httpApiEndpoint: gateway.httpApi.apiEndpoint,
  userPoolProviderUrl: auth.userPool.userPoolProviderUrl,
  userPoolClientId: auth.userPoolClient.userPoolClientId,
});

backend.addDependency(gateway);
frontend.addDependency(gateway);
auth.addDependency(frontend);

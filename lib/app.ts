import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GatewayStack } from './gateway-stack';
import { FrontendStack } from './frontend-stack';
import { BackendStack } from './backend-stack';

const app = new cdk.App();

const gateway = new GatewayStack(app, 'GatewayStack');
const frontend = new FrontendStack(app, 'FrontendStack', {
  httpApiId: gateway.httpApi.httpApiId,
});
const backend = new BackendStack(app, 'BackendStack', {
  authDomainPrefix: app.node.tryGetContext('authDomainPrefix'),
  cloudfrontDomain: frontend.cloudfrontDomain,
  httpApiId: gateway.httpApi.httpApiId,
  httpApiEndpoint: gateway.httpApi.apiEndpoint,
});

backend.addDependency(gateway);
backend.addDependency(frontend);
frontend.addDependency(gateway);

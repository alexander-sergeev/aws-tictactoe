import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GatewayStack } from './gateway-stack';
import { FrontendStack } from './frontend-stack';
import { BackendStack } from './backend-stack';

const app = new cdk.App();

const gateway = new GatewayStack(app, 'GatewayStack');
const backend = new BackendStack(app, 'BackendStack', {
  authDomainPrefix: app.node.tryGetContext('authDomainPrefix'),
  cloudfrontUrl: app.node.tryGetContext('cloudfrontUrl'),
  httpApiId: gateway.httpApi.httpApiId,
  httpApiEndpoint: gateway.httpApi.apiEndpoint,
});
const frontend = new FrontendStack(app, 'FrontendStack', {
  httpApiId: gateway.httpApi.httpApiId,
});

backend.addDependency(gateway);
frontend.addDependency(gateway);

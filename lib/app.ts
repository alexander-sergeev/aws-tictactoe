import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontendStack } from './frontend-stack';
import { BackendStack } from './backend-stack';

const app = new cdk.App();

const backend = new BackendStack(app, 'BackendStack', {
  authDomainPrefix: app.node.tryGetContext('authDomainPrefix'),
  cloudfrontUrl: app.node.tryGetContext('cloudfrontUrl'),
});
const frontend = new FrontendStack(app, 'FrontendStack', {
  httpApiId: backend.httpApi.httpApiId,
});

frontend.addDependency(backend);

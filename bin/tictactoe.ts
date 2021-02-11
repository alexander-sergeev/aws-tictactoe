#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontendStack } from '../lib/frontend-stack';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();

const backend = new BackendStack(app, 'BackendStack', {
  authDomainPrefix: app.node.tryGetContext('authDomainPrefix'),
  cloudfrontUrl: app.node.tryGetContext('cloudfrontUrl'),
});
const frontend = new FrontendStack(app, 'FrontendStack', {
  httpApiId: backend.httpApi.httpApiId,
});

frontend.addDependency(backend);

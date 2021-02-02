#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TictactoeStack } from '../lib/tictactoe-stack';

const app = new cdk.App();
new TictactoeStack(app, 'TictactoeStack');

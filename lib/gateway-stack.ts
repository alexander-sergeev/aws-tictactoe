import * as cdk from '@aws-cdk/core';
import * as gateway from '@aws-cdk/aws-apigatewayv2';

export class GatewayStack extends cdk.Stack {
  readonly httpApi: gateway.HttpApi;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new gateway.HttpApi(this, 'Api');

    this.httpApi = api;
  }
}

import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gateway from '@aws-cdk/aws-apigatewayv2';
import * as apiIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';

export class BackendStack extends cdk.Stack {
  readonly httpApi: gateway.HttpApi;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const code: lambda.Code = lambda.Code.fromAsset('dist');

    const helloWorldLambda: lambda.Function = new lambda.Function(this, 'HelloWorldHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code,
      handler: 'index.handler',
    });

    const api = new gateway.HttpApi(this, 'Api');

    const helloWorldLambdaIntegration = new apiIntegrations.LambdaProxyIntegration({
      handler: helloWorldLambda,
    });

    api.addRoutes({
      path: '/api/hello',
      methods: [ gateway.HttpMethod.GET ],
      integration: helloWorldLambdaIntegration,
    });

    this.httpApi = api;
  }
}

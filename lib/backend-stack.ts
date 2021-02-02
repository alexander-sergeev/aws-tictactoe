import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gateway from '@aws-cdk/aws-apigateway';

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const code: lambda.Code = lambda.Code.fromAsset('dist');

    const helloWorldLambda: lambda.Function = new lambda.Function(this, 'HelloWorldHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code,
      handler: 'index.handler',
    });

    const helloWorldGateway: gateway.LambdaRestApi = new gateway.LambdaRestApi(this, 'HelloWorldEndpoint', {
      handler: helloWorldLambda,
    });
  }
}

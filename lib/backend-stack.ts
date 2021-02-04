import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gateway from '@aws-cdk/aws-apigatewayv2';
import * as apiIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as cognito from '@aws-cdk/aws-cognito';

export interface BackendStackProps extends cdk.StackProps {
  authDomainPrefix: string;
  cloudfrontUrl: string;
}

export class BackendStack extends cdk.Stack {
  readonly httpApi: gateway.HttpApi;

  constructor(scope: cdk.Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const authAutoConfirmUserLambda: lambda.Function = new lambda.Function(this, 'AuthAutoConfirmUserLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist/auth-auto-confirm-user'),
      handler: 'index.handler',
    });

    const userPool: cognito.UserPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      passwordPolicy: {
        requireSymbols: false,
      },
      lambdaTriggers: {
        preSignUp: authAutoConfirmUserLambda,
      },
    });

    userPool.addDomain('AuthDomain', {
      cognitoDomain: {
        domainPrefix: props.authDomainPrefix,
      },
    });

    const authClient: cognito.UserPoolClient = new cognito.UserPoolClient(this, 'AuthClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID],
        callbackUrls: [props.cloudfrontUrl],
        logoutUrls: [props.cloudfrontUrl],
      }
    });

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

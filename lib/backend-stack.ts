import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gateway from '@aws-cdk/aws-apigatewayv2';
import * as apiIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as cognito from '@aws-cdk/aws-cognito';

export interface BackendStackProps extends cdk.StackProps {
  authDomainPrefix: string;
  cloudfrontUrl: string;
}

interface addRouteProps {
  id: string;
  api: gateway.HttpApi;
  lambda: lambda.IFunction;
  method?: gateway.HttpMethod;
  path: string;
  authorizer?: gateway.CfnAuthorizer;
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

    const authDomain = userPool.addDomain('AuthDomain', {
      cognitoDomain: {
        domainPrefix: props.authDomainPrefix,
      },
    });

    const authCallbackUrl = props.cloudfrontUrl + '/login/callback';

    const authClient: cognito.UserPoolClient = new cognito.UserPoolClient(this, 'AuthClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID],
        callbackUrls: [authCallbackUrl],
        logoutUrls: [props.cloudfrontUrl],
      }
    });

    const api = new gateway.HttpApi(this, 'Api');

    const authorizer = new gateway.CfnAuthorizer(this, 'ApiAuthorizer', {
      name: 'authorizer',
      apiId: api.httpApiId,
      authorizerType: 'JWT',
      jwtConfiguration: {
        audience: [authClient.userPoolClientId],
        issuer: userPool.userPoolProviderUrl,
      },
      identitySource: ['$request.header.Authorization'],
    });

    this.httpApi = api;
  }

  private addRoute(props: addRouteProps) {
    const integration = new apiIntegrations.LambdaProxyIntegration({
      handler: props.lambda,
    });
    const routeProps: gateway.HttpRouteProps = {
      httpApi: props.api,
      routeKey: gateway.HttpRouteKey.with(props.path, props.method),
      integration: integration,
    };
    const route = new gateway.HttpRoute(this, props.id, routeProps);
    if (props.authorizer != null) {
      const routeCfn = route.node.defaultChild as gateway.CfnRoute;
      routeCfn.authorizationType = props.authorizer.authorizerType;
      routeCfn.authorizerId = props.authorizer.ref;
    }
  }
  
}

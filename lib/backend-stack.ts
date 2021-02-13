import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gateway from '@aws-cdk/aws-apigatewayv2';
import * as apiIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';

export interface BackendStackProps extends cdk.StackProps {
  httpApiId: string;
  httpApiEndpoint: string;
  userPoolProviderUrl: string;
  userPoolClientId: string;
}

interface addRouteProps {
  id: string;
  api: gateway.IHttpApi;
  lambda: lambda.IFunction;
  method?: gateway.HttpMethod;
  path: string;
  authorizer?: gateway.CfnAuthorizer;
}

export class BackendStack extends cdk.Stack {
  
  constructor(scope: cdk.Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const api = gateway.HttpApi.fromHttpApiAttributes(this, 'Api', {
      httpApiId: props.httpApiId,
      apiEndpoint: props.httpApiEndpoint,
    });

    const authorizer = new gateway.CfnAuthorizer(this, 'ApiAuthorizer', {
      name: 'authorizer',
      apiId: api.httpApiId,
      authorizerType: 'JWT',
      jwtConfiguration: {
        audience: [props.userPoolClientId],
        issuer: props.userPoolProviderUrl,
      },
      identitySource: ['$request.header.Authorization'],
    });
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

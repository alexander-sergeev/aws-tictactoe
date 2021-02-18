import * as cdk from '@aws-cdk/core';
import * as gateway from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

export class GatewayStack extends cdk.Stack {
  readonly httpApi: gateway.HttpApi;
  readonly wsApi: gateway.CfnApi;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const httpApi = new gateway.HttpApi(this, 'Api');

    const wsApi = new gateway.CfnApi(this, 'WS', {
      name: 'WS',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.route',
    });

    const wsConnectionsTable = new ddb.Table(this, `WsConnectionsTable`, {
      tableName: 'wsConnections',
      partitionKey: {
        name: 'connectionId',
        type: ddb.AttributeType.STRING,
      },
    });

    const wsConnectionsTableLambdaPolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:DescribeTable",
        "dynamodb:ConditionCheckItem"
      ],
      resources: [wsConnectionsTable.tableArn]
    });

    const wsConnectionsTableLambdaRole = new iam.Role(this, 'WsConnectionsTableLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    wsConnectionsTableLambdaRole.addToPolicy(wsConnectionsTableLambdaPolicy);

    const wsOnConnectLambda: lambda.Function = new lambda.Function(this, 'WsOnConnectLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist/ws-on-connect'),
      handler: 'index.handler',
      role: wsConnectionsTableLambdaRole,
      environment: {
        TABLE_NAME: wsConnectionsTable.tableName,
      },
    });
    const wsOnDisconnectLambda: lambda.Function = new lambda.Function(this, 'WsOnDisconnectLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist/ws-on-disconnect'),
      handler: 'index.handler',
      role: wsConnectionsTableLambdaRole,
      environment: {
        TABLE_NAME: wsConnectionsTable.tableName,
      },
    });

    const wsIntPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [
        wsOnConnectLambda.functionArn,
        wsOnDisconnectLambda.functionArn,
      ],
      actions: ['lambda:InvokeFunction'],
    });

    const wsIntRole = new iam.Role(this, 'WsIamRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    wsIntRole.addToPolicy(wsIntPolicy);

    const connectInt = new gateway.CfnIntegration(this, 'WsConnectRouteIntegration', {
      apiId: wsApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${wsOnConnectLambda.functionArn}/invocations`,
      credentialsArn: wsIntRole.roleArn,
    });
    const disconnectInt = new gateway.CfnIntegration(this, 'WsDisconnectRouteIntegration', {
      apiId: wsApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${wsOnDisconnectLambda.functionArn}/invocations`,
      credentialsArn: wsIntRole.roleArn,
    });
    const connectRoute = new gateway.CfnRoute(this, 'WsConnectRoute', {
      apiId: wsApi.ref,
      routeKey: '$connect',
      authorizationType: 'NONE',
      target: 'integrations/' + connectInt.ref,
    });
    const disconnectRoute = new gateway.CfnRoute(this, 'WsDisconnectRoute', {
      apiId: wsApi.ref,
      routeKey: '$disconnect',
      authorizationType: 'NONE',
      target: 'integrations/' + disconnectInt.ref,
    });

    const wsDeployment = new gateway.CfnDeployment(this, 'Deployment', {
      apiId: wsApi.ref,
    });

    const wsStage = new gateway.CfnStage(this, 'WsStage', {
      apiId: wsApi.ref,
      autoDeploy: true,
      deploymentId: wsDeployment.ref,
      stageName: 'ws',
    });

    wsDeployment.node.addDependency(connectRoute, disconnectRoute);

    this.wsApi = wsApi;
    this.httpApi = httpApi;
  }
}

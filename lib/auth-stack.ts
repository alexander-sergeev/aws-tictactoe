import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';

export interface AuthStackProps extends cdk.StackProps {
  authDomainPrefix: string;
  cloudfrontDomain: string;
}

export class AuthStack extends cdk.Stack {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  
  constructor(scope: cdk.Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const authAutoConfirmUserLambda = new lambda.Function(this, 'AuthAutoConfirmUserLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist/auth-auto-confirm-user'),
      handler: 'index.handler',
    });

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      passwordPolicy: {
        requireSymbols: false,
      },
      lambdaTriggers: {
        preSignUp: authAutoConfirmUserLambda,
      },
    });

    const domain = userPool.addDomain('AuthDomain', {
      cognitoDomain: {
        domainPrefix: props.authDomainPrefix,
      },
    });

    const callbackUrl = `https://${props.cloudfrontDomain}/login/callback`;

    const userPoolClient = new cognito.UserPoolClient(this, 'AuthClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID],
        callbackUrls: [callbackUrl],
        logoutUrls: [`https://${props.cloudfrontDomain}`],
      }
    });
    
    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
  }
}

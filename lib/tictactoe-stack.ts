import * as cdk from '@aws-cdk/core';
import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';

export class TictactoeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'TictactoeBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity = new OriginAccessIdentity(this, 'OAI');

    bucket.grantRead(originAccessIdentity);

    const distribution = new CloudFrontWebDistribution(this, 'Distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ]
    });

    new s3deploy.BucketDeployment(this, 'Deploy', {
      sources: [ s3deploy.Source.asset('./client') ],
      destinationBucket: bucket,
      distribution,
    });

    const helloWorldLambda = new lambda.Function(this, 'HelloWorldHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('src'),
      handler: 'index.handler',
    });
  }
}

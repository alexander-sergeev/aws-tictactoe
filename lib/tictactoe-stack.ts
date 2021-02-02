import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gateway from '@aws-cdk/aws-apigateway';

export class TictactoeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket: s3.Bucket = new s3.Bucket(this, 'TictactoeBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity: cloudfront.OriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');

    bucket.grantRead(originAccessIdentity);

    const s3OriginSource: cloudfront.S3OriginConfig = {
      s3BucketSource: bucket,
      originAccessIdentity,
    };

    const behaviors: cloudfront.Behavior[] = [{ isDefaultBehavior: true }];

    const originConfigs: cloudfront.SourceConfiguration[] = [{ s3OriginSource, behaviors }];

    const distribution: cloudfront.CloudFrontWebDistribution = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
      originConfigs
    });

    new s3deploy.BucketDeployment(this, 'Deploy', {
      sources: [s3deploy.Source.asset('./client')],
      destinationBucket: bucket,
      distribution,
    });

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

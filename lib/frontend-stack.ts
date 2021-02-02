import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';

export class FrontendStack extends cdk.Stack {
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
  }
}

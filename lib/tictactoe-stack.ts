import * as cdk from '@aws-cdk/core';
import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';

export class TictactoeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'TictactoeBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    new s3deploy.BucketDeployment(this, 'Deploy', {
      sources: [ s3deploy.Source.asset('./client') ],
      destinationBucket: bucket
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
  }
}

import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';

export interface FrontendStackProps extends cdk.StackProps {
  httpApiId: string
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: FrontendStackProps) {
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

    const s3Behavior: cloudfront.Behavior[] = [{ isDefaultBehavior: true }];

    const backendOriginSource: cloudfront.CustomOriginConfig = {
      domainName: `${props.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`,
    };

    const backendBehavior: cloudfront.Behavior[] = [
      { pathPattern: '/api/*' }, 
      { pathPattern: '/login' },
    ];

    const originConfigs: cloudfront.SourceConfiguration[] = [
      { s3OriginSource, behaviors: s3Behavior },
      { customOriginSource: backendOriginSource, behaviors: backendBehavior },
    ];

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

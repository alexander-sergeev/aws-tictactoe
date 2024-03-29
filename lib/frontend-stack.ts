import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cfOrigins from '@aws-cdk/aws-cloudfront-origins';

export interface FrontendStackProps extends cdk.StackProps {
  httpApiId: string;
  wsId: string;
}

export class FrontendStack extends cdk.Stack {
  readonly cloudfrontDomain: string;

  constructor(scope: cdk.Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const bucket: s3.Bucket = new s3.Bucket(this, 'TictactoeBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const bucketOAI: cloudfront.OriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');

    bucket.grantRead(bucketOAI);

    const bucketOriginProps: cfOrigins.S3OriginProps = {
      originAccessIdentity: bucketOAI
    };

    const defaultBehavior: cloudfront.BehaviorOptions = {
      origin: new cfOrigins.S3Origin(bucket, bucketOriginProps),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    };

    const backendCachePolicy = new cloudfront.CachePolicy(this, 'BackendCachePolicy', {
      defaultTtl: cdk.Duration.seconds(0),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization'),
    });

    const backendBehavior: cloudfront.BehaviorOptions = {
      origin: new cfOrigins.HttpOrigin(`${props.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`),
      cachePolicy: backendCachePolicy,
    };

    const wsOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'WebSocketORP', {
      originRequestPolicyName: 'WebSocketORP',
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
        'Sec-WebSocket-Key',
        'Sec-WebSocket-Version',
        'Sec-WebSocket-Protocol',
        'Sec-WebSocket-Accept',
      ),
    });

    const wsBehavior: cloudfront.BehaviorOptions = {
      origin: new cfOrigins.HttpOrigin(`${props.wsId}.execute-api.${this.region}.${this.urlSuffix}`),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
      originRequestPolicy: wsOriginRequestPolicy,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
    };

    const errorResponses: cloudfront.ErrorResponse[] = [{
      httpStatus: 404,
      responsePagePath: '/index.html',
      responseHttpStatus: 200,
    }];

    const distributionConfig: cloudfront.DistributionProps = {
      defaultBehavior,
      additionalBehaviors: {
        '/api/*': backendBehavior,
        '/ws/*': wsBehavior,
      },
      defaultRootObject: 'index.html',
      errorResponses,
    };

    const distribution = new cloudfront.Distribution(this, 'Distribution', distributionConfig);

    this.cloudfrontDomain = distribution.distributionDomainName;

    new s3deploy.BucketDeployment(this, 'Deploy', {
      sources: [s3deploy.Source.asset('./client/dist/client')],
      destinationBucket: bucket,
      distribution,
    });
  }
}

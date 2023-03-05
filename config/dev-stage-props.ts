import { RemovalPolicy } from 'aws-cdk-lib';
import { TableClass } from 'aws-cdk-lib/aws-dynamodb';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { PipelineStackProps } from '../lib/pipeline-stack';

export const devProps: PipelineStackProps = {
  trustedAccount: '',
  stage: 'dev',
  lambdaFunctionConfigs: {
    memorySize: 128,
    ephemeralStorageSize: 512,
    logRetention: RetentionDays.ONE_DAY,
  },
  apiGatewayConfigs: {
    domainConfigs: {
      zoneName: 'foo.com',
      hostedZoneId: '123456790ABCDE',
      exactDomainName: 'api.foo.com',
    },
    corsPreflight: {
      allowOrigins: ['*'],
      allowMethods: [
        CorsHttpMethod.GET,
        CorsHttpMethod.PUT,
        CorsHttpMethod.DELETE,
        CorsHttpMethod.OPTIONS,
      ],
      allowHeaders: ['Content-Type'],
    },
  },
  databaseConfigs: {
    tableName: 'notes',
    tableClass: TableClass.STANDARD,
    writeCapacity: 5,
    readCapacity: 5,
    replicationRegions: [],
    removalPolicy: RemovalPolicy.DESTROY,
  },
  env: {
    account: '',
    region: 'ap-southeast-1',
  },
};

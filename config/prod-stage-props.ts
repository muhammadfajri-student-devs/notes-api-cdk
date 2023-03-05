import { RemovalPolicy } from 'aws-cdk-lib';
import { Period } from 'aws-cdk-lib/aws-apigateway';
import { TableClass } from 'aws-cdk-lib/aws-dynamodb';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { PipelineStackProps } from '../lib/pipeline-stack';

export const prodProps: PipelineStackProps = {
  trustedAccount: '',
  stage: 'production',
  lambdaFunctionConfigs: {
    memorySize: 128,
    ephemeralStorageSize: 512,
    logRetention: RetentionDays.ONE_WEEK,
  },
  apiGatewayConfigs: {
    defaultCorsPreflightOptions: {
      allowOrigins: ['foo.com', 'api.foo.com'],
      allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE'],
      allowHeaders: ['Content-Type'],
    },
    enableRateLimitApi: true,
    apiRequestLimit: 3000,
    apiRequestLimitPeriod: Period.WEEK,
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

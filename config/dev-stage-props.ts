import { RemovalPolicy } from 'aws-cdk-lib';
import { TableClass } from 'aws-cdk-lib/aws-dynamodb';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
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
  },
  databaseConfigs: {
    tableName: 'notes',
    tableClass: TableClass.STANDARD,
    writeCapacity: 5,
    readCapacity: 5,
    removalPolicy: RemovalPolicy.DESTROY,
  },
  env: {
    account: '',
    region: 'ap-southeast-1',
  },
};

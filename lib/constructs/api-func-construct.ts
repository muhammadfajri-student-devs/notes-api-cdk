import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Size } from 'aws-cdk-lib';
import { IRole } from 'aws-cdk-lib/aws-iam';

export class ApiLambdaProps {
  /**
   * Lambda execution role.
   *
   * This role will grant lambda function to get access to the database DynamoDB and write logs to CloudWatch Logs.
   */
  role: IRole;

  /**
   * The amount of memory, in MB, that is allocated to your Lambda function.
   *
   * @default 128
   */
  memorySize?: number;

  /**
   * The size of the function’s /tmp directory in MiB.
   *
   * @default 512
   */
  ephemeralStorageSize?: number;

  /**
   * Key-value pairs that Lambda caches and makes available for your Lambda functions. Use environment variables to apply configuration changes, such as test and production environment configurations, without changing your Lambda function source code.
   */
  environment?: { [key: string]: string };

  /**
   * The number of days log events are kept in CloudWatch Logs.
   *
   * @default RetentionDays.INFINITE
   */
  logRetention?: RetentionDays;
}

export class ApiLambda extends Construct {
  public readonly lambdaFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: ApiLambdaProps) {
    super(scope, id);

    const {
      role,
      memorySize,
      ephemeralStorageSize,
      environment,
      logRetention,
    } = props;

    this.lambdaFunction = new NodejsFunction(this, 'ApiLambdaFunction', {
      functionName: 'notes-api-function',
      description: 'lambda function for notes API',
      ephemeralStorageSize: Size.mebibytes(ephemeralStorageSize!),
      environment,
      memorySize,
      role,
      logRetention,
    });
  }
}

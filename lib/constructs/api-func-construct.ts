import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Size } from 'aws-cdk-lib';

export class ApiLambdaProps {
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

    const { memorySize, ephemeralStorageSize, logRetention } = props;

    this.lambdaFunction = new NodejsFunction(this, 'ApiLambdaFunction', {
      functionName: 'notes-api-function',
      description: 'lambda function for notes API',
      ephemeralStorageSize: Size.mebibytes(ephemeralStorageSize!),
      memorySize,
      logRetention,
    });
  }
}

import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiLambda, ApiLambdaProps } from './constructs/api-func-construct';
import { DynamoTable, DynamoTableProps } from './constructs/dynamodb-construct';

export interface NotesApiCdkStackProps extends cdk.StackProps {
  lambdaFunctionConfigs: Omit<ApiLambdaProps, 'role'>;

  databaseConfigs: DynamoTableProps;
}

export class NotesApiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NotesApiCdkStackProps) {
    super(scope, id, props);

    const { lambdaFunctionConfigs, databaseConfigs } = props;

    // * Define Database
    const dynamodb = new DynamoTable(this, 'DynamoDB', databaseConfigs);

    // * Create policy role for lambda function
    const dbPolicy = new iam.PolicyStatement({
      resources: [`arn:aws:dynamodb:${this.region}:${this.account}:table/*`],
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:DeleteItem',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:Scan',
        'dynamodb:UpdateItem',
      ],
    });

    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      roleName: 'lambda-notes-api-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AWSLambdaBasicExecutionRole'
        ),
      ],
    });
    lambdaRole.addToPolicy(dbPolicy);

    // * Define lambda function for notes API
    const apiFunc = new ApiLambda(this, 'LambdaFunction', {
      role: lambdaRole,
      ...lambdaFunctionConfigs,
    });
  }
}

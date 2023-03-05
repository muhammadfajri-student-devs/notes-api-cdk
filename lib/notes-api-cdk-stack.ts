import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiLambda, ApiLambdaProps } from './constructs/api-func-construct';
import { DynamoTable, DynamoTableProps } from './constructs/dynamodb-construct';
import {
  ApiGateway,
  ApiGatewayProps,
} from './constructs/api-gateway-construct';

export interface NotesApiCdkStackProps extends cdk.StackProps {
  /**
   * Configuration for Lambda Function and Core Application
   */
  lambdaFunctionConfigs: Omit<ApiLambdaProps, 'role'>;

  /**
   * Configuration for API Gateway
   */
  apiGatewayConfigs: Omit<ApiGatewayProps, 'handler' | 'domainName'>;

  /**
   * Configuration for DynamoDB Database
   */
  databaseConfigs: DynamoTableProps;
}

export class NotesApiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NotesApiCdkStackProps) {
    super(scope, id, props);

    const { lambdaFunctionConfigs, apiGatewayConfigs, databaseConfigs } = props;

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
    const lambda = new ApiLambda(this, 'LambdaFunction', {
      ...lambdaFunctionConfigs,
      role: lambdaRole,
      environment: {
        DYNAMODB_TABLE: databaseConfigs.tableName,
      },
    });

    // * Define API Gateway for Lambda Function
    const apiGw = new ApiGateway(this, 'ApiGateway', {
      ...apiGatewayConfigs,
      handler: lambda.lambdaFunction,
    });

    // set path and method that allowed
    const notes = apiGw.lambdaRestApi.root.addResource('notes');
    notes.addMethod('GET');
    notes.addMethod('PUT');

    const note = notes.addResource('{id}');
    note.addMethod('GET');
    note.addMethod('DELETE');
  }
}

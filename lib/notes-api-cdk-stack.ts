import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as awsApiGateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Network, NetworkProps } from './constructs/network-construct';
import { ApiLambda, ApiLambdaProps } from './constructs/api-func-construct';
import { DynamoTable, DynamoTableProps } from './constructs/dynamodb-construct';
import {
  ApiGateway,
  ApiGatewayProps,
} from './constructs/api-gateway-construct';
import { Construct } from 'constructs';

interface IApiGatewayConfigs
  extends Omit<ApiGatewayProps, 'handler' | 'domainConfigs'> {
  domainConfigs: NetworkProps;
}

export interface NotesApiCdkStackProps extends cdk.StackProps {
  /**
   * Configuration for Lambda Function and Core Application
   */
  lambdaFunctionConfigs: Omit<ApiLambdaProps, 'role'>;

  /**
   * Configuration for API Gateway
   */
  apiGatewayConfigs: IApiGatewayConfigs;

  /**
   * Configuration for DynamoDB Database
   */
  databaseConfigs: DynamoTableProps;
}

export class NotesApiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NotesApiCdkStackProps) {
    super(scope, id, props);

    const { lambdaFunctionConfigs, apiGatewayConfigs, databaseConfigs } = props;

    // * Define Network for import domain from route53 & create ssl certificate
    const network = new Network(this, 'Network', {
      zoneName: apiGatewayConfigs.domainConfigs.zoneName,
      hostedZoneId: apiGatewayConfigs.domainConfigs.hostedZoneId,
      exactDomainName: apiGatewayConfigs.domainConfigs.exactDomainName,
    });

    const customDomainApiGw = new apigatewayv2.DomainName(
      this,
      'DomainApiGateway',
      {
        domainName: apiGatewayConfigs.domainConfigs.exactDomainName,
        certificate: network.certificate,
      }
    );

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

    const logPolicy = new iam.PolicyStatement({
      resources: ['*'],
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
    });

    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      roleName: 'lambda-notes-api-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    lambdaRole.addToPolicy(dbPolicy);
    lambdaRole.addToPolicy(logPolicy);

    // * Define lambda function for notes API
    const lambda = new ApiLambda(this, 'LambdaFunction', {
      ...lambdaFunctionConfigs,
      role: lambdaRole,
      environment: {
        DYNAMODB_TABLE: databaseConfigs.tableName,
      },
    });

    // * Define API Gateway for Lambda Function
    const apiGateway = new ApiGateway(this, 'HttpApiGateway', {
      ...apiGatewayConfigs,
      handler: lambda.lambdaFunction,
      domainConfigs: {
        domainName: customDomainApiGw,
      },
    });

    const notesIntegration = new HttpLambdaIntegration(
      'NotesIntegration',
      lambda.lambdaFunction
    );

    // set path and method that allowed
    apiGateway.httpApi.addRoutes({
      path: '/notes',
      methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.PUT],
      integration: notesIntegration,
    });

    apiGateway.httpApi.addRoutes({
      path: '/notes/{id}',
      methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.DELETE],
      integration: notesIntegration,
    });

    // * Attach API Gateway to Route53
    new route53.ARecord(this, 'ApiGatewayCustomDomain', {
      zone: network.hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGatewayv2DomainProperties(
          customDomainApiGw.regionalDomainName,
          customDomainApiGw.regionalHostedZoneId
        )
      ),
      recordName: apiGatewayConfigs.domainConfigs.exactDomainName,
    });
  }
}

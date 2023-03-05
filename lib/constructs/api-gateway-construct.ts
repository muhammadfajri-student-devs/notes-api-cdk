import * as apigatewav2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayProps {
  /**
   * The default Lambda function that handles all requests from this API.
   */
  handler: IFunction;

  /**
   * Configure a custom domain with the API mapping resource to the HTTP API.
   */
  domainConfigs?: apigatewav2.DomainMappingOptions;

  /**
   * Specifies a CORS configuration for an API.
   *
   * @default disabled
   */
  corsPreflight?: apigatewav2.CorsPreflightOptions;

  /**
   * Specifies whether clients can invoke this HTTP API by using the default execute-api endpoint or custom domain.
   *
   * @default true
   */
  disableExecuteApiEndpoint?: boolean;
}

export class ApiGateway extends Construct {
  public readonly httpApi: apigatewav2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const { handler, domainConfigs, corsPreflight, disableExecuteApiEndpoint } =
      props;

    // * Define API Gateway
    this.httpApi = new apigatewav2.HttpApi(this, 'LambdaApiGateway', {
      apiName: 'notes-api-gateway',
      description: 'API Gateway for Lambda Function Notes API Service',
      corsPreflight,
      defaultDomainMapping: domainConfigs,
      defaultIntegration: new HttpLambdaIntegration(
        'DefaultHttpIntegration',
        handler
      ),
      disableExecuteApiEndpoint,
    });
  }
}

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayProps {
  /**
   * The default Lambda function that handles all requests from this API.
   */
  handler: IFunction;

  /**
   * Configure a custom domain name and map it to this API.
   */
  domainNameConfigs?: apigateway.DomainNameOptions;

  /**
   * Adds a CORS preflight OPTIONS method to this resource and all child resources.
   *
   * @default disabled
   */
  defaultCorsPreflightOptions?: apigateway.CorsOptions;

  /**
   * Weather implement rate limit for API or not.
   *
   * @default false
   */
  enableRateLimitApi?: boolean;

  /**
   * The maximum number of requests that users can make within the specified time period.
   *
   * @default 10000
   */
  apiRequestLimit?: number;

  /**
   * The time period for which the maximum limit of requests applies.
   *
   * @default apigateway.Period.MONTH
   */
  apiRequestLimitPeriod?: apigateway.Period;
}

export class ApiGateway extends Construct {
  public readonly lambdaRestApi: apigateway.LambdaRestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const {
      handler,
      domainNameConfigs,
      defaultCorsPreflightOptions,
      enableRateLimitApi,
      apiRequestLimit,
      apiRequestLimitPeriod,
    } = props;

    // * Define API Gateway
    if (enableRateLimitApi) {
      this.lambdaRestApi = new apigateway.LambdaRestApi(
        this,
        'LambdaApiGateway',
        {
          handler,
          defaultCorsPreflightOptions,
          domainName: domainNameConfigs,
          cloudWatchRole: true,
          deploy: true,
          proxy: false,
          restApiName: 'notes-api-gateway',
        }
      );
    }

    // * Create rate limit for API
    new apigateway.RateLimitedApiKey(this, 'LambdaApiRateLimit', {
      apiKeyName: 'notes-api-gateway-key',
      stages: [this.lambdaRestApi.deploymentStage],
      quota: {
        limit: apiRequestLimit || 10000,
        period: apiRequestLimitPeriod || apigateway.Period.MONTH,
      },
    });
  }
}

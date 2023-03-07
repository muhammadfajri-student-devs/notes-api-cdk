import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

export interface NetworkProps {
  /**
   * ID of this hosted zone, e.g. "ABCDEF123456789".
   */
  hostedZoneId: string;

  /**
   * The name of the domain/zone name, e.g. foo.com.
   */
  zoneName: string;

  /**
   * The exact name of domain for API Gateway.
   */
  exactDomainName: string;
}

export class Network extends Construct {
  /**
   * The Route53 hosted zone for the domain, e.g. "example.com".
   */
  public readonly hostedZone: route53.IHostedZone;

  /**
   * SSL/TLS Certificate from ACM that validated in the same region.
   */
  public readonly certificate: acm.ICertificate;

  /**
   * SSL/TLS Certificate from ACM that validated in us-east-1. Usually used for CloudFront.
   */
  public readonly certificateUsEast: acm.ICertificate;

  constructor(scope: Construct, id: string, props: NetworkProps) {
    super(scope, id);

    const { zoneName, hostedZoneId, exactDomainName } = props;

    // * Import hosted zone from route53
    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        zoneName,
        hostedZoneId,
      }
    );

    // * Define certificate from same region
    this.certificate = new acm.Certificate(this, 'Certificate', {
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
      domainName: zoneName,
      subjectAlternativeNames: [`*.${zoneName}`],
    });

    // * Define certificate from us-east-1
    this.certificateUsEast = new acm.DnsValidatedCertificate(
      this,
      'CertificateUsEast',
      {
        hostedZone: this.hostedZone,
        domainName: zoneName,
        subjectAlternativeNames: [
          `*.${zoneName}`,
          `${exactDomainName}`,
          `*.${exactDomainName}`,
        ],
        region: 'us-east-1', // ACM certificates must be validated in us-east-1
      }
    );
  }
}

import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { DynamoTable, DynamoTableProps } from './constructs/dynamodb-construct';

export interface NotesApiCdkStackProps extends cdk.StackProps {
  databaseConfigs: DynamoTableProps;
}

export class NotesApiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NotesApiCdkStackProps) {
    super(scope, id, props);

    const { databaseConfigs } = props;

    // * Define Database
    const dynamodb = new DynamoTable(this, 'DynamoDB', databaseConfigs);
  }
}

import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface DynamoTableProps {
  /**
   * Enforces a particular physical table name.
   */
  tableName: string;

  /**
   * Sort key attribute definition.
   */
  sortKey?: dynamodb.Attribute;

  /**
   * The read capacity for the table.
   *
   * @default 5
   */
  readCapacity?: number;

  /**'
   * The write capacity for the table.
   *
   * @default 5
   */
  writeCapacity?: number;

  /**
   * Specify the table class.
   *
   * @default dynamodb.TableClass.STANDARD
   */
  tableClass?: dynamodb.TableClass;

  /**
   * Regions where replica tables will be created.
   */
  replicationRegions?: string[];

  /**
   * The removal policy to apply to the DynamoDB Table.
   *
   * @default RemovalPolicy.RETAIN
   */
  removalPolicy?: RemovalPolicy;
}

export class DynamoTable extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoTableProps) {
    super(scope, id);

    const {
      tableName,
      sortKey,
      readCapacity,
      writeCapacity,
      tableClass,
      replicationRegions,
      removalPolicy,
    } = props;

    this.table = new dynamodb.Table(this, 'DynamoDBTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      tableName,
      sortKey,
      readCapacity,
      writeCapacity,
      tableClass,
      replicationRegions,
      removalPolicy,
    });
  }
}

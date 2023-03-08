import { APIGatewayProxyEventV2WithRequestContext } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const tableName = process.env.DYNAMODB_TABLE;

export const handler = async (
  event: APIGatewayProxyEventV2WithRequestContext<any>
) => {
  let body;
  let statusCode = 200;
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    switch (event.routeKey) {
      // * Delete notes
      case 'DELETE /notes/{id}':
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters!.id,
            },
          })
        );
        body = `Deleted note ${event.pathParameters!.id}`;
        break;
      // * Details notes
      case 'GET /notes/{id}':
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters!.id,
            },
          })
        );
        body = body.Item;
        break;
      // * Update notes
      case 'PUT /notes/{id}':
        let updateJSON = JSON.parse(event.body!);
        body = await dynamo.send(
          new UpdateCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters!.id,
            },
            ExpressionAttributeNames: {
              '#desc': 'desc', // need this because desc is reserved keyword
            },
            UpdateExpression: 'SET title = :t, #desc = :d, priority = :p',
            ExpressionAttributeValues: {
              ':t': updateJSON.title,
              ':d': updateJSON.desc,
              ':p': updateJSON.priority,
            },
          })
        );
        body = `Update item ${event.pathParameters!.id}`;
        break;
      // * List all notes
      case 'GET /notes':
        body = await dynamo.send(new ScanCommand({ TableName: tableName }));
        body = body.Items;
        break;
      // * Input and store note to dynamodb
      case 'PUT /notes':
        let requestJSON = JSON.parse(event.body!);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: Date.now().toString(16),
              title: requestJSON.title,
              desc: requestJSON.desc,
              priority: requestJSON.priority,
            },
          })
        );
        body = `Put item ${requestJSON.id}`;
        break;
      // * Error handling
      default:
        throw new Error(
          `Unsupported route: "${event.routeKey}". Please visit "/notes" instead.`
        );
    }
  } catch (err: any) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};

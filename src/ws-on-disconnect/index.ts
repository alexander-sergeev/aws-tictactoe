import * as AWS from 'aws-sdk';

declare var process : {
  env: {
    AWS_REGION: string;
    TABLE_NAME: string;
  }
}

const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

const handler = async (event: any) => {
  await ddb.delete({
    TableName: process.env.TABLE_NAME,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  });
  return {
    statusCode: 200
  };
};

export { handler };

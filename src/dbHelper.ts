import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';

const isProduction = () => {
  return process.env.MODE === 'production';
};

// There are 2 tables in DynamoDB:
//     - 'geo-decision-making-alt-dev' table populates when the survey is completed on a local run     
//     - 'geo-decision-making-alt' table populates when the survey on the hosted version of the website is completed
//       because webpack sets the env mode to 'production' (see 'webpack.prod.js' file)
export const kTableName = isProduction() ? 'geo-decision-making-alt' : 'geo-decision-making-alt-dev';
export const kType = 'jsonResult';

const DBInstance = new DynamoDB({
  accessKeyId: 'AKIA5FUYZTBPJZVPRUPV',
  secretAccessKey: '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',
  region: 'us-east-2',
});

type DDBCb<T> = (err: AWSError, data : T) => void | undefined;

export function updateItemAccessTimeByCreateTime(createTime : number, cb: DDBCb<DynamoDB.UpdateItemOutput>) {
  const param = {
    TableName: kTableName,
    Key: {
      'type': { S: kType },
      'createTime': { N: createTime.toString() }
    },
    ExpressionAttributeValues: {
      ':val2': { N: Date.now().toString() }
    },
    UpdateExpression: 'SET lastAccessTime = :val2',
    ReturnValues: 'ALL_NEW'
  };
  DBInstance.updateItem(param, cb);
}

export function updateItemDeleteTimeByCreateTime(createTime : number, cb: DDBCb<DynamoDB.UpdateItemOutput>) {
  const param = {
    TableName: kTableName,
    Key: {
      'type': { S: kType },
      'createTime': { N: createTime.toString() }
    },
    ExpressionAttributeValues: {
      ':val2': { N: Date.now().toString() }
    },
    UpdateExpression: 'SET deleteTime = :val2',
    ReturnValues: 'ALL_NEW'
  };
  DBInstance.updateItem(param, cb);
}

export function putItem(stringVal : string, cb : DDBCb<DynamoDB.PutItemOutput>) {
  const param = {
    TableName: kTableName,
    Item: {
      type: { S: kType },
      createTime: { N : Date.now().toString() },
      lastAccessTime: { N : '-1' },
      deleteTime: { N : '-1' },
      value: { S : stringVal }
    }
  }
  DBInstance.putItem(param, cb);
}

export function query(cb : DDBCb<DynamoDB.QueryOutput>) {
  const param : DynamoDB.Types.QueryInput = {
    ExpressionAttributeNames: {
      '#T': "type",
    },
    ExpressionAttributeValues: {
      ":type": { S : kType },
      ":zeroTime": { N : '0' }
    },
    TableName: kTableName,
    FilterExpression: `deleteTime < :zeroTime`,
    KeyConditionExpression: `#T = :type`,
    Select: 'ALL_ATTRIBUTES'
  };
  DBInstance.query(param, cb);
}

export function batchGetItem(cb : DDBCb<DynamoDB.BatchGetItemOutput>) {
  const param = {
    RequestItems: {
      [kTableName]: {
        Keys: [{
          type: { S: kType }
        }]
      }
    }
  }
  DBInstance.batchGetItem(param, cb);
}
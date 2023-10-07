import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import path = require('path');
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AppsyncDynamodbDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Define a table
    const demoTable = new dynamodb.Table(this, 'DemoTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });
    
    // Define API AppSync
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'demo',
      schema: appsync.SchemaFile.fromAsset(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
      xrayEnabled: true,
    });
    
    // Define the DataSource
    const demoDS = api.addDynamoDbDataSource('demoDataSource', demoTable);
    
    // Resolvers
    demoDS.createResolver('GraphQLApiAllEmployeeDetails', {
      typeName: 'Query',
      fieldName: 'getAllEmployeeDetails',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    
  }
}

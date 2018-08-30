## AWS AppSync

[Authenticating with Auth0](https://medium.com/open-graphql/authenticating-an-aws-appsync-graphql-api-with-auth0-48835691810a)

[Example app with resolvers with relationships & user fields](https://github.com/dabit3/heard)

Special Resolvers

### Create Question

```vtl
#set($data = $ctx.args.input)
#set($data.createdAt = $util.time.nowISO8601())

{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
    "id": $util.dynamodb.toDynamoDBJson($util.autoId()),
  },
  "attributeValues": $util.dynamodb.toMapValuesJson($data),
  "condition": {
    "expression": "attribute_not_exists(#body)",
    "expressionNames": {
      "#body": "body",
    },
  },
}
```

### Create User using autoId() for automatically generating ID

```vtl
{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
    "id": $util.dynamodb.toDynamoDBJson($util.autoId()),
  },
  "attributeValues": $util.dynamodb.toMapValuesJson($ctx.args.input),
  "condition": {
    "expression": "attribute_not_exists(#auth0UserId)",
    "expressionNames": {
      "#auth0UserId": "auth0UserId",
    },
  },
}
```

### Accessing the User identity in a resolver

```vtl
#set($input = $ctx.args.input)
$util.qr($input.put("userId", $ctx.identity.sub))

{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
    "id": $util.dynamodb.toDynamoDBJson($util.autoId()),
  },
  "attributeValues": $util.dynamodb.toMapValuesJson($input),
  "condition": {
    "expression": "attribute_not_exists(#id)",
    "expressionNames": {
      "#id": "id",
    },
  },
}
```

### Configuring the AppSync Client

[AppSync Docs](https://github.com/awslabs/aws-mobile-appsync-sdk-js)

```js
import AWSAppSyncClient from 'aws-appsync'
import AppSyncConfig from './AppSync'
import { ApolloProvider } from 'react-apollo'
import { Rehydrated } from 'aws-appsync-react'

const client = new AWSAppSyncClient({
  url: AppSyncConfig.graphqlEndpoint,
  region: AppSyncConfig.region,
  auth: {
    type: AppSyncConfig.authenticationType,
    apiKey: AppSyncConfig.apiKey,
  }
})

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
)
```
// This file contains the AWS Amplify configuration values from your sandbox deployment
// Generated from amplify-mascle-alaba-sandbox-2814070a21 deployment

const awsExports = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_30fproRll',
      userPoolClientId: '741fv75skur3djbvfkcjbiks31',
      identityPoolId: 'us-east-1:6eab344a-e196-4ba2-abf8-d95474532db0',
      loginWith: {
        email: true
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://c3irv525nzeyblzht3jy6vyvme.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'userPool' as const,
      apiKey: 'da2-otmo623xuzfmta3ppognhq56ty',
      additionalAuthTypes: ['apiKey', 'iam']
    }
  },
  Storage: {
    S3: {
      bucket: 'amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t',
      region: 'us-east-1',
      level: 'protected',
      identityPoolId: 'us-east-1:6eab344a-e196-4ba2-abf8-d95474532db0'
    }
  }
};

export default awsExports; 
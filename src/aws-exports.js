// aws-exports.js
const awsmobile = {
  "aws_project_region": "us-east-1",
  "aws_cognito_identity_pool_id": "us-east-1:6eab344a-e196-4ba2-abf8-d95474532db0",
  "aws_cognito_region": "us-east-1",
  "aws_user_pools_id": "us-east-1_30fproRll",
  "aws_user_pools_web_client_id": "741fv75skur3djbvfkcjbiks31",
  "oauth": {
    "domain": "",
    "scope": [
      "phone",
      "email",
      "openid",
      "profile",
      "aws.cognito.signin.user.admin"
    ],
    "redirectSignIn": "https://example.com",
    "redirectSignOut": "",
    "responseType": "code"
  },
  "federationTarget": "COGNITO_USER_POOLS",
  "aws_cognito_username_attributes": [
    "EMAIL"
  ],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": [
    "EMAIL", 
    "GIVEN_NAME"
  ],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": [],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": [
      "REQUIRES_LOWERCASE",
      "REQUIRES_UPPERCASE",
      "REQUIRES_NUMBERS",
      "REQUIRES_SYMBOLS"
    ]
  },
  "aws_cognito_verification_mechanisms": [
    "EMAIL"
  ],
  "aws_appsync_graphqlEndpoint": "https://c3irv525nzeyblzht3jy6vyvme.appsync-api.us-east-1.amazonaws.com/graphql",
  "aws_appsync_region": "us-east-1",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
  "aws_appsync_apiKey": "da2-otmo623xuzfmta3ppognhq56ty",
  "aws_appsync_additionalAuthenticationTypes": "API_KEY,AWS_IAM",
  "API": {
    "endpoints": [
      {
        "name": "myRestApi",
        "endpoint": "https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev/",
        "region": "us-east-1"
      }
    ]
  }
};

export default awsmobile; 
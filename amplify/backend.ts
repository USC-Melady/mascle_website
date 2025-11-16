import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/postConfirmation/resource';
import { updateUserStatus } from './functions/updateUserStatus/resource';
import { updateUserRoles } from './functions/updateUserRoles/resource';
import { getUsers } from './functions/getUsers/resource';
import { getLabs } from './functions/getLabs/resource';
import { createLab } from './functions/createLab/resource';
import { updateLab } from './functions/updateLab/resource';
import { deleteLab } from './functions/deleteLab/resource';
import { addUserToLab } from './functions/addUserToLab/resource';
import { removeUserFromLab } from './functions/removeUserFromLab/resource';
import { getJobs } from './functions/getJobs/resource';
import { createJob } from './functions/createJob/resource';
import { updateJob } from './functions/updateJob/resource';
import { deleteJob } from './functions/deleteJob/resource';
import { applyToJob } from './functions/applyToJob/resource';
import { createUser } from './functions/createUser/resource';
import { getJobApplications } from './functions/getJobApplications/resource';
import { uploadResume } from './functions/uploadResume/resource';
import { updateUserResume } from './functions/updateUserResume/resource';
import { getResumeUrl } from './functions/getResumeUrl/resource';
import { getUserProfilesForRecommendation } from './functions/getUserProfilesForRecommendation/resource';
import { updateApplicationStatus } from './functions/updateApplicationStatus/resource';
// import { refreshResumeData } from './functions/refreshResumeData/resource';
// import { enhanceApplicationsWithResumeData } from './functions/enhanceApplicationsWithResumeData/resource';
import { Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
  CognitoUserPoolsAuthorizer,
  ApiKey,
  UsagePlan,
  Period
} from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// Create the backend with all resources
export const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  updateUserStatus,
  updateUserRoles,
  getUsers,
  getLabs,
  createLab,
  updateLab,
  deleteLab,
  addUserToLab,
  removeUserFromLab,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  createUser,
  getJobApplications,
  uploadResume,
  updateUserResume,
  getResumeUrl,
  getUserProfilesForRecommendation,
  updateApplicationStatus
  // refreshResumeData,
  // enhanceApplicationsWithResumeData
});

// Create a new API stack
const apiStack = backend.createStack('api-stack');

// Create a new REST API
const myRestApi = new RestApi(apiStack, 'RestApi', {
  restApiName: 'myRestApi',
  deploy: true,
  deployOptions: {
    stageName: 'dev',
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: [...Cors.DEFAULT_HEADERS, 'Cache-Control', 'Authorization', 'x-api-key'],
  },
});

// Create API Key for the recommendation endpoint
const apiKey = new ApiKey(apiStack, 'RecommendationApiKey', {
  apiKeyName: `RecommendationSystemApiKey-${apiStack.stackId.split('/').pop()}`,
  description: 'API Key for accessing student profile data for recommendation system',
});

// Create a usage plan
const usagePlan = new UsagePlan(apiStack, 'RecommendationUsagePlan', {
  name: `RecommendationSystemUsagePlan-${apiStack.stackId.split('/').pop()}`,
  description: 'Usage plan for recommendation system API access',
  throttle: {
    rateLimit: 100,
    burstLimit: 200,
  },
  quota: {
    limit: 10000,
    period: Period.DAY,
  },
});

// Associate the API key with the usage plan
usagePlan.addApiKey(apiKey);

// Associate the usage plan with the API stage
usagePlan.addApiStage({
  stage: myRestApi.deploymentStage,
});

// Create Lambda integrations
const updateUserStatusIntegration = new LambdaIntegration(
  backend.updateUserStatus.resources.lambda
);

const updateUserRolesIntegration = new LambdaIntegration(
  backend.updateUserRoles.resources.lambda
);

const getUsersIntegration = new LambdaIntegration(
  backend.getUsers.resources.lambda
);

const createUserIntegration = new LambdaIntegration(
  backend.createUser.resources.lambda
);

const getLabsIntegration = new LambdaIntegration(
  backend.getLabs.resources.lambda
);

const createLabIntegration = new LambdaIntegration(
  backend.createLab.resources.lambda
);

const updateLabIntegration = new LambdaIntegration(
  backend.updateLab.resources.lambda
);

const deleteLabIntegration = new LambdaIntegration(
  backend.deleteLab.resources.lambda
);

const addUserToLabIntegration = new LambdaIntegration(
  backend.addUserToLab.resources.lambda
);

const removeUserFromLabIntegration = new LambdaIntegration(
  backend.removeUserFromLab.resources.lambda
);

// Job-related Lambda integrations
const getJobsIntegration = new LambdaIntegration(
  backend.getJobs.resources.lambda
);

const createJobIntegration = new LambdaIntegration(
  backend.createJob.resources.lambda
);

const updateJobIntegration = new LambdaIntegration(
  backend.updateJob.resources.lambda
);

const deleteJobIntegration = new LambdaIntegration(
  backend.deleteJob.resources.lambda
);

const applyToJobIntegration = new LambdaIntegration(
  backend.applyToJob.resources.lambda
);

const getJobApplicationsIntegration = new LambdaIntegration(
  backend.getJobApplications.resources.lambda
);

const uploadResumeIntegration = new LambdaIntegration(
  backend.uploadResume.resources.lambda
);

// Create Lambda integration for the new updateUserResume function
const updateUserResumeIntegration = new LambdaIntegration(
  backend.updateUserResume.resources.lambda
);

// Create Lambda integration for the getResumeUrl function
const getResumeUrlIntegration = new LambdaIntegration(
  backend.getResumeUrl.resources.lambda
);

// Create Lambda integration for getUserProfilesForRecommendation function
const getUserProfilesForRecommendationIntegration = new LambdaIntegration(
  backend.getUserProfilesForRecommendation.resources.lambda
);

// Create Lambda integration for updateApplicationStatus function
const updateApplicationStatusIntegration = new LambdaIntegration(
  backend.updateApplicationStatus.resources.lambda
);

// Create Lambda integration for refreshResumeData function (temporarily disabled)
// const refreshResumeDataIntegration = new LambdaIntegration(
//   backend.refreshResumeData.resources.lambda
// );

// Create a Cognito User Pools authorizer
const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(apiStack, 'CognitoAuthorizer', {
  cognitoUserPools: [backend.auth.resources.userPool]
});

// Add routes with admin group authorization
const updateUserStatusPath = myRestApi.root.addResource('updateUserStatus');
updateUserStatusPath.addMethod('POST', updateUserStatusIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

const updateUserRolesPath = myRestApi.root.addResource('updateUserRoles');
updateUserRolesPath.addMethod('POST', updateUserRolesIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add the users endpoint
const usersPath = myRestApi.root.addResource('users');
usersPath.addMethod('GET', getUsersIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add the createUser endpoint
const createUserPath = myRestApi.root.addResource('createUser');
createUserPath.addMethod('POST', createUserIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add the labs endpoint
const labsPath = myRestApi.root.addResource('labs');
labsPath.addMethod('GET', getLabsIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add lab management routes
const createLabPath = labsPath.addResource('create');
createLabPath.addMethod('POST', createLabIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

const updateLabPath = labsPath.addResource('update');
updateLabPath.addMethod('POST', updateLabIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

const deleteLabPath = labsPath.addResource('delete');
deleteLabPath.addMethod('DELETE', deleteLabIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

const addUserToLabPath = myRestApi.root.addResource('addUserToLab');
addUserToLabPath.addMethod('POST', addUserToLabIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

const removeUserFromLabPath = myRestApi.root.addResource('removeUserFromLab');
removeUserFromLabPath.addMethod('POST', removeUserFromLabIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add the job management endpoints
const jobsPath = myRestApi.root.addResource('jobs');
jobsPath.addMethod('GET', getJobsIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});
jobsPath.addMethod('POST', createJobIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add job-specific endpoints
const jobIdPath = jobsPath.addResource('{jobId}');
jobIdPath.addMethod('PUT', updateJobIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});
jobIdPath.addMethod('DELETE', deleteJobIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add job application endpoint
const applyPath = jobIdPath.addResource('apply');
applyPath.addMethod('POST', applyToJobIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add job applications listing endpoint
const applicationsPath = jobIdPath.addResource('applications');
applicationsPath.addMethod('GET', getJobApplicationsIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add the applications endpoint
const rootApplicationsPath = myRestApi.root.addResource('applications');
rootApplicationsPath.addMethod('POST', applyToJobIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add GET method for applications endpoint to list all applications
rootApplicationsPath.addMethod('GET', getJobApplicationsIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Enable CORS at the API level using the CORS configuration during API creation, bypassing the need for OPTIONS method

// Add a public jobs endpoint that doesn't require authentication
const publicJobsPath = myRestApi.root.addResource('public-jobs');
publicJobsPath.addMethod('GET', getJobsIntegration, {
  authorizationType: AuthorizationType.NONE
});

// Add a public job details endpoint
const publicJobDetailPath = publicJobsPath.addResource('{jobId}');
publicJobDetailPath.addMethod('GET', getJobsIntegration, {
  authorizationType: AuthorizationType.NONE
});

// Add the uploadResume endpoint
const uploadResumePath = myRestApi.root.addResource('uploadResume');
uploadResumePath.addMethod('POST', uploadResumeIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

// Add the uploadResume/confirm endpoint for confirming uploads
const confirmPath = uploadResumePath.addResource('confirm');
confirmPath.addMethod('POST', uploadResumeIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

// Add the updateUserResume API endpoint
const updateUserResumePath = myRestApi.root.addResource('updateUserResume');
updateUserResumePath.addMethod('POST', updateUserResumeIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer
});

// Add the getResumeUrl API endpoint
const getResumeUrlPath = myRestApi.root.addResource('getResumeUrl');
getResumeUrlPath.addMethod('GET', getResumeUrlIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});
getResumeUrlPath.addMethod('POST', getResumeUrlIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

// Add the profiles/recommendation API endpoint for the recommendation system
const profilesPath = myRestApi.root.addResource('profiles');
const recommendationPath = profilesPath.addResource('recommendation');

// Add GET method with API Key authorization
recommendationPath.addMethod('GET', getUserProfilesForRecommendationIntegration, {
  authorizationType: AuthorizationType.NONE,
  apiKeyRequired: true,
});

// Keep test endpoint for backward compatibility (no auth required)
const testProfilesPath = myRestApi.root.addResource('test-profiles');
testProfilesPath.addMethod('GET', getUserProfilesForRecommendationIntegration, {
  authorizationType: AuthorizationType.NONE,
});

// Add the updateApplicationStatus API endpoint
const updateApplicationStatusPath = myRestApi.root.addResource('updateApplicationStatus');
updateApplicationStatusPath.addMethod('POST', updateApplicationStatusIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

// Add the refreshResumeData API endpoint (temporarily disabled)
// const refreshResumeDataPath = myRestApi.root.addResource('refreshResumeData');
// refreshResumeDataPath.addMethod('POST', refreshResumeDataIntegration, {
//   authorizationType: AuthorizationType.COGNITO,
//   authorizer: cognitoAuthorizer,
// });
// refreshResumeDataPath.addMethod('OPTIONS', refreshResumeDataIntegration, {
//   authorizationType: AuthorizationType.NONE,
// });

// Grant the getUsers Lambda function permission to read from the User table
// Add permissions to access the DynamoDB table
backend.getUsers.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the getLabs Lambda function permission to read from the Lab table
backend.getLabs.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the addUserToLab Lambda function permission to read and write to the User and Lab tables
backend.addUserToLab.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the removeUserFromLab Lambda function permission to read and write to the User and Lab tables
backend.removeUserFromLab.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the getJobs Lambda function permission to read from the Job and Lab tables
backend.getJobs.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the createJob Lambda function permission to read and write to the Job and Lab tables
backend.createJob.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the updateJob Lambda function permission to read and write to the Job and Lab tables
backend.updateJob.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the deleteJob Lambda function permission to read and delete from the Job and Lab tables
backend.deleteJob.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:DeleteItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the applyToJob Lambda function permission to read and write to the Job and Application tables
backend.applyToJob.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the getJobApplications Lambda function permission to read from the Job, Match, and User tables
backend.getJobApplications.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant lab management functions DynamoDB permissions
backend.createLab.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:PutItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

backend.updateLab.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

backend.deleteLab.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:DeleteItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the createUser Lambda function permission to create users in Cognito and write to the User table
backend.createUser.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminAddUserToGroup',
      'dynamodb:PutItem',
      'dynamodb:GetItem'
    ],
    resources: ['*']
  })
);

// Add USER_POOL_ID environment variable to the createUser Lambda function
backend.createUser.addEnvironment('USER_POOL_ID', backend.auth.resources.userPool.userPoolId);

// Grant the uploadResume Lambda function permission to generate S3 pre-signed URLs
backend.uploadResume.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:PutObject', 's3:GetObject', 's3:HeadObject', 's3:ListBucket'],
    resources: [
      'arn:aws:s3:::amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t',
      'arn:aws:s3:::amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t/*'
    ]
  })
);

// Add RESUME_BUCKET environment variable to the uploadResume Lambda function
backend.uploadResume.addEnvironment('RESUME_BUCKET_NAME', 'amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t');

// Add RESUME_BUCKET environment variable to the getResumeUrl Lambda function
backend.getResumeUrl.addEnvironment('RESUME_BUCKET_NAME', 'amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t');

// Grant the updateUserResume Lambda function permission to access DynamoDB
backend.updateUserResume.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:PutItem'],
    resources: ['*']  // For stricter security, you should limit this to your specific table ARN
  })
);

// Grant the getResumeUrl Lambda function permission to generate pre-signed URLs for S3 objects
backend.getResumeUrl.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:GetObject', 's3:ListBucket'],
    resources: [
      'arn:aws:s3:::amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t',
      'arn:aws:s3:::amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t/*'
    ]
  })
);

// Grant the getUserProfilesForRecommendation Lambda function permission to read from the User table
backend.getUserProfilesForRecommendation.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Grant the updateApplicationStatus Lambda function permission to update Match records
backend.updateApplicationStatus.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:ListTables'],
    resources: ['*']  // Need broader permissions to list tables
  })
);

// Add environment variable for refreshResumeData to reference enhanceApplicationsWithResumeData (temporarily disabled)
// backend.refreshResumeData.addEnvironment('ENHANCE_LAMBDA_NAME', backend.enhanceApplicationsWithResumeData.resources.lambda.functionName);

// Grant the refreshResumeData Lambda function permission to invoke enhanceApplicationsWithResumeData (temporarily disabled)
// backend.refreshResumeData.resources.lambda.addToRolePolicy(
//   new PolicyStatement({
//     actions: ['lambda:InvokeFunction'],
//     resources: [backend.enhanceApplicationsWithResumeData.resources.lambda.functionArn]
//   })
// );

// Grant the enhanceApplicationsWithResumeData Lambda function permission to access DynamoDB (temporarily disabled)
// backend.enhanceApplicationsWithResumeData.resources.lambda.addToRolePolicy(
//   new PolicyStatement({
//     actions: ['dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:ListTables'],
//     resources: ['*']  // Need broader permissions to list tables and work with application/user data
//   })
// );

// Add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
        apiKey: apiKey.keyId,
      },
    },
  },
});

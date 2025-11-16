import { defineFunction } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const getResumeUrl = defineFunction({
  name: 'getResumeUrlFunction',
  entry: './handler.ts',
  environment: {
    RESUME_BUCKET_NAME: 'amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t'
  },
  timeoutSeconds: 30,
  memoryMB: 128,
  permissions: [
    new PolicyStatement({
      actions: [
        's3:GetObject',
        's3:ListBucket'
      ],
      resources: [
        'arn:aws:s3:::amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t',
        'arn:aws:s3:::amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t/*'
      ]
    })
  ]
}); 
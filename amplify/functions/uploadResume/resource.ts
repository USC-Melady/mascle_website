import { defineFunction } from '@aws-amplify/backend';

export const uploadResume = defineFunction({
  name: 'uploadResume',
  entry: './handler.ts',
  environment: {
    RESUME_BUCKET_NAME: 'amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t'
  }
}); 
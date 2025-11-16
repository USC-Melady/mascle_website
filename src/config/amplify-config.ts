// This file configures the Amplify frontend to use the backend
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

// Configure Amplify
export const configureAmplify = () => {
  // Configure Amplify with the exported configuration
  Amplify.configure({
    ...awsExports,
    Auth: {
      Cognito: {
        ...awsExports.Auth.Cognito,
        loginWith: {
          email: true,
          username: false,
          phone: false
        }
      }
    },
    API: {
      REST: {
        default: {
          endpoint: 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev',
          region: 'us-east-1'
        },
        jobs: {
          endpoint: 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev/jobs',
          region: 'us-east-1'
        }
      },
      ...awsExports.API
    }
  });
  
  // Log configuration status
  console.log('Amplify configured with aws-exports:', JSON.stringify(awsExports, null, 2));
  
  // Add debugging to help identify configuration issues
  try {
    const config = Amplify.getConfig();
    console.log('Current Amplify configuration:', JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error getting Amplify configuration:', error);
  }
};

export default configureAmplify; 
const { 
  DynamoDBClient, 
  ScanCommand, 
  UpdateItemCommand, 
  GetItemCommand,
  ListTablesCommand
} = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({});

/**
 * Lambda function to enhance applications with resume data
 * This function scans for applications without resume data, looks up the user's resume,
 * and updates the application records
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Find the relevant DynamoDB tables
    const { TableNames } = await client.send(new ListTablesCommand({}));
    
    const matchTable = TableNames.find(name => name.startsWith('Match-'));
    const userTable = TableNames.find(name => name.startsWith('User-'));
    
    console.log('Using tables:', { matchTable, userTable });
    
    if (!matchTable || !userTable) {
      throw new Error('Required database tables not found');
    }
    
    // Get all applications 
    const applicationsCommand = new ScanCommand({
      TableName: matchTable
    });
    
    const { Items } = await client.send(applicationsCommand);
    const applications = Items.map(item => unmarshall(item));
    
    console.log(`Found ${applications.length} total applications`);
    
    // Filter applications that need enhancement (missing resume data)
    const applicationsToEnhance = applications.filter(app => 
      !app.resumeUrl || !app.resumeDetails
    );
    
    console.log(`Found ${applicationsToEnhance.length} applications that need resume data`);
    
    // Process each application that needs enhancement
    const results = await Promise.all(
      applicationsToEnhance.map(async (application) => {
        try {
          const userId = application.userId || application.studentId;
          
          if (!userId) {
            console.log(`Application ${application.id} has no userId or studentId, skipping`);
            return { id: application.id, success: false, reason: 'No userId or studentId' };
          }
          
          // Get user data that includes resume information
          const getUserCommand = new GetItemCommand({
            TableName: userTable,
            Key: marshall({ id: userId })
          });
          
          const userResponse = await client.send(getUserCommand);
          
          if (!userResponse.Item) {
            console.log(`No user data found for userId: ${userId}`);
            return { id: application.id, success: false, reason: 'User not found' };
          }
          
          const user = unmarshall(userResponse.Item);
          
          // Extract resume data
          const resumeFileName = user.resumeFileName;
          let resumeDetails = null;
          let structuredResume = null;
          
          // Check for structured resume data first (new format)
          if (user.resume) {
            try {
              structuredResume = user.resume;
              console.log(`Found structured resume data for user ${userId}`);
            } catch (parseError) {
              console.error(`Error accessing structured resume data for user ${userId}:`, parseError);
            }
          }
          
          // Check for legacy resume data (JSON string)
          if (user.resumeData) {
            try {
              resumeDetails = JSON.parse(user.resumeData);
              console.log(`Found legacy resume data for user ${userId}`);
            } catch (parseError) {
              console.error(`Error parsing resume data for user ${userId}:`, parseError);
            }
          }
          
          // Use directly stored resumeUrl if available
          let resumeUrl = user.resumeUrl;
          
          // If no direct URL but we have a filename, construct the URL
          if (!resumeUrl && resumeFileName) {
            // Format: resumes/USER_ID/filename
            resumeUrl = `https://${process.env.RESUME_BUCKET || 'amplify-storage-bucket'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${resumeFileName}`;
          }
          
          // Prepare user details
          const userDetails = {
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            education: formatEducation(resumeDetails) || user.education || '',
            skills: formatSkills(resumeDetails) || user.skills || ''
          };
          
          // Only update if we have resume data
          if (resumeUrl || resumeDetails) {
            // Update the application with the resume data
            const updateCommand = new UpdateItemCommand({
              TableName: matchTable,
              Key: marshall({ id: application.id }),
              UpdateExpression: 'SET resumeUrl = :resumeUrl, resumeDetails = :resumeDetails, userDetails = :userDetails',
              ExpressionAttributeValues: marshall({
                ':resumeUrl': resumeUrl || null,
                ':resumeDetails': resumeDetails ? JSON.stringify(resumeDetails) : null,
                ':userDetails': userDetails
              })
            });
            
            await client.send(updateCommand);
            console.log(`Enhanced application ${application.id} with resume data for user ${userId}`);
            return { id: application.id, success: true };
          } else {
            console.log(`No resume data found for user ${userId}`);
            return { id: application.id, success: false, reason: 'No resume data found' };
          }
        } catch (error) {
          console.error(`Error enhancing application ${application.id}:`, error);
          return { id: application.id, success: false, error: error.message };
        }
      })
    );
    
    // Calculate success statistics
    const successCount = results.filter(r => r.success).length;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Enhanced ${successCount} of ${applicationsToEnhance.length} applications with resume data`,
        totalApplications: applications.length,
        applicationsEnhanced: successCount,
        results
      })
    };
  } catch (error) {
    console.error('Error in lambda execution:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error enhancing applications',
        error: error.message
      })
    };
  }
};

/**
 * Helper function to format education data from resume details
 */
function formatEducation(resumeDetails) {
  if (!resumeDetails || !resumeDetails.education || !Array.isArray(resumeDetails.education)) {
    return '';
  }
  
  return resumeDetails.education
    .filter(edu => edu.institution && edu.degree)
    .map(edu => {
      let graduationInfo = '';
      
      // Handle new date format (start and end dates)
      if (edu.graduationStartMonth && edu.graduationStartYear && 
          edu.graduationEndMonth && edu.graduationEndYear) {
        const startDate = `${edu.graduationStartMonth}/${edu.graduationStartYear}`;
        const endDate = `${edu.graduationEndMonth}/${edu.graduationEndYear}`;
        graduationInfo = ` (${startDate} - ${endDate})`;
      }
      // Handle legacy graduationDate format for backward compatibility
      else if (edu.graduationDate) {
        graduationInfo = ` (${edu.graduationDate})`;
      }
      
      // Include seniority and GPA if available
      let additionalInfo = '';
      if (edu.seniority || edu.gpa) {
        const parts = [];
        if (edu.seniority) parts.push(`Level: ${edu.seniority}`);
        if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
        additionalInfo = ` [${parts.join(', ')}]`;
      }
      
      return `${edu.degree} in ${edu.major} at ${edu.institution}${graduationInfo}${additionalInfo}`;
    })
    .join('\n');
}

/**
 * Helper function to format skills data from resume details
 */
function formatSkills(resumeDetails) {
  if (!resumeDetails || !resumeDetails.skills || !Array.isArray(resumeDetails.skills)) {
    return '';
  }
  
  return resumeDetails.skills
    .filter(skill => typeof skill === 'string' && skill.trim() !== '')
    .join(', ');
} 
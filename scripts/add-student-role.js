#!/usr/bin/env node
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('This script will add the "Student" role to a Cognito user');
console.log('-----------------------------------------------------');

const promptUserPool = () => {
  return new Promise((resolve) => {
    exec('aws cognito-idp list-user-pools --max-results 20', (error, stdout) => {
      if (error) {
        console.error('Error listing user pools:', error);
        rl.close();
        return;
      }
      
      try {
        const userPools = JSON.parse(stdout).UserPools;
        console.log('\nAvailable User Pools:');
        userPools.forEach((pool, index) => {
          console.log(`${index + 1}. ${pool.Name} (${pool.Id})`);
        });
        
        rl.question('\nEnter the number of the user pool to use: ', (answer) => {
          const poolIndex = parseInt(answer) - 1;
          if (poolIndex >= 0 && poolIndex < userPools.length) {
            resolve(userPools[poolIndex].Id);
          } else {
            console.log('Invalid selection. Please try again.');
            promptUserPool().then(resolve);
          }
        });
      } catch (e) {
        console.error('Error parsing user pools:', e);
        rl.close();
      }
    });
  });
};

const listUsers = (userPoolId) => {
  return new Promise((resolve) => {
    exec(`aws cognito-idp list-users --user-pool-id ${userPoolId} --limit 20`, (error, stdout) => {
      if (error) {
        console.error('Error listing users:', error);
        rl.close();
        return;
      }
      
      try {
        const users = JSON.parse(stdout).Users;
        console.log('\nAvailable Users:');
        users.forEach((user, index) => {
          const email = user.Attributes.find(attr => attr.Name === 'email')?.Value || 'No email';
          console.log(`${index + 1}. ${user.Username} (${email})`);
        });
        
        rl.question('\nEnter the number of the user to add the Student role to: ', (answer) => {
          const userIndex = parseInt(answer) - 1;
          if (userIndex >= 0 && userIndex < users.length) {
            resolve({
              userPoolId,
              username: users[userIndex].Username,
              email: users[userIndex].Attributes.find(attr => attr.Name === 'email')?.Value || 'No email'
            });
          } else {
            console.log('Invalid selection. Please try again.');
            listUsers(userPoolId).then(resolve);
          }
        });
      } catch (e) {
        console.error('Error parsing users:', e);
        rl.close();
      }
    });
  });
};

const addStudentRole = ({ userPoolId, username }) => {
  const command = `aws cognito-idp admin-add-user-to-group --user-pool-id ${userPoolId} --username ${username} --group-name Student`;
  
  console.log('\nExecuting command:');
  console.log(command);
  
  exec(command, (error, stdout) => {
    if (error) {
      console.error('\nError adding user to group:', error);
      
      // Check if group exists
      exec(`aws cognito-idp list-groups --user-pool-id ${userPoolId}`, (err, out) => {
        if (err) {
          console.error('Error listing groups:', err);
        } else {
          try {
            const groups = JSON.parse(out).Groups;
            const studentGroup = groups.find(g => g.GroupName === 'Student');
            
            if (!studentGroup) {
              console.log('\nThe "Student" group does not exist. Creating it now...');
              exec(`aws cognito-idp create-group --user-pool-id ${userPoolId} --group-name Student --description "Students who can apply to jobs"`, (createErr) => {
                if (createErr) {
                  console.error('Error creating Student group:', createErr);
                } else {
                  console.log('Student group created successfully. Trying to add user again...');
                  addStudentRole({ userPoolId, username });
                }
              });
            }
          } catch (e) {
            console.error('Error parsing groups:', e);
          }
        }
      });
      
      return;
    }
    
    console.log('\nSuccess! The user has been added to the Student group.');
    console.log('\nPlease try applying to a job again. The user should now have the correct permissions.');
    rl.close();
  });
};

const main = async () => {
  try {
    const userPoolId = await promptUserPool();
    const user = await listUsers(userPoolId);
    
    console.log('\nYou selected:');
    console.log(`User Pool: ${userPoolId}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    
    rl.question('\nAdd this user to the Student group? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        addStudentRole(user);
      } else {
        console.log('Operation cancelled.');
        rl.close();
      }
    });
  } catch (error) {
    console.error('An error occurred:', error);
    rl.close();
  }
};

main(); 
#!/bin/bash

# Set your AWS profile (if necessary)
# export AWS_PROFILE=your-profile-name

# Email addresses to delete
EMAILS_TO_DELETE=("test@usc.edu" "test2@usc.edu")

# Table names - update these with your actual table names
USER_TABLE="User-fdob2vhf5rcx5nmzeui5vspzqu-NONE"
LAB_TABLE="Lab-fdob2vhf5rcx5nmzeui5vspzqu-NONE"
JOB_TABLE="Job-fdob2vhf5rcx5nmzeui5vspzqu-NONE"
MATCH_TABLE="Match-fdob2vhf5rcx5nmzeui5vspzqu-NONE"

# Function to delete user and all associated data
delete_user_and_associations() {
    local email="$1"
    echo "-------------------------"
    echo "Processing user with email: $email"
    
    # Find user by email - use expression attribute names to handle reserved keywords
    USER_QUERY_RESULT=$(aws dynamodb scan \
        --table-name $USER_TABLE \
        --filter-expression "email = :email" \
        --expression-attribute-values '{":email": {"S": "'$email'"}}' \
        --projection-expression "id,email,#userroles" \
        --expression-attribute-names '{"#userroles": "roles"}' \
        --output json)
    
    # Extract user ID
    USER_ID=$(echo $USER_QUERY_RESULT | jq -r '.Items[0].id.S // empty')
    
    if [ -z "$USER_ID" ]; then
        echo "No user found with email: $email"
        return
    fi
    
    # Extract user roles, handling the case when roles might be null or missing
    USER_ROLES=$(echo $USER_QUERY_RESULT | jq -r '.Items[0].roles.L[]?.S' 2>/dev/null)
    
    echo "Found user with ID: $USER_ID"
    echo "User roles: $USER_ROLES"
    
    # Find all associated data
    echo "Checking for associated data..."
    
    # Find labs where user is professor
    if [[ "$USER_ROLES" == *"Professor"* ]]; then
        LAB_QUERY_RESULT=$(aws dynamodb scan \
            --table-name $LAB_TABLE \
            --filter-expression "professorId = :userId OR contains(professorIds, :userId)" \
            --expression-attribute-values '{":userId": {"S": "'$USER_ID'"}}' \
            --projection-expression "labId,#name" \
            --expression-attribute-names '{"#name": "name"}' \
            --output json)
        
        LAB_COUNT=$(echo $LAB_QUERY_RESULT | jq -r '.Count')
        
        if [ "$LAB_COUNT" -gt 0 ]; then
            echo "Found $LAB_COUNT labs associated with this professor:"
            echo $LAB_QUERY_RESULT | jq -r '.Items[] | "  - Lab: \(.name.S) (ID: \(.labId.S))"'
        fi
    fi
    
    # Find jobs created by user
    if [[ "$USER_ROLES" == *"Professor"* || "$USER_ROLES" == *"LabAssistant"* ]]; then
        JOB_QUERY_RESULT=$(aws dynamodb scan \
            --table-name $JOB_TABLE \
            --filter-expression "professorId = :userId OR createdBy = :userId" \
            --expression-attribute-values '{":userId": {"S": "'$USER_ID'"}}' \
            --projection-expression "jobId,#title" \
            --expression-attribute-names '{"#title": "title"}' \
            --output json)
        
        JOB_COUNT=$(echo $JOB_QUERY_RESULT | jq -r '.Count')
        
        if [ "$JOB_COUNT" -gt 0 ]; then
            echo "Found $JOB_COUNT jobs created by this user:"
            echo $JOB_QUERY_RESULT | jq -r '.Items[] | "  - Job: \(.title.S) (ID: \(.jobId.S))"'
        fi
    fi
    
    # Find job applications if user is a student
    if [[ "$USER_ROLES" == *"Student"* ]]; then
        MATCH_QUERY_RESULT=$(aws dynamodb scan \
            --table-name $MATCH_TABLE \
            --filter-expression "studentId = :userId" \
            --expression-attribute-values '{":userId": {"S": "'$USER_ID'"}}' \
            --projection-expression "matchId,jobId" \
            --output json)
        
        MATCH_COUNT=$(echo $MATCH_QUERY_RESULT | jq -r '.Count')
        
        if [ "$MATCH_COUNT" -gt 0 ]; then
            echo "Found $MATCH_COUNT job applications from this student:"
            echo $MATCH_QUERY_RESULT | jq -r '.Items[] | "  - Application ID: \(.matchId.S) for Job: \(.jobId.S)"'
        fi
    fi
    
    # Ask for confirmation before deletion
    echo ""
    echo "WARNING: This will delete the user and potentially affect associated data!"
    read -p "Are you sure you want to delete this user? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deletion cancelled for $email."
        return
    fi
    
    # Delete associated data
    if [[ "$USER_ROLES" == *"Student"* && "$MATCH_COUNT" -gt 0 ]]; then
        echo "Deleting job applications from this student..."
        MATCH_IDS=$(echo $MATCH_QUERY_RESULT | jq -r '.Items[].matchId.S')
        for MATCH_ID in $MATCH_IDS; do
            echo "Deleting application: $MATCH_ID"
            aws dynamodb delete-item \
                --table-name $MATCH_TABLE \
                --key '{"matchId": {"S": "'$MATCH_ID'"}}' \
                > /dev/null
        done
    fi
    
    # Delete jobs (only if they're created by this user and you really want to remove them)
    # Note: This is dangerous and may affect other users, so commented out by default
    # Uncomment if you're sure you want to do this
    
    # if [[ "$JOB_COUNT" -gt 0 ]]; then
    #    echo "Deleting jobs created by this user..."
    #    JOB_IDS=$(echo $JOB_QUERY_RESULT | jq -r '.Items[].jobId.S')
    #    for JOB_ID in $JOB_IDS; do
    #        echo "Deleting job: $JOB_ID"
    #        aws dynamodb delete-item \
    #            --table-name $JOB_TABLE \
    #            --key '{"jobId": {"S": "'$JOB_ID'"}}' \
    #            > /dev/null
    #    done
    # fi
    
    # Labs are usually important data structures, so we update them rather than delete
    if [[ "$LAB_COUNT" -gt 0 ]]; then
        echo "WARNING: Will not delete labs. You should reassign these labs to another professor!"
        echo "You would need to manually update the labs."
    fi
    
    # Finally, delete the user
    echo "Deleting user: $email (ID: $USER_ID)..."
    DELETE_RESULT=$(aws dynamodb delete-item \
        --table-name $USER_TABLE \
        --key '{"id": {"S": "'$USER_ID'"}}' \
        --return-values ALL_OLD)
    
    echo "User $email has been deleted."
    echo "Deleted user data: $DELETE_RESULT"
}

# Main loop
for email in "${EMAILS_TO_DELETE[@]}"; do
    delete_user_and_associations "$email"
done

echo "-------------------------"
echo "Process completed."
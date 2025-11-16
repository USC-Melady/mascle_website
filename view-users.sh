#!/bin/bash
TABLE_NAME="User-3izs4njl3bfj5m7mmysz2zbwz4-NONE"
users=$(aws dynamodb scan --table-name $TABLE_NAME --output json)
echo "$users" | jq -r ".Items[] | {id: .id.S, email: .email.S, givenName: (.givenName.S // \"N/A\"), fullName: (.fullName.S // \"N/A\"), roles: [.roles.L[].S], status: .status.S, createdAt: .createdAt.S, emailVerified: .emailVerified.BOOL} | to_entries | map(\"\(.key): \(.value)\") | .[]"
echo -e "
Total users: $(echo "$users" | jq ".Count")"



# aws dynamodb scan --table-name User-3izs4njl3bfj5m7mmysz2zbwz4-NONE --attributes-to-get "id" --query "Items[*].id.S" | jq -r '.[]' | while read id; do aws dynamodb delete-item --table-name User-3izs4njl3bfj5m7mmysz2zbwz4-NONE --key "{\"id\":{\"S\":\"$id\"}}"; done


# aws dynamodb update-item --table-name User-3izs4njl3bfj5m7mmysz2zbwz4-NONE --key '{"id": {"S": "94d8a4b8-1011-7040-0cf9-0543e9050d8b"}}' --update-expression "SET #r = :roles" --expression-attribute-names '{"#r": "roles"}' --expression-attribute-values '{":roles": {"L": [{"S": "Admin"}]}}' --return-values ALL_NEW
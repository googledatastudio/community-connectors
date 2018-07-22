#!/bin/sh

echo "Running deploy script..." &&
cd src &&
version_description=`git log --oneline -1 | cat` && # e.g. ec2ab6f My commit message
echo "Pushing code..." &&
clasp push &&
echo "Creating new version: $version_description" &&
version_number=`clasp version "$version_description" | grep -o '[0-9][0-9]*' | tail -1` &&
echo "Created version $version_number" &&
deploy_env=$1 &&
deployment_id=`clasp deployments | cat | grep "$deploy_env" | cut -d' ' -f2` &&
echo "Deploying version $version_number to $deploy_env (id: $deployment_id)" &&
clasp redeploy $deployment_id $version_number $deploy_env &&
echo "Deployed version $version_number to $deploy_env" &&
cd ..

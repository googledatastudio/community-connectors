#!/bin/bash

### Usage

## $ deploy.sh

## You will then be prompted for the new version for package.json. This version
## will be tied to an appsscript version. We use this new package.json version
## along with the new appscript version to the create a new deployment tied to
## that.

# Set the version prefix to be the name in package.json with a -v at the end
VERSION_PREFIX="$(node -p -e "require('./package.json').name")-v"
yarn config set version-tag-prefix "$VERSION_PREFIX"

# Update the version in package.json
yarn version

# Push all files up to this point using clasp
(cd src; npx @google/clasp push)

# Create a new version via clasp
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
(cd src; npx @google/clasp version $PACKAGE_VERSION)

# Uses clasp to get a list of all deployments, then does some string
# manipulation to pull out the bit we want. This takes the original output of

# ~ 7 Versions ~
# 1 - 0.0.3
# 2 - 0.0.4
# 3 - 0.0.5
# 4 - 0.0.7
# 5 - 0.0.7
# 6 - 0.0.8
# 7 - 0.0.9

# then turns it into
# 7 - 0.0.9

# then turns it into
# 7
CLASP_VERSION=$(cd src; npx @google/clasp versions | tail -n 1 | cut -f1 -d'-')
(cd src; npx @google/clasp deploy $CLASP_VERSION $PACKAGE_VERSION)

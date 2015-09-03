#!/bin/sh
set -ex

# ------------------------------------------------------------------------------
# This script is supposed to be called from Travis continuous integration server
#
# It expects that a sencha build environment (with a properly configured
# workspace and the right sencha Cmd …) has previously been set up. See the
# accompanying script `ci/create-sencha-environment.sh`.
#
# To configure this script (with regard to pathes etc.), edit the variables in
# the script `ci/shared.sh`.
# ------------------------------------------------------------------------------

# Load variables and the 'running-on-travis'-check
. $TRAVIS_BUILD_DIR/ci/shared.sh

# Cleanup (there shouldn't be anything left over, but let's make sure)
rm -Rf $GEOEXT_IN_SENCHA_WS_FOLDER/*

# copy the relevant resources instead of cloning the repo/PR again
for COPY_RESOURCE in $COPY_RESOURCES
do
    cp -r $TRAVIS_BUILD_DIR/$COPY_RESOURCE $GEOEXT_IN_SENCHA_WS_FOLDER
done

# Switch to the now properly filled directory in the sencha workspace
cd $GEOEXT_IN_SENCHA_WS_FOLDER

# Remove GeoExt package (if any)
$SENCHA_CMD package remove $GEOEXT_PACKAGE_NAME

# Build the package
$SENCHA_CMD package build

# Add the package to the local repo
$SENCHA_CMD package add $SENCHA_WS/build/$GEOEXT_PACKAGE_NAME/$GEOEXT_PACKAGE_NAME.pkg

# TODO we could actually try to use the package now in an application that
#      wants to use the GeoExt package
# TODO It'd be nice if the result of that build process could be made available
#      on the gh-pages repository, but this is a task for another day

# We're done
exit 0

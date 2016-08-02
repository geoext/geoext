#!/usr/bin/env bash
set -e

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

if [ -f "$TRAVIS_BUILD_DIR/ci/shared.sh" ]; then
    # Load variables and the 'running-on-travis'-check
    source $TRAVIS_BUILD_DIR/ci/shared.sh
else
    echo "Failed to find shared.sh."
    exit 1;
fi

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

# Output the contents of the build dir (for informational purposes)
mkdir -p $STATS_DIR
cp $SENCHA_WS/build/$GEOEXT_PACKAGE_NAME/$GEOEXT_PACKAGE_NAME.pkg $STATS_DIR
cd $STATS_DIR
unzip -q $GEOEXT_PACKAGE_NAME.pkg

FILESIZE_PKG=$(du -k "$STATS_DIR/$GEOEXT_PACKAGE_NAME.pkg" | cut -f1)
FILESIZE_JS_DEBUG=$(du -k "$STATS_DIR/build/$GEOEXT_PACKAGE_NAME-debug.js" | cut -f1)
FILESIZE_JS=$(du -k "$STATS_DIR/build/$GEOEXT_PACKAGE_NAME.js" | cut -f1)

echo "Size of $GEOEXT_PACKAGE_NAME.pkg = $FILESIZE_PKG kb"
echo "Size of $GEOEXT_PACKAGE_NAME.js = $FILESIZE_JS kb"
echo "Size of $GEOEXT_PACKAGE_NAME-debug.js = $FILESIZE_JS_DEBUG kb"

cd $TRAVIS_BUILD_DIR
rm -Rf $STATS_DIR

# We're done
exit 0

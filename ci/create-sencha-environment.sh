#!/bin/sh
set -ex

# ------------------------------------------------------------------------------
# This script is supposed to be called from Travis continuous integration server
#
# It sets up a sencha build environment (with a properly configured
# workspace and the right sencha Cmd …) so that the accompanying script
# `ci/create-sencha-package.sh` can actually build and add the GeoExt package.
#
# To configure this script (with regard to pathes etc.), edit the variables in
# the script `ci/shared.sh`.
# ------------------------------------------------------------------------------

# Load variables and the 'running-on-travis'-check
. $TRAVIS_BUILD_DIR/ci/shared.sh

# create directories (if needed), will not fail if they are there already
mkdir -p $DOWN_DIR
mkdir -p $INSTALL_DIR

# Many of the commands below check if a resource or directory already exists,
# this is here because the relevant directories are cached by travis and may
# already be there from a previous build.

cd $DOWN_DIR

# DOWNLOAD (if needed)
# 1) Sencha cmd (v6.0.0.202)
if [ ! -f "SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip" ]; then
    wget "http://cdn.sencha.com/cmd/$SENCHA_CMD_VERSION/no-jre/SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip"
fi

# 2) Ext JS (v6.0.0.640)
if [ ! -f "ext-$SENCHA_EXTJS_VERSION-gpl.zip" ]; then
    wget "http://cdn.sencha.com/ext/gpl/ext-$SENCHA_EXTJS_VERSION-gpl.zip"
fi

# EXTRACT (if needed)
# 1) Sencha cmd (v6.0.0.202)
if [ ! -f "SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh" ]; then
    unzip -q "SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh.zip"
fi

# 2) Ext JS (v6.0.0.640)
if [ ! -d "ext-$SENCHA_EXTJS_VERSION" ]; then
    unzip -q "ext-$SENCHA_EXTJS_VERSION-gpl.zip"
fi

# Install Sencha cmd
if [ ! -f $SENCHA_CMD ]; then
    ./SenchaCmd-$SENCHA_CMD_VERSION-linux-amd64.sh -q -dir $INSTALL_DIR
fi

# Create a sencha workspace using the downloaded ExtJS
if [ ! -d $SENCHA_WS ]; then
    $SENCHA_CMD -sdk $DOWN_DIR/ext-$SENCHA_EXTJS_VERSION generate workspace $SENCHA_WS
fi

# Create a folder for the GeoExt package
if [ ! -d $GEOEXT_IN_SENCHA_WS_FOLDER ]; then
    mkdir -p $GEOEXT_IN_SENCHA_WS_FOLDER
fi

# Initialize local repository
$SENCHA_CMD package repo init -name "$GEOEXT_REPO_NAME" -email "$GEOEXT_REPO_EMAIL"

# Back to the original working directory
cd $TRAVIS_BUILD_DIR

return 0
